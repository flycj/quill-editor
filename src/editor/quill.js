import Quill from './core';

import { AlignClass, AlignStyle } from './formats/align';
import {
  DirectionAttribute,
  DirectionClass,
  DirectionStyle,
} from './formats/direction';
import Indent from './formats/indent';

import Blockquote, {BlockquoteItem} from './formats/blockquote';
import Header from './formats/header';
import List from './formats/list';

import { BackgroundClass, BackgroundStyle } from './formats/background';
import { ColorClass, ColorStyle } from './formats/color';
import { FontClass, FontStyle } from './formats/font';
import { SizeClass, SizeStyle } from './formats/size';
import { LineheightClass, LineheightStyle } from './formats/lineheight';

import Bold from './formats/bold';
import Italic from './formats/italic';
import Link from './formats/link';
import Script from './formats/script';
import Strike from './formats/strike';
import Underline from './formats/underline';

import Divider from './formats/divider';

import Formula from './formats/formula';
import Image from './formats/image';
import Video from './formats/video';



import CodeBlock, { Code as InlineCode } from './formats/code';

import Syntax from './modules/syntax';
import Table from './modules/table';
import Toolbar from './modules/toolbar';

import Icons from './ui/icons';
import Picker from './ui/picker';
import ColorPicker from './ui/color-picker';
import IconPicker from './ui/icon-picker';
import Tooltip from './ui/tooltip';

import BubbleTheme from './themes/bubble';
import SnowTheme from './themes/snow';

Quill.register(
  {
    'attributors/attribute/direction': DirectionAttribute,

    'attributors/class/align': AlignClass,
    'attributors/class/background': BackgroundClass,
    'attributors/class/color': ColorClass,
    'attributors/class/direction': DirectionClass,
    'attributors/class/font': FontClass,
    'attributors/class/size': SizeClass,
    'attributors/class/lineheight': LineheightClass,

    'attributors/style/align': AlignStyle,
    'attributors/style/background': BackgroundStyle,
    'attributors/style/color': ColorStyle,
    'attributors/style/direction': DirectionStyle,
    'attributors/style/font': FontStyle,
    'attributors/style/size': SizeStyle,
    'attributors/style/lineheight': LineheightStyle,
  },
  true,
);

Quill.register(
  {
    'formats/align': AlignStyle,
    'formats/direction': DirectionStyle,
    'formats/indent': Indent,

    'formats/background': BackgroundStyle,
    'formats/color': ColorStyle,
    'formats/font': FontClass,
    'formats/size': SizeStyle,
    'formats/lineheight': LineheightStyle,

    'formats/blockquote': Blockquote,
    'formats/blockquote-item': BlockquoteItem,
    'formats/code-block': CodeBlock,
    'formats/header': Header,
    'formats/list': List,

    // "formats/ordered-container": d.OrderedContainer,
    // "formats/ordered/item": d.OrderedItem,
    // "formats/ordered": d.default,
    // "formats/bullet": Bullet,
    // "formats/bullet/item": BulletItem,
    // "formats/bullet-container": BulletContainer,
    // "formats/list-container": p.default,

    'formats/bold': Bold,
    'formats/code': InlineCode,
    'formats/italic': Italic,
    'formats/link': Link,
    'formats/script': Script,
    'formats/strike': Strike,
    'formats/underline': Underline,
    'formats/divider': Divider,
    'formats/formula': Formula,
    'formats/image': Image,
    'formats/video': Video,

    'modules/syntax': Syntax,
    'modules/table': Table,
    'modules/toolbar': Toolbar,

    'themes/bubble': BubbleTheme,
    'themes/snow': SnowTheme,

    'ui/icons': Icons,
    'ui/picker': Picker,
    'ui/icon-picker': IconPicker,
    'ui/color-picker': ColorPicker,
    'ui/tooltip': Tooltip,
  },
  true,
);

export default Quill;
