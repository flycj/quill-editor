import extend from 'extend';
import Emitter from '../core/emitter';
import Theme from '../core/theme';
import ColorPicker from '../ui/color-picker';
import IconPicker from '../ui/icon-picker';
import LineHeightPicker from '../ui/lineheight-picker';
import Picker from '../ui/picker';
import Tooltip from '../ui/tooltip';
import {isLink} from '../utils/index';
import Video from '../formats/video';

const ALIGNS = ['left', 'center', 'right', 'justify'];

const COLORS = [
  '#333333',
  '#ffffff',
  '#666666',
  '#4ca3ff',
  '#ef4b4b',
  '#A4782E'
];

const FONTS = [false, 'serif', 'monospace'];

const HEADERS = ['1', '2', '3', false];

const SIZES = ['20px', '18px', '16px', '14px', '12px'];

const LINEHEIGHTS = ['1', '1.5', '2', '2.5', '3'];

function handleVideoUrl(src) {
  var url = null
    , type = "";
  if (isLink(src)) {
    url = src;
    type = 'url';
  } else {
    url = src;
    type = 'other'
  }
  Object.keys(Video.lists).forEach(function(host) {
      var id = Video.lists[host].match(src);
      if (id) {
        url = Video.lists[host].value(id);
        type = Video.lists[host].type;
      }
  })
  return {
      url: url,
      type: type
  }
}

