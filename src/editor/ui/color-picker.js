import Picker from './picker';

class ColorPicker extends Picker {
  constructor(select, label) {
    super(select);
    this.label.innerHTML = label + this.label.innerHTML;
    this.container.classList.add('ql-color-picker');
    Array.from(this.container.querySelectorAll('.ql-picker-item'))
      .slice(0, 7)
      .forEach(item => {
        item.classList.add('ql-primary');
      });
  }

  buildItem(option) {
    const item = super.buildItem(option);
    item.style.backgroundColor = option.getAttribute('value') || '';
    return item;
  }

  selectItem(item, trigger) {
    super.selectItem(item, trigger);
    const colorLabel = this.label.querySelector('.icon');
    const value = item ? item.getAttribute('data-value') || '' : '';
    if (colorLabel) {
      colorLabel.style.color = value;
    }
  }
}

export default ColorPicker;
