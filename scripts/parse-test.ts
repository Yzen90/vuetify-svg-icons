import { stripImports, difference } from '../utils.js';

console.log('===============  Sampe 1  ===============');

const sample1 = `
import {
  faAt,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import other1 from 'other1';
import other2 from 'other2';
import { faIconToString } from '@xrnoz/vuetify-svg-icons';
import other3 from 'other3';
import other4 from 'other4';

export default {};
`;

console.log(difference(sample1, stripImports(sample1, '@fortawesome/free-solid-svg-icons')));

console.log('===============  Sampe 2  ===============');

const sample2 = `
import fa from '@fortawesome/free-solid-svg-icons';
import other1 from 'other1';
import other2 from 'other2';
import svg from '@xrnoz/vuetify-svg-icons';

export default {};
`;

console.log(difference(sample2, stripImports(sample2, '@fortawesome/free-solid-svg-icons')));

console.log('===============  Sampe 3  ===============');

const sample3 = `
import other1 from 'other1';
import other2 from 'other2';

const {
  faAt,
  faArrowLeft,
} = await import('@fortawesome/free-solid-svg-icons');

const { faIconToString } = await import('@xrnoz/vuetify-svg-icons');

export default {};
`;

console.log(difference(sample3, stripImports(sample3, '@fortawesome/free-solid-svg-icons')));

console.log('===============  Sampe 4  ===============');

const sample4 = `
import other1 from 'other1';
import other2 from 'other2';

const fa = await import('@fortawesome/free-solid-svg-icons');

const svg = await import('@xrnoz/vuetify-svg-icons');

const other3 = await import('other3');
const other4 = await import('other4');

export default {};
`;

console.log(difference(sample4, stripImports(sample4, '@fortawesome/free-solid-svg-icons')));

console.log('===============  Sampe 5  ===============');

const sample5 = `
import other1 from 'other1';

import other2 from 'other2';const fa = await import('@fortawesome/free-solid-svg-icons');const other3 = await import('other3');

import other4 from 'other4';const svg = await import('@xrnoz/vuetify-svg-icons');const other5 = await import('other5');

const other6 = await import('other6');
const other7 = await import('other7');
const other8 = await import('other8');
const other9 = await import('other9');

export default {};
`;

console.log(difference(sample5, stripImports(sample5, '@fortawesome/free-solid-svg-icons')));

console.log('===============  Sampe 6  ===============');

const sample6 = `
import other1 from 'other1';
const svg = await import('@xrnoz/vuetify-svg-icons');
const fa = await import('@fortawesome/free-solid-svg-icons');
const other2 = await import('other2');
export default {};
`;

console.log(difference(sample6, stripImports(sample6, '@fortawesome/free-solid-svg-icons')));