const randomKey = function(length) {
  void 0 === length && (length = 17);
  for (var t = []; length--; )
      t.push("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[parseInt(62 * Math.random())]);
  return t.join("")
}

class BaseTheme extends Theme {
  constructor(quill, options) {
    super(quill, options);
    const listener = e => {
      if (!document.body.contains(quill.root)) {
        document.body.removeEventListener('click', listener);
        return;
      }
      if (
        this.tooltip != null &&
        !this.tooltip.root.contains(e.target) &&
        document.activeElement !== this.tooltip.textbox &&
        !this.quill.hasFocus()
      ) {
        this.tooltip.hide();
      }
      if (this.pickers != null) {
        this.pickers.forEach(picker => {
          if (!picker.container.contains(e.target)) {
            picker.close();
          }
        });
      }
    };
    quill.emitter.listenDOM('click', document.body, listener);
  }

  addModule(name) {
    const module = super.addModule(name);
    console.log("addModule", name);
    if (name === 'toolbar') {
      this.extendToolbar(module);
    }
    return module;
  }

  buildButtons(buttons, icons) {
    console.log('buildButtons', buttons, icons);
    Array.from(buttons).forEach(button => {
      const className = button.getAttribute('class') || '';
      className.split(/\s+/).forEach(name => {
        if (!name.startsWith('ql-')) return;
        name = name.slice('ql-'.length);
        if (icons[name] == null) return;
        if (name === 'direction') {
          button.innerHTML = icons[name][''] + icons[name].rtl;
        } else if (typeof icons[name] === 'string') {
          button.innerHTML = icons[name];
        } else {
          const value = button.value || '';
          if (value != null && icons[name][value]) {
            button.innerHTML = icons[name][value];
          }
        }
      });
    });
  }

  buildPickers(selects, icons) {
    console.log('selects buildPickers', selects, icons);
    this.pickers = Array.from(selects).map(select => {
      if (select.classList.contains('ql-align')) {
        if (select.querySelector('option') == null) {
          fillSelect(select, ALIGNS, 'left');
        }
        return new IconPicker(select, icons.align);
      }
      if ( 
        select.classList.contains('ql-background') || 
        select.classList.contains('ql-color') 
        ) {
        const format = select.classList.contains('ql-background')
          ? 'background'
          : 'color';
        if (select.querySelector('option') == null) {
          fillSelect(
            select,
            COLORS,
            format === 'background' ? '#ffffff' : '#000000',
          );
        }
        return new ColorPicker(select, icons[format]);
      }
      if (select.classList.contains('ql-lineheight')) {
        if (select.querySelector('option') == null) {
          fillSelect(select, LINEHEIGHTS, '2');
        }
        console.log('icons.lineHeight', icons.lineHeight);
        return new LineHeightPicker(select, icons.lineHeight);
      }
      if (select.querySelector('option') == null) {
        if (select.classList.contains('ql-font')) {
          fillSelect(select, FONTS);
        } else if (select.classList.contains('ql-header')) {
          fillSelect(select, HEADERS);
        } else if (select.classList.contains('ql-size')) {
          fillSelect(select, SIZES, '16px');
        }
      }
      return new Picker(select);
    });
    // this.pickers.forEach((picker)  => {
    //   console.log('quill', this);
    //   var label = picker.label
    //     , options = picker.options
    //     , select = picker.select;
    //   [].forEach.call(select.classList, function(className) {
    //       if (className.startsWith("ql-")) {
    //           className = className.slice("ql-".length);
    //           if (className === 'size') {
    //             label.setAttribute('data-label', label.getAttribute('data-value'));
    //             [].forEach.call(options.children, function(option) {
    //               var value = option.getAttribute("data-value");
    //               option.setAttribute("data-label", value)
    //             })
    //           }
    //       }
    //   })
    // });


    const update = (event, test) => {
      console.log('themes base buildPickers update', event, test)
      this.pickers.forEach(picker => {
        picker.update();
      });
    };
    //.on(Emitter.events.SCROLL_OPTIMIZE, update)
    this.quill.on(Emitter.events.EDITOR_CHANGE, update);
  }
}
BaseTheme.DEFAULTS = extend(true, {}, Theme.DEFAULTS, {
  modules: {
    toolbar: {
      handlers: {
        formula() {
          this.quill.theme.tooltip.edit('formula');
        },
        image() {
          let fileInput = this.container.querySelector(
            'input.ql-image[type=file]',
          );
          if (fileInput == null) {
            fileInput = document.createElement('input');
            fileInput.setAttribute('type', 'file');
            fileInput.setAttribute(
              'accept',
              this.quill.uploader.options.mimetypes.join(', '),
            );
            fileInput.classList.add('ql-image');
            fileInput.addEventListener('change', () => {
              const range = this.quill.getSelection(true);
              this.quill.uploader.upload(range, fileInput.files);
              fileInput.value = '';
            });
            this.container.appendChild(fileInput);
          }
          fileInput.click();
        },
        video() {
          this.quill.theme.tooltip.edit('video');
        },
      },
    },
  },
});

class BaseTooltip extends Tooltip {
  constructor(quill, boundsContainer) {
    super(quill, boundsContainer);
    // this.textbox = this.root.querySelector('input[type="text"]');
    // this.removeBtn = this.root.querySelector('.ql-remove');
  }
  init(name) {
    super.insert(this.template(name))
    this.textbox = this.root.querySelector('input[type="text"]');
    this.removeBtn = this.root.querySelector('.ql-remove');
    this.listen();
  }
  listen() {
    this.textbox.addEventListener("focus", () => {
        this.root.classList.add("hasFocus")
    }),
    this.textbox.addEventListener("blur", () => {
        this.root.classList.remove("hasFocus")
    }),
    this.textbox.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.save();
        event.preventDefault();
      } else if (event.key === 'Escape') {
        this.cancel();
        event.preventDefault();
      }
    });
  }
  template() {
    return '';
  }
  cancel() {
    this.hide();
  }

  hide() {
    super.hide();
    super.insert('');
    this.root.classList.remove("ql-image-tooltip");
    this.root.classList.remove("ql-video-tooltip");
  }

  edit(mode = 'link', value = null, n = false) {
    this.init(mode);
    this.show();
    // console.log('BaseTooltip edit mode', mode, value)
    if (value != null) {
      this.textbox.value = value;
      if (mode === 'link') this.removeBtn.classList.remove("ql-hidden");
    }
    if (mode === 'video') {
      var [line, offset] = this.quill.getLine(this.quill.selection.savedRange.index)
        , next = line.next
        , a = next ? next.offset() : 0
        , s = false;
        next ? offset + 1 === a && (s = true) : s = !line.domNode.textContent;
      this.positionMedia(this.quill.getBounds(this.quill.selection.savedRange), s)
      this.root.classList.add("ql-video-tooltip");
    } else {
      
      this.position(this.quill.getBounds(this.quill.selection.savedRange));
    }
    value && !n || this.textbox.focus();
    // this.textbox.select();
   
    this.root.setAttribute('data-mode', mode);
  }

  restoreFocus() {
    const { scrollTop } = this.quill.scrollingContainer;
    this.quill.focus();
    this.quill.scrollingContainer.scrollTop = scrollTop;
  }

  save() {
    if (this.saving) return;
    if (!this.saving) this.saving = true;
    let { value } = this.textbox;
    switch (this.root.getAttribute('data-mode')) {
      case 'link': {
        const { scrollTop } = this.quill.root;
        console.log('save', this.linkRange);
        if (this.linkRange) {
          this.quill.formatText(
            this.linkRange,
            'link',
            value,
            Emitter.sources.USER,
          );
          delete this.linkRange;
        } else {
          this.restoreFocus();
          this.quill.format('link', value, Emitter.sources.USER);
        }
        this.quill.root.scrollTop = scrollTop;
        break;
      }
      case 'video': {
        var {url, type} = handleVideoUrl(value)
          , range = this.quill.getSelection(true)
          , rangeLength = range.index + range.length;
        // console.log('BaseTooltip', type, this.textbox.value)
        if ("url" !== type && "other" !== type || !this.textbox.value) {
            if (null != range && url) {
              console.log('BaseTooltip insertEmbed', range, url);
              var rangeLength = range.index + range.length;
              this.quill.insertEmbed(rangeLength, this.root.getAttribute("data-mode"), {
                  originUrl: value,
                  formatUrl: url,
                  type: type
              }, Emitter.sources.USER);
              this.quill.formatLine(rangeLength, 1, {
                  line: randomKey(4)
              }, Emitter.sources.USER);
              this.quill.setSelection(rangeLength + 1, Emitter.sources.SILENT);
            }
            // this.quill.emitter.emit(Emitter.events.TRACK, "doc_insert_media", {
            //     insertmedia_value: value,
            //     insertmedia_sort: "online_media",
            //     insertmedia_success: "成功"
            // })
        } else {
          console.log('插入失败，暂不支持插入该网站内容');
          // this.quill.theme.toast.show((0,
          //   r.default)("插入失败，暂不支持插入该网站内容"), "caution", 3e3),
          //   this.quill.insertText(range, url, "other" === type ? "" : "link", url, Emitter.sources.USER),
          //   this.quill.setSelection(rangeLength + url.length, Emitter.sources.USER),
          //   this.quill.emitter.emit(Emitter.events.TRACK, "doc_insert_media", {
          //       insertmedia_value: value,
          //       insertmedia_sort: "online_media",
          //       insertmedia_success: "失败"
          //   })
        }
        // value = extractVideoUrl(value);
        break;
      } // eslint-disable-next-line no-fallthrough
      case 'formula': {
        if (!value) break;
        const range = this.quill.getSelection(true);
        if (range != null) {
          const index = range.index + range.length;
          this.quill.insertEmbed(
            index,
            this.root.getAttribute('data-mode'),
            value,
            Emitter.sources.USER,
          );
          if (this.root.getAttribute('data-mode') === 'formula') {
            this.quill.insertText(index + 1, ' ', Emitter.sources.USER);
          }
          this.quill.setSelection(index + 2, Emitter.sources.USER);
        }
        break;
      }
      case 'image': {
        if (!value || !value.trim()) break;
        if (this.linkRange) {
          value = value.replace(/([\d]+)([^\d]+)?/, '$1')
          if (value > this.quill.scroll.domNode.clientWidth) {
            value = this.quill.scroll.domNode.clientWidth;
          } else if (value < 5) {
            value = 5
          }
          // console.log('image', this.linkRange, value);
          this.quill.formatText(
            this.linkRange,
            'width',
            value ? value + 'px' : '',
            Emitter.sources.USER,
          );
          delete this.linkRange;
        }
      }
      default:
    }
    this.textbox.value = '';
    this.hide();
    this.saving = false;
  }
}

function fillSelect(select, values, defaultValue = false) {
  values.forEach(value => {
    const option = document.createElement('option');
    option.setAttribute('value', value);
    if (value === defaultValue) {
      option.setAttribute('selected', 'selected');
    }
    select.appendChild(option);
  });
}

export { BaseTooltip, BaseTheme as default };
