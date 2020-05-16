import extend from 'extend';
import Emitter from '../core/emitter';
import BaseTheme, { BaseTooltip } from './base';
import LinkBlot from '../formats/link';
import ImageBlot from '../formats/image';
import { Range } from '../core/selection';
import icons from '../ui/icons';

const TOOLBAR_CONFIG = [
  [{ header: ['1', '2', '3', false] }],
  ['bold', 'italic', 'underline', 'link'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean'],
];

class SnowTooltip extends BaseTooltip {
  constructor(quill, bounds) {
    console.log('SnowTooltip constructor', quill);
    super(quill, bounds);
    // this.preview = this.root.querySelector('a.ql-preview');
    this.initEvent();
  }

  initEvent() {
    // this.quill.on(Emitter.events.TEXT_CHANGE, () => {
    //   var lastRange = this.quill.selection.lastRange;
    //   console.log('Emitter.events.TEXT_CHANGE', lastRange);
    //   null != lastRange && (null === this.quill.scroll.descendant(LinkBlot, lastRange.index - 1)[0] && this.hide())
    // })
    this.quill.on( Emitter.events.SELECTION_CHANGE, (range, oldRange, source) => {
      if (range == null) return;
      console.log('Emitter.events.SELECTION_CHANGE', range, source);
      if (range.length === 0 && source === Emitter.sources.USER) {
        const [link, offset] = this.quill.scroll.descendant(
          LinkBlot,
          range.index,
        );
        console.log('SELECTION_CHANGE descendant', link, offset)
        if (link != null) {
          this.linkRange = new Range(range.index - offset, link.length());
          const href = LinkBlot.formats(link.domNode);
          // this.preview.textContent = preview;
          // this.preview.setAttribute('href', preview);
          this.edit("link", href);
          // this.position(this.quill.getBounds(this.linkRange));
          return;
        }
      } else if (range.length === 1 && source === Emitter.sources.USER) {
        const [image, offset] = this.quill.scroll.descendant(
          ImageBlot,
          range.index,
        );
        console.log('descendant', image, offset);
        if (image != null) {
          this.linkRange = new Range(range.index - offset, image.length())
          const imageAttr = ImageBlot.formats(image.domNode);
          console.log('imageAttr', imageAttr);
          this.edit("image", imageAttr.width ? imageAttr.width.replace('px', '') : '');
          // this.position(this.quill.getBounds(this.linkRange));
          return;
        }
      } else {
        delete this.linkRange;
      }
      this.hide();
    });
  }

  listen() {
    super.listen();
    // this.root.querySelector('a.ql-action').addEventListener('click', event => {
    //   if (this.root.classList.contains('ql-editing')) {
    //     this.save();
    //   } else {
    //     this.edit('link', this.preview.textContent);
    //   }
    //   event.preventDefault();
    // });
    if(this.removeBtn) {
      this.removeBtn.addEventListener('click', event => {
        if (this.linkRange != null) {
          const range = this.linkRange;
          this.restoreFocus();
          this.quill.formatText(range, 'link', false, Emitter.sources.USER);
          delete this.linkRange;
        }
        event.preventDefault();
        this.hide();
      });
    }
    this.textbox.addEventListener("blur", () => {
      // this.root.classList.contains("ql-hidden") || this.save()
    })
    
  }
  template(name) {
    switch(name) {
      case 'link': return [
        '<input type="text" placeholder="输入链接，回车确认">',
        '<a class="ql-remove ql-hidden">' + icons['unlink'] + '</a>',
      ].join(' ');
      case 'video': return [
        '<input type="text" placeholder="粘贴媒体链接，回车确认（暂支持优酷、腾讯视频）">',
      ].join(' ');
      case 'formula': return [
        '<input type="text" placeholder="e=mc^2"">',
      ].join(' ');
      case 'image': return [
        '设置图片宽度像素值：<input type="text" placeholder="">',
      ].join(' ');
    }
  }
  show() {
    super.show();
    this.root.removeAttribute('data-mode');
  }
}

class SnowTheme extends BaseTheme {
  constructor(quill, options) {
    if (
      options.modules.toolbar != null &&
      options.modules.toolbar.container == null
    ) {
      options.modules.toolbar.container = TOOLBAR_CONFIG;
    }
    super(quill, options);
    this.quill.container.classList.add('ql-snow');
  }

  extendToolbar(toolbar) {
    toolbar.container.classList.add('ql-snow');
    this.buildButtons(toolbar.container.querySelectorAll('button'), icons);
    this.buildPickers(toolbar.container.querySelectorAll('select'), icons);
    this.tooltip = new SnowTooltip(this.quill, this.options.bounds);
    // console.log('SnowTheme extendToolbar', this.options.bounds, toolbar)
    if (toolbar.container.querySelector('.ql-link')) {
      this.quill.keyboard.addBinding(
        { key: 'k', shortKey: true },
        (range, context) => {
          toolbar.handlers.link.call(toolbar, !context.format.link);
        },
      );
    }
  }
}
SnowTheme.DEFAULTS = extend(true, {}, BaseTheme.DEFAULTS, {
  modules: {
    toolbar: {
      handlers: {
        link(value) {
          console.log('SnowTheme', value);
          if (value) {
            const range = this.quill.getSelection();
            if (range == null || range.length === 0) return;
            // let preview = this.quill.getText(range);
            // if ( /^\S+@\S+\.\S+$/.test(preview) && preview.indexOf('mailto:') !== 0 ) {
            //   preview = `mailto:${preview}`;
            // }
            const { tooltip } = this.quill.theme;
            if ("string" == typeof value) {
              tooltip.edit('link', value, true);
            } else {
              tooltip.edit("link")
            }
          } else {
            this.quill.format('link', false, Emitter.sources.USER);
          }
        },
      },
    },
  },
});

export default SnowTheme;
