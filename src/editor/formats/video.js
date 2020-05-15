import { BlockEmbed } from '../blots/block';
import Link from './link';

const ATTRIBUTES = ['height', 'width'];

class Video extends BlockEmbed {
  /**
   * 由Quill负责调用value表示创建的对象的参数。
   * @param {*} param0 
   */
  static create({originUrl, formatUrl, type}) {
    // 调用父类 create 方法返回 dom 节点
    // dom 节点 根据 blot 声明的 tagName 和 className 返回
    const node = super.create(formatUrl);
    const iframe = document.createElement('iframe');
    node.setAttribute('contenteditable', false);
    iframe.classList.add('ql-video-iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', true);
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("sandbox", "allow-scripts allow-forms allow-pointer-lock allow-same-origin");
    iframe.setAttribute('src', this.sanitize(formatUrl));
    iframe.setAttribute("data-src", originUrl);
    iframe.setAttribute("data-type", type);
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('height', '100%');
    iframe.setAttribute('style', 'position:absolute;top:0;left:0;')

    let percentage = this.processSize(formatUrl);
    node.setAttribute('style', `padding-top:${percentage}%;position:relative;`);
    node.appendChild(iframe);
    console.log('Video', node, originUrl, formatUrl);
    return node;
  }
  /**
   * 获取属性列表
   * @param {*} domNode 
   */
  static formats(domNode) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  static sanitize(url) {
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }
  /**
   * 获取节点值
   * @param {*} domNode 
   */
  static value(domNode) {
    console.log('Video value', domNode);
    var target = domNode.getElementsByTagName("iframe")[0];
    return !target || {
      originUrl: target.getAttribute("data-src"),
      formatUrl: target.getAttribute("src"),
      type: target.getAttribute("data-type")
    }
  }

  static processSize(url) {
    let percentage = 100;
    let lists = this.lists;
    Object.keys(lists).forEach(function(host) {
        if (url && url.indexOf(host) >= 0) {
          percentage = Math.round(lists[host].radio * 100)
        }
    });
    return percentage;
  }
  /**
   * 设置属性
   * @param {*} name 
   * @param {*} value 
   */
  format(name, value) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }

  html() {
    const { video } = this.value(this.domNode);
    console.log('Videl html', video)
    return `<a href="${video.originUrl}">${video.originUrl}</a>`;
  }
}
// line 20300
/**
 * blotName 必须唯一
 * tagName 指定该Blot对应的DOM节点类型 如果该节点已经被其他Blot使用了，则比较添加一个className加以区分。
 */
Video.blotName = 'video';
Video.className = 'ql-video';
Video.tagName = 'P';
Video.lists = {
    "youtube.com": {
        match: function(e) {
            return e.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/) || e.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/)
        },
        value: function(e) {
            return "https://www.youtube.com/embed/" + e[2] + "?showinfo=0"
        },
        radio: 5/9,
        type: "video"
    },
    "youku.com": {
        match: function(e) {
            return e.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?v\.youku\.com\/v_show\/id_([a-zA-Z0-9=_-]+)/)
        },
        value: function(e) {
            return "https://player.youku.com/embed/" + e[2]
        },
        radio: 5/9,
        type: "video"
    },
    "v.qq.com": {
        match: function(e) {
            return e.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?v\.qq\.com\/x\/cover\/[a-zA-Z0-9_-]+\/([a-zA-Z0-9_-]+)/) || e.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?v\.qq\.com\/x\/page\/([a-zA-Z0-9_-]+)/)
        },
        value: function(e) {
            return "https://v.qq.com/iframe/player.html?vid=" + e[2] + "&tiny=0&auto=0"
        },
        radio: 5/9,
        type: "video"
    },
    "music.163.com": {
        match: function(e) {
            return e.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?music\.163\.com\/?(#?)\/?(m?)\/song\/([0-9]+)/) || e.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?music\.163\.com\/?(#?)\/?(m?)\/song\?id=([0-9]+)/)
        },
        value: function(e) {
            return "https://music.163.com/outchain/player?type=2&id=" + e[4] + "&auto=0&height=66"
        },
        radio: 1/3,
        type: "audio"
    }
}

export default Video;
