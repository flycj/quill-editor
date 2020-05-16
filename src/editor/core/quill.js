import Delta from 'quill-delta';
import * as Parchment from '../parchment';
import extend from 'extend';
import Editor from './editor';
import Emitter from './emitter';
import Module from './module';
import Selection, { Range } from './selection';
import instances from './instances';
import logger from './logger';
import Theme from './theme';

const debug = logger('quill');

const globalRegistry = new Parchment.Registry();
Parchment.ParentBlot.uiClass = 'ql-ui';

class Quill {
  /**
   * 静态方法，给定一个日志等级启用日志信息。等级：error、warn、log或者info。传入true和log相同。传入false关闭所有日志信息。
   * @param {*} limit 
   */
  static debug(limit) {
    if (limit === true) {
      limit = 'log';
    }
    logger.level(limit);
  }
  /**
   * 静态方法，返回给定的DOM节点的Quill或者Blot实例。后面一种情况下，如果传入的参数为bubble，则会向上查询DOM的父节点，直到找到相应的Blot。
   * @param {*} node 
   */
  static find(node) {
    return instances.get(node) || globalRegistry.find(node);
  }
  /**
   * 静态方法，返回Quill库、格式、模块或者主题。一般来说，路径应该完全映射到Quill的源代码目录结构。除非额外说明，返回的尸体的修改可能破话所需的功能，强烈建议不要修改。
   * @param {*} name 
   */
  static import(name) {
    if (this.imports[name] == null) {
      debug.error(`Cannot import ${name}. Are you sure it was registered?`);
    }
    return this.imports[name];
  }
  /**
   * 用来注册模块、主题或者格式，使其能够可以添加到编辑器中。之后可以通过Quill.import进行检索。使用formats/、modules/或者themes/的路径前缀分别注册格式、模块或者主题。相同的路径将会覆盖现有的定义。
   * @param {*} path 
   * @param {*} target 
   * @param {*} overwrite 
   */
  static register(path, target, overwrite = false) {
    if (typeof path !== 'string') {
      const name = path.attrName || path.blotName;
      if (typeof name === 'string') {
        // register(Blot | Attributor, overwrite)
        this.register(`formats/${name}`, path, target);
      } else {
        Object.keys(path).forEach(key => {
          this.register(key, path[key], target);
        });
      }
    } else {
      if (this.imports[path] != null && !overwrite) {
        debug.warn(`Overwriting ${path} with`, target);
      }
      this.imports[path] = target;
      if (
        (path.startsWith('blots/') || path.startsWith('formats/')) &&
        target.blotName !== 'abstract'
      ) {
        globalRegistry.register(target);
      }
      if (typeof target.register === 'function') {
        target.register(globalRegistry);
      }
    }
  }
  /**
   * 
   * @param {*} container 
   * @param {*} options 
   * bounds Default：document.body DOM元素或者一个DOM元素的css选择器，其中编辑器的UI元素（例如：tooltips）应该被包含其中。目前，只考虑左右边界。
   * debug Default：warn debug的开关。注意：debug是一个静态方法并且会影响同一个页面的其它编辑器实例。只用警告和错误信息是默认启用的。
   * formats Default：All formats （菜单选项） 在编辑器中允许的格式白名单。请参阅格式化以获取完整列表。
   * modules 包含的模块和相应的选项。请参阅模块以获取更多信息。
   * placeholder Default：none 编辑器为空时显示的占位符。
   * readOnly Default：false 是否将编辑器是实例设置为只读模式。
   * scrollingContainer Default：null DOM元素或者一个DOM元素的css选择器，指定改容器具有滚动条（例如：overflow-y: auto），如果已经被用户自定义了默认的ql-editor。当Quill设置为自动适应高度是，需要修复滚动跳转的错误，并且另一个父容器负责滚动。 注意：当使用body时，一些浏览器仍然会跳转。可以使用一个单独的div子节点来避免这种情况。
   * strict Default：true 根据对semver的严格解释，一些改进和修改将保证主要版本的碰撞。为了防止扩大版本号的微小变化，它们被这个严格的标志禁止。具体的变化可以在Changelog中找到并搜索“strict”。将其设置为false可能会影响将来的改进。
   * theme 使用的主题名称。内置的选项有“bubble”和“snow”。无效或者假的值将加载默认的最小主题。注意：主题的特定样式仍然需要手动包含。请参阅主题了解更多信息。
   * */
  constructor(container, options = {}) {
    this.options = expandConfig(container, options);
    this.container = this.options.container;
    if (this.container == null) {
      return debug.error('Invalid Quill container', container);
    }
    if (this.options.debug) {
      Quill.debug(this.options.debug);
    }
    // console.log('Quill init 0', options);
    const html = this.container.innerHTML.trim();
    this.container.classList.add('ql-container');
    this.container.innerHTML = '';
    instances.set(this.container, this);
    this.root = this.addContainer('ql-editor');
    this.root.classList.add('ql-blank');
    this.root.setAttribute('data-gramm', false);
    this.scrollingContainer = this.options.scrollingContainer || this.root;
    this.emitter = new Emitter();
    const ScrollBlot = this.options.registry.query(
      Parchment.ScrollBlot.blotName,
    );
    this.scroll = new ScrollBlot(this.options.registry, this.root, {
      emitter: this.emitter,
    });
    // console.log('Quill init 1');
    this.editor = new Editor(this.scroll);
    this.selection = new Selection(this, this.scroll, this.emitter);
    // console.log('Quill init 2');
    this.theme = new this.options.theme(this, this.options); // eslint-disable-line new-cap
    // console.log('Quill init 3');
    this.keyboard = this.theme.addModule('keyboard');
    this.clipboard = this.theme.addModule('clipboard');
    this.history = this.theme.addModule('history');
    this.uploader = this.theme.addModule('uploader');
    // console.log('Quill init 4');
    this.theme.init();
    // console.log("Quill init")
    this.emitter.on(Emitter.events.EDITOR_CHANGE, type => {
      console.log('Emitter.events.EDITOR_CHANGE', Emitter.events.EDITOR_CHANGE, type);
      if (type === Emitter.events.TEXT_CHANGE) {
        this.root.classList.toggle('ql-blank', this.editor.isBlank());
      }
    });
    this.emitter.on(Emitter.events.SCROLL_UPDATE, (source, mutations) => {
      const oldRange = this.selection.lastRange;
      const [newRange] = this.selection.getRange();
      const selectionInfo =
        oldRange && newRange ? { oldRange, newRange } : undefined;
      modify.call(
        this,
        () => this.editor.update(null, mutations, selectionInfo),
        source,
      );
    });
    const contents = this.clipboard.convert({
      html: `${html}<p><br></p>`,
      text: '\n',
    });
    this.setContents(contents);
    this.history.clear();
    if (this.options.placeholder) {
      this.root.setAttribute('data-placeholder', this.options.placeholder);
    }
    if (this.options.readOnly) {
      this.disable();
    }
    this.allowReadOnlyEdits = false;
  }
  /**
   * 添加并返回一个Quill容器内绑定在编辑器上的容器。按照规定，Quill模块都必须有一个ql-的类名前缀。在这个容器插入之前，可以包含一个refNode，这个是可选的。
   * @param {*} container 
   * @param {*} refNode 
   */
  addContainer(container, refNode = null) {
    console.log('addContainer', container, refNode);
    if (typeof container === 'string') {
      const className = container;
      container = document.createElement('div');
      container.classList.add(className);
    }
    this.container.insertBefore(container, refNode);
    return container;
  }
  /**
   * 从编辑器中移除焦点。
   */
  blur() {
    this.selection.setRange(null);
  }
  /**
   * 从编辑器删除文本，返回一个改变的Delta对象。操作来源可能是：‘user’、‘api’或者‘silent’。当编辑器被禁用时，来源‘user’将被忽略。
   * @param {*} index 
   * @param {*} length 
   * @param {*} source 
   */
  deleteText(index, length, source) {
    [index, length, , source] = overload(index, length, source);
    return modify.call(
      this,
      () => {
        return this.editor.deleteText(index, length);
      },
      source,
      index,
      -1 * length,
    );
  }
  /**
   * 速记enable(false)
   */
  disable() {
    this.enable(false);
  }

