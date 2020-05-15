import Attributor from '../../attributor/attributor';
import LinkedList from '../../collection/linked-list';
import LinkedNode from '../../collection/linked-node';
import Scope from '../../scope';

export interface BlotConstructor {
  blotName: string;
  className?: string;
  tagName: string;
  new (scroll: Root, node: Node, value?: any): Blot;
  create(value?: any): Node;
}

export interface Blot extends LinkedNode {
  //顶级blot。
  scroll: Root;
  //父级blot，包含当前blot。若当前blot是顶级blot，则为null
  parent: Parent;
  //上一个同级blot, 与当前blot拥有同一个parent, 若当前blot为第一个child，则为null。
  prev: Blot | null;
  //下一个同级blot, 与当前blot拥有同一个parent, 若当前blot为最后一个child，则为null。
  next: Blot | null;
  //当前blot的DOM结构，该blot在DOM树中的实际结构
  domNode: Node;

  statics: {
    // Blots的白名单上数组，可以是直接的子节点
    allowedChildren?: BlotConstructor[];
    blotName: string;
    className?: string;
    // 默认节点，当节点为空时会被插入
    defaultChild?: BlotConstructor;
    requiredContainer?: BlotConstructor;
    scope: Scope;
    tagName: string;
  };

  attach(): void;
  clone(): Blot;
  /**
   * 解除一切blot与quill相关的引用关系，从blot的parent上移除自身，同时对children blot调用
   */
  detach(): void;
  isolate(index: number, length: number): Blot;
  // 对于子集，是Blot的长度
  // 对于父节点，是所有子节点的总和
  length(): number;
  // 返回当前Blot与父节点之间的偏移量
  offset(root?: Blot): number;
  /**
   * 该方法是最常用也最简单的完全移除blot及其domNode的方法。remove主要是将blot的domNode从DOM树中移除，并调用detach()。
   */
  remove(): void;
  replaceWith(name: string, value: any): Blot;
  replaceWith(replacement: Blot): Blot;
  split(index: number, force?: boolean): Blot | null;
  wrap(name: string, value: any): Parent;
  wrap(wrapper: Parent): Parent;
  /**
   * 如果适用，按照给定的指数和长度进行操作 , 经常会把响应转移到合适的子节点上
   * 该方法会根据给定的index及length来移除调用者的children中对应的blot及内容，若index为0且length为调用者的children的length, 则移除自身。
   * @param index 
   * @param length 
   */
  deleteAt(index: number, length: number): void;
  formatAt(index: number, length: number, name: string, value: any): void;
  insertAt(index: number, value: string, def?: any): void;
  /**
   * 更新循环完成后会被调用，避免在optimize方法中改变document的length和value。该方法中很适合做一些降低document复杂度的事。
      简单来说，文档的delta在optimize执行前后应该是一样的，没发生变化。否则，将引起性能损耗。
   * @param context 
   */
  optimize(context: { [key: string]: any }): void;
  optimize(mutations: MutationRecord[], context: { [key: string]: any }): void;
  /**
   * Blot发生变化时会被调用，参数mutation的target是blot.domNode。在同一次更新循环中，所有blots收到的sharedContext是相同的。
   * @param mutations 
   * @param context 
   */
  update(mutations: MutationRecord[], context: { [key: string]: any }): void;
}

export interface Parent extends Blot {
  children: LinkedList<Blot>;
  domNode: HTMLElement;

  appendChild(child: Blot): void;
  // 有用的后代搜索功能，不应该被修改
  descendant<T>(type: { new (): T }, index: number): [T, number];
  descendant<T>(matcher: (blot: Blot) => boolean, index: number): [T, number];
  descendants<T>(type: { new (): T }, index: number, length: number): T[];
  descendants<T>(
    matcher: (blot: Blot) => boolean,
    index: number,
    length: number,
  ): T[];
  insertBefore(child: Blot, refNode?: Blot): void;
  moveChildren(parent: Parent, refNode?: Blot): void;
  path(index: number, inclusive?: boolean): Array<[Blot, number]>;
  /**
   * 作用是从该containerBlot的.children中移除传入的blot。
   * @param child 
   */
  removeChild(child: Blot): void;
  unwrap(): void;
}
/**
 * 根结点， 包裹其余所有的blots
 */
export interface Root extends Parent {
  // 创建相应的节点
  create(input: Node | string | Scope, value?: any): Blot;
  find(node: Node | null, bubble?: boolean): Blot | null;
  query(
    query: string | Node | Scope,
    scope?: Scope,
  ): Attributor | BlotConstructor | null;
}

export interface Formattable extends Blot {
  // 返回格式代表的Blot，包括来自于Attributors的。
  format(name: string, value: any): void;
  // 如果是Blot的类型，返回domNode的格式化后的值
  // 不需要检查domNode是否为Blot的类型
  // 返回 blot 对应的Dom 节点的格式
  formats(): { [index: string]: any };
}

export interface Leaf extends Blot {
  // 给定一个node和一个在DOM选择范围内的偏移量，返回一个该位置的索引。
  index(node: Node, offset: number): number;
  // 给定一个Blot的位置信息坐标，返回当前节点在DOM可选范围的偏移量
  position(index: number, inclusive: boolean): [Node, number];
  // 返回当前Blot代表的值
  // 除了来自于API或者通过update检测的用户改变，不应该被改变。
  value(): any;
}
