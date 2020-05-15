import { ClassAttributor, Scope, StyleAttributor } from '../parchment';

const config = {
  scope: Scope.INLINE,
  whitelist: ['20px', '18px', '16px', '14px', '12px'],
};

const SizeClass = new ClassAttributor('size', 'ql-size', config);
const SizeStyle = new StyleAttributor('size', 'font-size', config);

export { SizeClass, SizeStyle };