  editReadOnly(modifier) {
    this.allowReadOnlyEdits = true;
    const value = modifier();
    this.allowReadOnlyEdits = false;
    return value;
  }
  /**
   * 设置编辑器能够通过输入设备（如鼠标或键盘）的能力。
   * @param {*} enabled 
   */
  enable(enabled = true) {
    this.scroll.enable(enabled);
    this.container.classList.toggle('ql-disabled', !enabled);
  }
  /**
   * 编辑器获取焦点到最后位置。
   */
  focus() {
    const { scrollTop } = this.scrollingContainer;
    console.log('触发 scroll focus')
    this.selection.focus();
    this.scrollingContainer.scrollTop = scrollTop;
    this.scrollIntoView();
  }
  /**
   * 格式化用户当前选择的文本，返回一个改变后的Delta对象。如果用户选择的长度为0，即使是一个光标，格式将被设置为激活状态，因此，用户键入的下一个字符将具有当前的格式。操作来源可能为：‘user’、‘api’或者‘silent’。当编辑器被禁用时，来源‘user’将被忽略。
   * @param {*} name 
   * @param {*} value 
   * @param {*} source 
   */
  format(name, value, source = Emitter.sources.API) {
    console.log('format', name, value, source);
    return modify.call(
      this,
      () => {
        const range = this.getSelection(true);
        let change = new Delta();
        if (range == null) return change;
        if (this.scroll.query(name, Parchment.Scope.BLOCK)) {
          change = this.editor.formatLine(range.index, range.length, {
            [name]: value,
          });
        } else if (range.length === 0) {
          this.selection.format(name, value);
          return change;
        } else {
          change = this.editor.formatText(range.index, range.length, {
            [name]: value,
          });
        }
        this.setSelection(range, Emitter.sources.SILENT);
        return change;
      },
      source,
    );
  }
  /**
   * 格式化给定范围内的所有行，返回一个改变后的Delta对象。请参阅格式化列表以获取可用的格式。要删除格式，参数请传false。用户的选择可能不会被保留。操作来源可能为：‘user’、‘api’或者‘silent’。当编辑器被禁用时，来源‘user’将被忽略。
   * @param {*} index 
   * @param {*} length 
   * @param {*} name 
   * @param {*} value 
   * @param {*} source 
   */
  formatLine(index, length, name, value, source) {
    let formats;
    // eslint-disable-next-line prefer-const
    [index, length, formats, source] = overload(
      index,
      length,
      name,
      value,
      source,
    );
    return modify.call(
      this,
      () => {
        return this.editor.formatLine(index, length, formats);
      },
      source,
      index,
      0,
    );
  }
  /**
   * 格式化编辑器中的文本，返回一个改变后的Delta对象。对于行级格式，例如文本对齐、定位换行符或者其他请使用formatLine帮助器。请参阅格式化列表以获取可用的格式。要删除格式，参数请传false。用户的选择可能不会被保留。操作来源可能为：‘user’、‘api’或者‘silent’。当编辑器被禁用时，来源‘user’将被忽略。
   * @param {*} index 
   * @param {*} length 
   * @param {*} name 
   * @param {*} value 
   * @param {*} source 
   */
  formatText(index, length, name, value, source) {
    let formats;
    
    // eslint-disable-next-line prefer-const
    [index, length, formats, source] = overload(
      index,
      length,
      name,
      value,
      source,
    );
    console.log('formatText', index, length, formats, source);
    return modify.call(
      this,
      () => {
        return this.editor.formatText(index, length, formats);
      },
      source,
      index,
      0,
    );
  }
  /**
   * 检索给定位置的像素位置（相对于编辑器容器）和选区的尺寸。用户的当前选择不需要在该索引处。用于计算工具提示的放置位置。
   * @param {*} index 
   * @param {*} length 
   */
  getBounds(index, length = 0) {
    let bounds;
    if (typeof index === 'number') {
      bounds = this.selection.getBounds(index, length);
    } else {
      bounds = this.selection.getBounds(index.index, index.length);
    }
    const containerBounds = this.container.getBoundingClientRect();
    return {
      bottom: bounds.bottom - containerBounds.top,
      height: bounds.height,
      left: bounds.left - containerBounds.left,
      right: bounds.right - containerBounds.left,
      top: bounds.top - containerBounds.top,
      width: bounds.width,
    };
  }
  /**
   * 检索编辑器的内容，格式化返回一个Delta对象。
   * @param {*} index 
   * @param {*} length 
   */
  getContents(index = 0, length = this.getLength() - index) {
    [index, length] = overload(index, length);
    return this.editor.getContents(index, length);
  }
  /**
   * 检索给定范围内文本的所用格式。对于返回的格式，范围内的所有文本存在一个拥有此格式。如果他们拥有不同的格式，那么将返回一个所有格式的数组。如果没有给定范围，那么将使用当前用户选择的范围。可以用来显示光标上已经设置的那些格式。如果无参调用，那么将使用当前用户选择的范围。
   * @param {*} index 
   * @param {*} length 
   */
  getFormat(index = this.getSelection(true), length = 0) {
    if (typeof index === 'number') {
      return this.editor.getFormat(index, length);
    }
    return this.editor.getFormat(index.index, index.length);
  }
  /**
   * 返回文档开始于给定的Blot之间的距离。
   * @param {*} blot 
   */
  getIndex(blot) {
    return blot.offset(this.scroll);
  }
  /**
   * 检索返回编辑器的内容长度。注意：即使Quill是空的，编辑器仍然有一个‘\n’表示的空行，所以getLength将返回1。
   */
  getLength() {
    return this.scroll.length();
  }
  /**
   * 返回文档给定索引出的叶子Blot。
   * @param {*} index 
   */
  getLeaf(index) {
    return this.scroll.leaf(index);
  }
  /**
   * 返回文档给定索引出的行级Blot。
   * @param {*} index 
   */
  getLine(index) {
    return this.scroll.line(index);
  }
  /**
   * 返回指定位置内的所有行。
   * @param {*} index 
   * @param {*} length 
   */
  getLines(index = 0, length = Number.MAX_VALUE) {
    if (typeof index !== 'number') {
      return this.scroll.lines(index.index, index.length);
    }
    return this.scroll.lines(index, length);
  }
  /**
   * 检索已经添加到编辑器的模块。
   * @param {*} name 
   */
  getModule(name) {
    return this.theme.modules[name];
  }
  /**
   * 检索用户的选择范围，可选地首先关注编辑器。除此之外，如果编辑没有焦点，可能会返回一个null。
   * @param {*} focus 
   */
  getSelection(focus = false) {
    if (focus) this.focus();
    this.update(); // Make sure we access getRange with editor in consistent state
    return this.selection.getRange()[0];
  }

