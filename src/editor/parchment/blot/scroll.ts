import Attributor from '../attributor/attributor';
import Registry from '../registry';
import Scope from '../scope';
import { Blot, BlotConstructor, Root } from './abstract/blot';
import ContainerBlot from './abstract/container';
import ParentBlot from './abstract/parent';
import BlockBlot from './block';

const OBSERVER_CONFIG = {
  attributes: true,
  characterData: true,
  characterDataOldValue: true,
  childList: true,
  subtree: true,
};

const MAX_OPTIMIZE_ITERATIONS = 100;

/**
 * 文档的根节点，不可格式化
 * ScrollBlot是最顶层的ContainerBlot，它包裹其余所有的blots，并且管理编辑器内的内容变化。
 */
class ScrollBlot extends ParentBlot implements Root {
  public static blotName = 'scroll';
  public static defaultChild = BlockBlot;
  public static allowedChildren: BlotConstructor[] = [BlockBlot, ContainerBlot];
  public static scope = Scope.BLOCK_BLOT;
  public static tagName = 'DIV';

  public registry: Registry;
  public observer: MutationObserver;

  constructor(registry: Registry, node: HTMLDivElement) {
    // @ts-ignore
    super(null, node);
    this.registry = registry;
    this.scroll = this;
    this.build();
    this.observer = new MutationObserver((mutations: MutationRecord[]) => {
      this.update(mutations);
    });
    this.observer.observe(this.domNode, OBSERVER_CONFIG);
    this.attach();
  }

  public create(input: Node | string | Scope, value?: any): Blot {
    return this.registry.create(this, input, value);
  }

  public find(node: Node | null, bubble: boolean = false): Blot | null {
    return this.registry.find(node, bubble);
  }

  public query(
    query: string | Node | Scope,
    scope: Scope = Scope.ANY,
  ): Attributor | BlotConstructor | null {
    return this.registry.query(query, scope);
  }

  public register(...definitions: any[]): any {
    return this.registry.register(...definitions);
  }

  public build() {
    if (this.scroll == null) {
      return;
    }
    super.build();
  }

  public detach() {
    super.detach();
    this.observer.disconnect();
  }

  public deleteAt(index: number, length: number): void {
    this.update();
    if (index === 0 && length === this.length()) {
      this.children.forEach(child => {
        child.remove();
      });
    } else {
      super.deleteAt(index, length);
    }
  }

  public formatAt(
    index: number,
    length: number,
    name: string,
    value: any,
  ): void {
    this.update();
    super.formatAt(index, length, name, value);
  }

  public insertAt(index: number, value: string, def?: any): void {
    this.update();
    super.insertAt(index, value, def);
  }
  /**
   * 更新循环完成后会被调用，避免在optimize方法中改变document的length和value。该方法中很适合做一些降低document复杂度的事。
      简单来说，文档的delta在optimize执行前后应该是一样的，没发生变化。否则，将引起性能损耗。
   * @param context 
   */
  public optimize(context: { [key: string]: any }): void;
  public optimize(
    mutations: MutationRecord[],
    context: { [key: string]: any },
  ): void;
  public optimize(mutations: any = [], context: any = {}): void {
    super.optimize(context);
    const mutationsMap = context.mutationsMap || new WeakMap();
    // We must modify mutations directly, cannot make copy and then modify
    let records = Array.from(this.observer.takeRecords());
    // Array.push currently seems to be implemented by a non-tail recursive function
    // so we cannot just mutations.push.apply(mutations, this.observer.takeRecords());
    while (records.length > 0) {
      mutations.push(records.pop());
    }
    const mark = (blot: Blot | null, markParent: boolean = true) => {
      if (blot == null || blot === this) {
        return;
      }
      if (blot.domNode.parentNode == null) {
        return;
      }
      if (!mutationsMap.has(blot.domNode)) {
        mutationsMap.set(blot.domNode, []);
      }
      if (markParent) {
        mark(blot.parent);
      }
    };
    const optimize = (blot: Blot) => {
      // Post-order traversal
      if (!mutationsMap.has(blot.domNode)) {
        return;
      }
      if (blot instanceof ParentBlot) {
        blot.children.forEach(optimize);
      }
      mutationsMap.delete(blot.domNode);
      blot.optimize(context);
    };
    let remaining = mutations;
    for (let i = 0; remaining.length > 0; i += 1) {
      if (i >= MAX_OPTIMIZE_ITERATIONS) {
        throw new Error('[Parchment] Maximum optimize iterations reached');
      }
      remaining.forEach((mutation: MutationRecord) => {
        const blot = this.find(mutation.target, true);
        if (blot == null) {
          return;
        }
        if (blot.domNode === mutation.target) {
          if (mutation.type === 'childList') {
            mark(this.find(mutation.previousSibling, false));
            Array.from(mutation.addedNodes).forEach((node: Node) => {
              const child = this.find(node, false);
              mark(child, false);
              if (child instanceof ParentBlot) {
                child.children.forEach((grandChild: Blot) => {
                  mark(grandChild, false);
                });
              }
            });
          } else if (mutation.type === 'attributes') {
            mark(blot.prev);
          }
        }
        mark(blot);
      });
      this.children.forEach(optimize);
      remaining = Array.from(this.observer.takeRecords());
      records = remaining.slice();
      while (records.length > 0) {
        mutations.push(records.pop());
      }
    }
  }
  /**
   * Blot发生变化时会被调用，参数mutation的target是blot.domNode。在同一次更新循环中，所有blots收到的sharedContext是相同的。
   * @param mutations 
   * @param context 
   */
  public update(
    mutations?: MutationRecord[],
    context: { [key: string]: any } = {},
  ): void {
    mutations = mutations || this.observer.takeRecords();
    const mutationsMap = new WeakMap();
    mutations
      .map((mutation: MutationRecord) => {
        const blot = Registry.find(mutation.target, true);
        if (blot == null) {
          return null;
        }
        if (mutationsMap.has(blot.domNode)) {
          mutationsMap.get(blot.domNode).push(mutation);
          return null;
        } else {
          mutationsMap.set(blot.domNode, [mutation]);
          return blot;
        }
      })
      .forEach((blot: Blot | null) => {
        if (blot != null && blot !== this && mutationsMap.has(blot.domNode)) {
          blot.update(mutationsMap.get(blot.domNode) || [], context);
        }
      });
    context.mutationsMap = mutationsMap;
    if (mutationsMap.has(this.domNode)) {
      super.update(mutationsMap.get(this.domNode), context);
    }
    this.optimize(mutations, context);
  }
}

export default ScrollBlot;
