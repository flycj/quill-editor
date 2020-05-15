import Block from '../blots/block';
import Container from '../blots/container';
import { Registry, Scope } from '../parchment'

console.log('Parchment', Registry, Scope);


class BlockquoteItem extends Block {
    static formats (domNode) {
        return domNode.tagName === this.tagName ? undefined : super.formats(domNode);
    }
    format(name, value) {
        if (name === Blockquote.blotName && !value) {
            // 设置blockquote: 'false'，去掉blockquote样式
            this.replaceWith(Registry.create(this.statics.scope))
        } else {
            // 设置blockquote: 'blockquote'，blockquote样式
            super.format(name, value)
        }
    }
    remove() {
        // 删除及删除父元素
        if (this.prev === null && this.next === null) {
            this.parent.remove();
        } else {
            super.remove();
        }
    }
    replaceWith(name, value) {
        this.parent.isolate(this.offset(this.parent), this.length());
        if (name === this.parent.statics.blotName) {
            // enter添加blockquote-item时，将其放入一个blockquote中
            this.parent.replaceWith(name, value);
            return this;
        } else {
             // 点击按键去掉样式时，将父元素展开，该行变成默认的p元素
             this.parent.unwrap();
             return super.replaceWith(name, value);
        }
    }
}

BlockquoteItem.blotName = 'blockquote-item';
BlockquoteItem.tagName = 'P';
BlockquoteItem.className = 'blockquote-item';


class Blockquote extends Container {
    static create() {
        return super.create();
    }

    /**
     * 设置属性
     */
    format(name, value) {
        if (this.children.length) {
            this.children.tail.format(name, value);
        }
    }
    /**
     * 获取属性列表
     */
    // formats () {
    //     return { [this.statics.blotName]: this.statics.formats(this.domNode) }
    // }
    formats(domNode) {
        let formats = {};
        formats[this.statics.blotName] = true;
        return formats;
    }
    /**
     * 前面插入:如果是BlockquoteItem，直接插入，否则插入到Blockquote外部
     * @param {*} blot 
     * @param {*} ref 
     */
    // insertBefore(blot, ref) {
    //     console.log('insertBefore', blot, ref, ref == null);
    //     if (blot instanceof BlockquoteItem)
    //         super.insertBefore(blot, ref);
    //     else {
    //         let index = ref == null ? this.length() : ref.offset(this);
            
    //         let after = this.split(index);
    //         console.log('index', index, after, after.parent);
    //         // blot.parent.insertBefore(blot, after);
    //         // after.insertBefore(blot, after);
    //     }
    // }
    
    /* 如果下个元素与当前元素一样，则合并 */
    optimize (context) {
        super.optimize(context)
        let next = this.next
        if (next != null && next.prev === this && next.statics.blotName === this.statics.blotName && next.domNode.tagName === this.domNode.tagName) {
            next.moveChildren(this)
            next.remove()
        }
    }
    /* 如果不是一种blot，则将target的内容移动到当前blot中 */
    replace (target) {
        if (target.statics.blotName !== this.statics.blotName) {
            let item = Registry.create(this.statics.defaultChild)
            target.moveChildren(item)
            this.appendChild(item)
        }
        super.replace(target)
    }
}
Blockquote.blotName = 'blockquote';
Blockquote.tagName = 'BLOCKQUOTE';
Blockquote.scope = Scope.BLOCK_BLOT;
Blockquote.defaultChild = 'blockquote-item';
Blockquote.allowedChildren = [BlockquoteItem];

export {Blockquote as default, BlockquoteItem};