  getSemanticHTML(index = 0, length = this.getLength() - index) {
    [index, length] = overload(index, length);
    return this.editor.getHTML(index, length);
  }
  /**
   * 检索并已字符串的方式返回编辑器的内容。非空字符串会被忽略，因此返回的字符串长度可能比getLength返回的编辑器长度短。注意：即使Quill为空，依然存在一个空行，所以在这种情况下getText会返回一个‘\n’。
   * @param {*} index 
   * @param {*} length 
   */
  getText(index = 0, length = this.getLength() - index) {
    [index, length] = overload(index, length);
    return this.editor.getText(index, length);
  }
  /**
   * 检查编辑器是否存在焦点。注意：工具栏、提示上的焦点，不能算编辑器的焦点。
   */
  hasFocus() {
    return this.selection.hasFocus();
  }
  /**
   * 向编辑器中插入嵌入式内容，返回一个改变后的Delta对象。操作来源可能为：‘user’、‘api’或者‘silent’。当编辑器被禁用时，来源‘user’将被忽略。
   * @param {*} index 
   * @param {blotName} embed 
   * @param {*} value 
   * @param {*} source 
   */
  insertEmbed(index, embed, value, source = Quill.sources.API) {
    return modify.call(
      this,
      () => {
        return this.editor.insertEmbed(index, embed, value);
      },
      source,
      index,
    );
  }
  /**
   * 向编辑器中插入文本，可以使用指定的格式或者多种格式。返回一个改变后的Delta对象。操作来源可能为：‘user’、‘api’或者‘silent’。当编辑器被禁用时，来源‘user’将被忽略。
   * @param {*} index 
   * @param {*} text 
   * @param {*} name 
   * @param {*} value 
   * @param {*} source 
   */
  insertText(index, text, name, value, source) {
    let formats;
    // eslint-disable-next-line prefer-const
    [index, , formats, source] = overload(index, 0, name, value, source);
    return modify.call(
      this,
      () => {
        return this.editor.insertText(index, text, formats);
      },
      source,
      index,
      text.length,
    );
  }

