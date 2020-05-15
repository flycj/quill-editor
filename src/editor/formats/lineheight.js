import { ClassAttributor, Scope, StyleAttributor } from '../parchment';

const config = {
  scope: Scope.BLOCK,
  whitelist: ['1', '1.5', '1.75', '2', '2.5', '3'],
};

const LineheightClass = new ClassAttributor('lineheight', 'ql-lineheight', config);
const LineheightStyle = new StyleAttributor('lineheight', 'line-height', config);

export { LineheightClass, LineheightStyle };
