import Picker from './picker';
 

class lineHeightPicker extends Picker {
  constructor(select, icon) {
    super(select);
    this.container.classList.add('ql-line-height-picker');
    Array.from(this.container.querySelectorAll('.ql-picker-item')).forEach(
      item => {
        item.innerHTML = item.getAttribute('data-value');
      },
    );
    this.defaultItem = this.container.querySelector('.ql-selected');
    this.selectItem(this.defaultItem);
    this.label.innerHTML = icon + this.label.innerHTML;
  }
  
//   selectItem(target, trigger) {
//     super.selectItem(target, trigger);
//     const item = target || this.defaultItem;
//     if (this.label.innerHTML === item.innerHTML) return;
//     this.label.innerHTML = item.innerHTML;
//   }
}

export default lineHeightPicker;