  isEnabled() {
    return this.scroll.isEnabled();
  }
  /**
   * 删除事件监听。
   * @param  {...any} args 
   */
  off(...args) {
    return this.emitter.off(...args);
  }
  /**
   * 添加事件监听。有关事件本身的更多信息，请参阅text-change或者selection-change。
   * @param  {...any} args 
   */
  on(...args) {
    return this.emitter.on(...args);
  }
  /**
   * 为一个方法添加第一次执行的事件。有关事件本身的更多信息，请参阅text-change或者selection-change。
   * @param  {...any} args 
   */
  once(...args) {
    return this.emitter.once(...args);
  }
  /**
   * 删除给定范围内的所有格式和嵌入，返回一个改变后的Delta对象。如果当前行的任何部分包含在范围内，行格式将被删除。用户的选择可能不会被保留。操作来源可能为：‘user’、‘api’或者‘silent’。当编辑器被禁用时，来源‘user’将被忽略。
   * @param {*} index 
   * @param {*} length 
   * @param {*} source 
   */
  removeFormat(index, length, source) {
    [index, length, , source] = overload(index, length, source);
    return modify.call(
      this,
      () => {
        return this.editor.removeFormat(index, length);
      },
      source,
      index,
    );
  }

  scrollIntoView() {
    this.selection.scrollIntoView(this.scrollingContainer);
  }
  /**
   * 用给定的内容覆盖编辑器的内容。内容应该以一个新行或者换行符结束。返回一个改变的Delta。如果被给定的Delta没有无效操作，那么就会作为新的Delta通过。操作来源可能为：‘user’、‘api’或者‘silent’。当编辑器被禁用时，来源‘user’将被忽略。
   * @param {*} delta 
   * @param {*} source 
   */
  setContents(delta, source = Emitter.sources.API) {
    return modify.call(
      this,
      () => {
        delta = new Delta(delta);
        const length = this.getLength();
        const deleted = this.editor.deleteText(0, length);
        const applied = this.editor.applyDelta(delta);
        const lastOp = applied.ops[applied.ops.length - 1];
        if (
          lastOp != null &&
          typeof lastOp.insert === 'string' &&
          lastOp.insert[lastOp.insert.length - 1] === '\n'
        ) {
          this.editor.deleteText(this.getLength() - 1, 1);
          applied.delete(1);
        }
        return deleted.compose(applied);
      },
      source,
    );
  }
  /**
   * 将用户的选择设置为给定的范围，这个主要用在编辑器上。提供null作为选择范围将模糊编辑器。来源可能是‘user’、‘api’或者‘silent’。
   * @param {*} index 
   * @param {*} length 
   * @param {*} source 
   */
  setSelection(index, length, source) {
    if (index == null) {
      this.selection.setRange(null, length || Quill.sources.API);
    } else {
      [index, length, , source] = overload(index, length, source);
      this.selection.setRange(new Range(Math.max(0, index), length), source);
      if (source !== Emitter.sources.SILENT) {
        this.selection.scrollIntoView(this.scrollingContainer);
      }
    }
  }
  /**
   * 使用给定的文本设置为编辑器的内容，返回一个改变后的Delta对象。注意：Quill文档必须以一个换行符结束，如果省略将会为你加一个。操作来源可能为：‘user’、‘api’或者‘silent’。当编辑器被禁用时，来源‘user’将被忽略。
   * @param {*} text 
   * @param {*} source 
   */
  setText(text, source = Emitter.sources.API) {
    const delta = new Delta().insert(text);
    return this.setContents(delta, source);
  }
  /**
   * 同步检查编辑器的用户更新和触发事件，如果发生变化。在冲突解决期间需要最新状态的协作用例非常有用。来源可能是‘user’、‘api’或者‘silent’。
   * @param {*} source 
   */
  update(source = Emitter.sources.USER) {
    console.log('update', source);
    const change = this.scroll.update(source); // Will update selection before selection.update() does if text changes
    this.selection.update(source);
    // TODO this is usually undefined
    return change;
  }
  /**
   * 将Delta应用于编辑器的内容，返回一个改变后的Delta对象。如果这个Delta通过没有无效的操作，那么这些Deltas将是相同的。操作来源可能为：‘user’、‘api’或者‘silent’。当编辑器被禁用时，来源‘user’将被忽略。
   * @param {*} delta 
   * @param {*} source 
   */
  updateContents(delta, source = Emitter.sources.API) {
    return modify.call(
      this,
      () => {
        delta = new Delta(delta);
        return this.editor.applyDelta(delta, source);
      },
      source,
      true,
    );
  }
}
Quill.DEFAULTS = {
  bounds: null,
  modules: {},
  placeholder: '',
  readOnly: false,
  registry: globalRegistry,
  scrollingContainer: null,
  theme: 'default',
};
Quill.events = Emitter.events;
Quill.sources = Emitter.sources;
// eslint-disable-next-line no-undef
Quill.version = typeof QUILL_VERSION === 'undefined' ? 'dev' : QUILL_VERSION;

