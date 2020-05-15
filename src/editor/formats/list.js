import Block from '../blots/block';
import Container from '../blots/container';
import Quill from '../core/quill';

const bullet = ['decimal', 'lower-alpha', 'lower-roman', 'upper-alpha', 'upper-roman'];
const ordered = ['circle', 'disc', 'square'];

class ListContainer extends Container {
  static create(value) {
    console.log('ListContainer create', value);
    var name = 'UL';
    if (value) {
      name = value.indexOf("ordered") === -1 ? 'UL' : 'OL'
    }
    let node = super.create(name);
    return node;
  }
}
ListContainer.blotName = 'list-container';
ListContainer.tagName = ["OL", "UL"];

class ListItem extends Block {
  static create(value) {
    console.log('ListItem create', value);
    const node = super.create();
    node.setAttribute('data-list', value);
    return node;
  }

  static formats(domNode) {
    return domNode.getAttribute('data-list') || undefined;
  }

  static register() {
    Quill.register(ListContainer);
  }
  /**
   * Blot类的构造函数，通过domNode实例化blot
   * 在这里可以做一些通常在class的构造函数中做的事情，比如：事件绑定，缓存引用等。
   * @param {*} scroll 
   * @param {*} domNode 
   */
  constructor(scroll, domNode) {
    super(scroll, domNode);
    const ui = domNode.ownerDocument.createElement('span');
    const listEventHandler = e => {
      if (!scroll.isEnabled()) return;
      const format = this.statics.formats(domNode, scroll);
      if (format === 'checked') {
        this.format('list', 'unchecked');
        e.preventDefault();
      } else if (format === 'unchecked') {
        this.format('list', 'checked');
        e.preventDefault();
      }
    };
    ui.addEventListener('mousedown', listEventHandler);
    ui.addEventListener('touchstart', listEventHandler);
    this.attachUI(ui);
  }

  format(name, value) {
    if (name === this.statics.blotName && value) {
      this.domNode.setAttribute('data-list', value);
    } else {
      super.format(name, value);
    }
  }
}
ListItem.blotName = 'list';
ListItem.tagName = 'LI';

ListContainer.allowedChildren = [ListItem];
ListItem.requiredContainer = ListContainer;

export { ListContainer, ListItem as default };
