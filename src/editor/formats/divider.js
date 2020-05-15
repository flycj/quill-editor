import {BlockEmbed} from '../blots/block';

class Divider extends BlockEmbed {
    static create(value) {
        const node = super.create(value);
        node.setAttribute('contenteditable', false);
        node.style.height = 0;
        node.style.borderWidth = 0;
        node.style.borderTopColor = '#cecece';
        node.style.borderTopWidth = '1px';
        node.style.borderTopStyle = 'solid';
        console.log('Divider create', node);
        return node;
    }
}
Divider.blotName = 'divider';
Divider.tagName = 'hr';

export default Divider;