Quill.imports = {
  delta: Delta,
  parchment: Parchment,
  'core/module': Module,
  'core/theme': Theme,
};

function expandConfig(container, userConfig) {
  userConfig = extend(
    true,
    {
      container,
      modules: {
        clipboard: true,
        keyboard: true,
        history: true,
        uploader: true,
      },
    },
    userConfig,
  );
  if (!userConfig.theme || userConfig.theme === Quill.DEFAULTS.theme) {
    userConfig.theme = Theme;
  } else {
    userConfig.theme = Quill.import(`themes/${userConfig.theme}`);
    if (userConfig.theme == null) {
      throw new Error(
        `Invalid theme ${userConfig.theme}. Did you register it?`,
      );
    }
  }
  const themeConfig = extend(true, {}, userConfig.theme.DEFAULTS);
  [themeConfig, userConfig].forEach(config => {
    config.modules = config.modules || {};
    Object.keys(config.modules).forEach(module => {
      if (config.modules[module] === true) {
        config.modules[module] = {};
      }
    });
  });
  const moduleNames = Object.keys(themeConfig.modules).concat(
    Object.keys(userConfig.modules),
  );
  const moduleConfig = moduleNames.reduce((config, name) => {
    const moduleClass = Quill.import(`modules/${name}`);
    if (moduleClass == null) {
      debug.error(
        `Cannot load ${name} module. Are you sure you registered it?`,
      );
    } else {
      config[name] = moduleClass.DEFAULTS || {};
    }
    return config;
  }, {});
  // Special case toolbar shorthand
  if (
    userConfig.modules != null &&
    userConfig.modules.toolbar &&
    userConfig.modules.toolbar.constructor !== Object
  ) {
    userConfig.modules.toolbar = {
      container: userConfig.modules.toolbar,
    };
  }
  userConfig = extend(
    true,
    {},
    Quill.DEFAULTS,
    { modules: moduleConfig },
    themeConfig,
    userConfig,
  );
  ['bounds', 'container', 'scrollingContainer'].forEach(key => {
    if (typeof userConfig[key] === 'string') {
      userConfig[key] = document.querySelector(userConfig[key]);
    }
  });
  userConfig.modules = Object.keys(userConfig.modules).reduce(
    (config, name) => {
      if (userConfig.modules[name]) {
        config[name] = userConfig.modules[name];
      }
      return config;
    },
    {},
  );
  return userConfig;
}

