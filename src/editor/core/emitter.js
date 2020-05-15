import EventEmitter from 'eventemitter3';
import instances from './instances';
import logger from './logger';

const debug = logger('quill:events');
const EVENTS = ['selectionchange', 'mousedown', 'mouseup', 'click'];

EVENTS.forEach(eventName => {
  document.addEventListener(eventName, (...args) => {
    Array.from(document.querySelectorAll('.ql-container')).forEach(node => {
      // console.log('ql-container', node);
      const quill = instances.get(node);
      if (quill && quill.emitter) {
        quill.emitter.handleDOM(...args);
      }
    });
  });
});

class Emitter extends EventEmitter {
  constructor() {
    super();
    this.listeners = {};
    this.on('error', debug.error);
  }

  emit(...args) {
    debug.log.call(debug, ...args);
    super.emit(...args);
  }

  handleDOM(event, ...args) {
    // console.log('handleDOM', event, this.listeners[event.type]);
    (this.listeners[event.type] || []).forEach(({ node, handler }) => {
      if (event.target === node || node.contains(event.target)) {
        // console.log(node.contains(event.target), handler)
        handler(event, ...args);
      }
    });
  }

  listenDOM(eventName, node, handler) {
    // console.log('listenDOM', eventName, node);
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push({ node, handler });
  }
}

/**
 * text-change : Quill内容改变时触发。提供了具体的变化细节，以及更改前的内容，还有更改的来源。如果更改来自用户那么来源为：‘user’。
 * 例如：
  用户向编辑器中输入
  用户通过工具栏格式化文本
  用户通过快捷键执行撤销操作
  用户使用操作系统拼写更正
  通过API也可能会发生更改，但是只要他们来自用户，提供的来源仍然是‘user’。例如：当用户点击了工具栏，工具栏模块在技术上是调用Quill API来实现更改。但是来源仍然是‘user’，因为更改的根源是用户的点击。
  导致文本变化的API的来源可能为silent，这种情况下text-change将不会被调用执行。这个操作是不被推荐的，应为它可能会打破撤销堆栈和其他依赖于文本更改的完整记录功能。
  对文本的更改可能导致对其他选项的更改（如：光标移动），然而在text-change处理期间，其他选项尚未被更新，并且本地浏览器行为可能会使其处于不一致的状态。使用selection-change或者editor-change来获取可靠的选择更新。 
 * selection-change : 当用户或者API导致选择改变时调用，选择的范围作为界限。一个空范围表示选择丢失（通常由编辑器失去焦点引起）。你也可以通过检查调用事件的范围是否为空用作焦点更改事件。
    导致选择更改的API也可以是slient，这种情况下selection-change将不会被调用执行。如果selection-change存在副作用，这个是很有用的。例如：输入能够导致选择改变，但是如果每个字符都调用selection-change的话会变得非常混乱。
 * 
 * editor-change : 当text-change或者selection-change执行后会被调用执行，甚至来源是silent。第一个参数是事件名称，是text-change或者selection-change，随后的通常是传入处理函数的参数。
 * on : 添加事件监听。有关事件本身的更多信息，请参阅text-change或者selection-change。
 * 
 * 
 * 
 * 
 
  
 */
Emitter.events = {
  EDITOR_CHANGE: 'editor-change',
  SCROLL_BEFORE_UPDATE: 'scroll-before-update',
  SCROLL_BLOT_MOUNT: 'scroll-blot-mount',
  SCROLL_BLOT_UNMOUNT: 'scroll-blot-unmount',
  SCROLL_OPTIMIZE: 'scroll-optimize',
  SCROLL_UPDATE: 'scroll-update',
  SELECTION_CHANGE: 'selection-change',
  TEXT_CHANGE: 'text-change',
};
Emitter.sources = {
  API: 'api',
  SILENT: 'silent',
  USER: 'user',
};

export default Emitter;
