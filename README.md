# SVG icons usage alternative for Vuetify 3 and icon embedding

Alternative to the built-in support for [Font Awesome SVG Icons](https://fontawesome.com/search?o=r&m=free) of Vuetify, allowing the mixed usage of other SVG icon packs as `@mdi/js`, `@mdi/light-js` and [heroicons](https://heroicons.com/).

This package is composed of three main parts:

1. A Vue component for Vuetify based on the one from the `mdi` IconPack exported by `'vuetify/iconsets/mdi-svg'`, that gets the viewbox, path data, fill and stroke width from a string with the format: `'SVG;<view box>;<path data>;<fill>;<stroke width>'` if the string does not start with `'SVG;'`, it just uses the string as the path data like `mdi` does.
2. Functions that output the the previously mentioned format. The combination of the component and this functions allows the usage of icons from different packages in any Vuetify component that uses icons.
   1. `faIconToString` to use a `IconDefinition` object representing a Font Awesome icon.
   2. `hioToString` to use [heroicons](https://heroicons.com/) outline variant from `@xrnoz/heroicons-js`.
   3. `himToString` to use heroicons mini variant from `@xrnoz/heroicons-js`.
3. A Vite plugin that replaces the calls of provided embedding functions with it's resulting string to optimize the usage of the icons. By default it also removes the first import to `@xrnoz/vuetify-svg-icons` and `@fortawesome/free-solid-svg-icons`, as after replacing the function calls the imports are no longer neccesary.

**Table of contents**

- [Usage (Examples in TypeScript)](#usage-examples-in-typescript)
  - [1. Add the dependencies:](#1-add-the-dependencies)
  - [2. Create a file `icons.ts`:](#2-create-a-file-iconsts)
  - [3. Configure Vuetify](#3-configure-vuetify)
  - [4. Use the icons](#4-use-the-icons)
  - [5. (Optional) Configure the plugin](#5-optional-configure-the-plugin)
  - [5.1. Applying the plugin to `@mdi/js`, `@mdi/light-js`, `@fortawesome/free-regular-svg-icons` and/or `@xrnoz/heroicons-js` icons:](#51-applying-the-plugin-to-mdijs-mdilight-js-fortawesomefree-regular-svg-icons-andor-xrnozheroicons-js-icons)
      - [`icons.ts`:](#iconsts)
      - [`vite.config.ts`:](#viteconfigts)
- [Plugin options](#plugin-options)
- [Resources](#resources)

## Usage (Examples in TypeScript)

### 1. Add the dependencies:

```shell
yarn add @xrnoz/vuetify-svg-icons @fortawesome/free-solid-svg-icons @mdi/js
```

### 2. Create a file `icons.ts`:

```typescript
import { aliases as defaultAliases  } from 'vuetify/iconsets/mdi-svg';

import { mdiThumbDown } from '@mdi/js';
import { mdilMagnify } from '@mdi/light-js';

import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

import { his, hio, him } from '@xrnoz/heroicons-js';

import { faIconToString } from '@xrnoz/vuetify-svg-icons';
/*
  To use the plugin, import instead `fasEmbed`:
    import { fasEmbed } from '@xrnoz/vuetify-svg-icons';
*/

import type { IconAliases } from 'vuetify';

export const aliases: IconAliases = {
  ...defaultAliases, // Needed by Vuetify components, can be customized.

  // mdi
  dislike: mdiThumbDown,

  // mdil
  search: mdilMagnify,

  // fas
  like: faIconToString(fas.faHeart),
  /*
    Use `fasEmbed` instead if using the plugin:
      like: fasEmbed(fas.faHeart),
  */

  // far
  notifications: faIconToString(far.faBell),

  // heroicons solid
  setting: his.adjustmentsHorizontal,

  // heroicons outline
  launch: hioToString(hio.rocketLaunch),
  /*
    Use `hioEmbed` instead if using the plugin:
      launch: hioEmbed(hio.rocketLaunch),
  */

  // heroicons mini
  experimental: himToString(him.beaker),
  /*
    Use `himEmbed` instead if using the plugin:
      launch: himEmbed(him.beaker),
  */
};
```

### 3. Configure Vuetify

```typescript
import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import svg from '@xrnoz/vuetify-svg-icons'; // Component

import { aliases } from './icons'; // Aliases
import App from './App.vue';

import 'vuetify/styles';

const vue = createApp(App);
vue.use(
  createVuetify({
    icons: {
      defaultSet: 'svg',
      aliases,
      sets: { svg },
    },
  }),
);

vue.mount('#app');
```

### 4. Use the icons

```vue
<template>
  <v-row>
    <!-- `like` alias defined in icons.ts -->
    <v-btn color="blue" append-icon="$like">Like</v-btn>
  </v-row>

  <v-row>
    <!-- `dislike` alias defined in icons.ts -->
    <v-btn color="red" append-icon="$dislike">Dislike</v-btn>
  </v-row>

  <v-row>
    <!-- usage on the fly -->
    <v-btn color="yellow" :append-icon="faIconToString(faFaceSurprise)">Wow!</v-btn>
  </v-row>
</template>

<script lang="ts" setup>
  import { faFaceSurprise } from '@fortawesome/free-solid-svg-icons';
  import { faIconToString } from '@xrnoz/vuetify-svg-icons';
</script>
```

### 5. (Optional) Configure the plugin

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import embedIcons from '@xrnoz/vuetify-svg-icons/plugin';

export default defineConfig({
  plugins: [
    vue({}),
    vuetify({}),

    // Embed Font Awesome solid icons
    embedIcons({ include: ['./src/icons.ts', './src/ZaWarudo.vue'], showReplacements: true }),
  ],
});
```

### 5.1. Applying the plugin to `@mdi/js`, `@mdi/light-js`, `@fortawesome/free-regular-svg-icons` and/or `@xrnoz/heroicons-js` icons:

##### `icons.ts`:

```typescript
import { aliases as defaultAliases  } from 'vuetify/iconsets/mdi-svg';

import * as mdi from '@mdi/js';
import * as mdil from '@mdi/light-js';

import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

import { his, hio, him } from '@xrnoz/heroicons-js';

// The embedding functions serve to flag the icons for embedding:
import { mdiEmbed, mdilEmbed, fasEmbed, farEmbed, hisEmbed, hioEmbed, himEmbed } from '@xrnoz/vuetify-svg-icons';

import type { IconAliases } from 'vuetify';

export const aliases: IconAliases = {
  ...defaultAliases,

  // mdi
  dislike: mdiEmbed(mdi.mdiThumbDown),

  // mdil
  search: mdilEmbed(mdil.mdilMagnify) 

  // fas
  like: fasEmbed(fas.faHeart),

  // far
  notifications: farEmbed(far.faBell),

  // heroicons solid
  setting: hisEmbed(his.adjustmentsHorizontal),

  // heroicons outline
  launch: hioEmbed(hio.rocketLaunch),

  // heroicons mini
  experimental: himEmbed(him.beaker),
};
```

##### `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import embedIcons, { farPreset, mdiPreset, mdilPreset, hisPreset, hioPreset, himPreset } from '@xrnoz/vuetify-svg-icons/plugin';

export default defineConfig({
  plugins: [
    vue({}),
    vuetify({}),

    // Embed Font Awesome solid icons:
    embedIcons({ include: './src/icons.ts' }),
    
    // Embed Font Awesome regular icons:
    embedIcons({ ...farPreset, include: './src/icons.ts' }),
    
    // Embed MDI icons:
    embedIcons({ ...mdiPreset, include: './src/icons.ts' }),
    
    // Embed MDI Light icons:
    embedIcons({ ...mdilPreset, include: './src/icons.ts' }),

    // Embed heroicons solid:
    embedIcons({ ...hisPreset, include: './src/icons.ts' }),

    // Embed heroicons outline:
    embedIcons({ ...hioPreset, include: './src/icons.ts' }),

    // Embed heroicons mini:
    embedIcons({ ...himPreset, include: './src/icons.ts' }),
  ],
});
```

## Plugin options


Option           | Required | Default                               | Description
-----------------|----------|---------------------------------------|------------
include          | yes      |                                       | Target files for the plugin.
package          | no       | `'@fortawesome/free-solid-svg-icons'` | Package for icon extraction.
iconsExport      | no       | `'fas'`                               | Export of `options.package` that provides the icons.
removeImports    | no       | `true`                                | Whether to remove the first import of `options.extractor.package` (default: '@xrnoz/vuetify-svg-icons') and of `options.package` (default: '@fortawesome/free-solid-svg-icons') from the target..
showReplacements | no       | `false`                               | Whether to show replacement information.
extractor        | no       |                                       |
extractor.fn     |          | `fasEmbed`                            | Function to get the SVG data from the icon object as a string.
extractor.name   |          | `'fasEmbed'`                          | Name of the function that on each call will be replaced with a string literal with the SVG data of the icon.
extractor.package |         | `'@xrnoz/vuetify-svg-icons'`          | Package that exports the icon extractor as it is imported in the target, e.g.: `'./my-extractor'` or `'other-package'`
apply            | no       |                                       | Whether to restrict the plugin to run only on `build` or `serve`.
dumpFile         | no       |                                       | File to dump the transform results for debugging purposes.

## Resources

- [Font Awesome Icons Search](https://fontawesome.com/search?o=r&m=free)
- [Material Design Icons](https://pictogrammers.com/library/mdi/)
- [Material Design Icons Light](https://pictogrammers.com/library/mdil/)
- [heroicons](https://heroicons.com/)
- [Vuetify Icon Fonts Documentation](https://next.vuetifyjs.com/en/features/icon-fonts/)