// Handle selection preservation and TEXT_CHANGE emission
// common to modification APIs
function modify(modifier, source, index, shift) {
  if (
    !this.isEnabled() &&
    source === Emitter.sources.USER &&
    !this.allowReadOnlyEdits
  ) {
    return new Delta();
  }
  let range = index == null ? null : this.getSelection();
  const oldDelta = this.editor.delta;
  const change = modifier();
  if (range != null) {
    if (index === true) {
      index = range.index; // eslint-disable-line prefer-destructuring
    }
    if (shift == null) {
      range = shiftRange(range, change, source);
    } else if (shift !== 0) {
      range = shiftRange(range, index, shift, source);
    }
    this.setSelection(range, Emitter.sources.SILENT);
  }
  if (change.length() > 0) {
    const args = [Emitter.events.TEXT_CHANGE, change, oldDelta, source];
    this.emitter.emit(Emitter.events.EDITOR_CHANGE, ...args);
    if (source !== Emitter.sources.SILENT) {
      this.emitter.emit(...args);
    }
  }
  return change;
}

function overload(index, length, name, value, source) {
  let formats = {};
  if (typeof index.index === 'number' && typeof index.length === 'number') {
    // Allow for throwaway end (used by insertText/insertEmbed)
    if (typeof length !== 'number') {
      source = value;
      value = name;
      name = length;
      length = index.length; // eslint-disable-line prefer-destructuring
      index = index.index; // eslint-disable-line prefer-destructuring
    } else {
      length = index.length; // eslint-disable-line prefer-destructuring
      index = index.index; // eslint-disable-line prefer-destructuring
    }
  } else if (typeof length !== 'number') {
    source = value;
    value = name;
    name = length;
    length = 0;
  }
  // Handle format being object, two format name/value strings or excluded
  if (typeof name === 'object') {
    formats = name;
    source = value;
  } else if (typeof name === 'string') {
    if (value != null) {
      formats[name] = value;
    } else {
      source = name;
    }
  }
  // Handle optional source
  source = source || Emitter.sources.API;
  return [index, length, formats, source];
}

function shiftRange(range, index, length, source) {
  if (range == null) return null;
  let start;
  let end;
  if (index instanceof Delta) {
    [start, end] = [range.index, range.index + range.length].map(pos =>
      index.transformPosition(pos, source !== Emitter.sources.USER),
    );
  } else {
    [start, end] = [range.index, range.index + range.length].map(pos => {
      if (pos < index || (pos === index && source === Emitter.sources.USER))
        return pos;
      if (length >= 0) {
        return pos + length;
      }
      return Math.max(index, pos + length);
    });
  }
  return new Range(start, end - start);
}

export { globalRegistry, expandConfig, overload, Quill as default };
