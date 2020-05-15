import Scope from '../../scope';
import BlockBlot from '../block';
import ParentBlot from './parent';

/**
 * 【容器节点】
 */
class ContainerBlot extends ParentBlot {
  public static blotName = 'container';
  public static scope = Scope.BLOCK_BLOT;
  public static tagName: string;

  public prev!: BlockBlot | ContainerBlot | null;
  public next!: BlockBlot | ContainerBlot | null;
  /**
   * 检查是当前容器Blot实例和它的下一个兄弟Blot实例是否相同。
   */
  public checkMerge(): boolean {
    return (
      this.next !== null && this.next.statics.blotName === this.statics.blotName
    );
  }

  public deleteAt(index: number, length: number): void {
    super.deleteAt(index, length);
    this.enforceAllowedChildren();
  }

  public formatAt(
    index: number,
    length: number,
    name: string,
    value: any,
  ): void {
    super.formatAt(index, length, name, value);
    this.enforceAllowedChildren();
  }

  public insertAt(index: number, value: string, def?: any): void {
    super.insertAt(index, value, def);
    this.enforceAllowedChildren();
  }
  /**
   * 当前blot实例和下一个相同的blot实例合并
   * @param context 
   */
  public optimize(context: { [key: string]: any }): void {
    super.optimize(context);
    if (this.children.length > 0 && this.next != null && this.checkMerge()) {
      //把下一个blot 的子节点移动到 当前blot的子节点中
      this.next.moveChildren(this);
      //删除下一个blot
      this.next.remove();
    }
  }
}

export default ContainerBlot;
