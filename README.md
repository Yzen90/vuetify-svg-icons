# SVG icons usage alternative for Vuetify 3 and icon embedding

Allows the mixed usage of these icon packages and the embedding of icons:
- [Font Awesome Icons free (solid and regular variants)](https://fontawesome.com/search?o=r&m=free)
- [Material Design Icons](https://pictogrammers.com/library/mdi/)
- [Material Design Icons Light](https://pictogrammers.com/library/mdil/)
- [heroicons (outline, solid and mini variants)](https://heroicons.com/)
- Others can be added by creating custom `ExtractionOptions`.

This package is composed of three main parts:

1. A Vue component for Vuetify based on the one from the `mdi` IconPack exported by `'vuetify/iconsets/mdi-svg'`, that gets the icon data from a string with the format: `'SVG;<path data>;<view box>;<fill>;<stroke width>;<fill rule>'` if the string does not start with `'SVG;'`, it just uses the string as the path data like `mdi-svg` does.
2. Functions that output the the previously mentioned format. The combination of the component and this functions allows the usage of icons from different packages in any Vuetify component that uses icons.
   1. `useFA` to use a `IconDefinition` object representing a Font Awesome icon.
   2. `useHIO` to use [heroicons](https://heroicons.com/) outline variant from `@xrnoz/heroicons-js`.
   3. `useHIS` to use heroicons solid variant from `@xrnoz/heroicons-js`.
   4. `useHIM` to use heroicons mini variant from `@xrnoz/heroicons-js`.
3. A Vite plugin that replaces the calls of the provided functions with it's resulting string to optimize the usage of the icons. By default it also removes the first import of `@xrnoz/vuetify-svg-icons` and of the icon package(s), as after replacing the function calls the imports are no longer neccesary.

**Table of contents**

- [Usage (Examples in TypeScript)](#usage-examples-in-typescript)
  - [1. Add the dependencies:](#1-add-the-dependencies)
  - [2. Create a file `icons.ts`:](#2-create-a-file-iconsts)
  - [3. Configure Vuetify](#3-configure-vuetify)
  - [4. Use the icons](#4-use-the-icons)
  - [5. (Optional) Configure the plugin](#5-optional-configure-the-plugin)
  - [5.1. Applying the plugin to other icon packs:](#51-applying-the-plugin-to-other-icon-packs)
      - [`icons.ts`:](#iconsts)
      - [`vite.config.ts`:](#viteconfigts)
- [Plugin options](#plugin-options)
- [Resources](#resources)

## Usage (Examples in TypeScript)

### 1. Add the dependencies:

```shell
yarn add @xrnoz/vuetify-svg-icons

# yarn add @fortawesome/free-solid-svg-icons
# yarn add @fortawesome/free-regular-svg-icons
# yarn add @mdi/js
# yarn add @mdi/light-js
# yarn add @@xrnoz/heroicons-js
```

### 2. Create a file `icons.ts`:

```typescript
import { aliases as defaultAliases  } from 'vuetify/iconsets/mdi-svg';

import { mdiThumbDown } from '@mdi/js';
import { mdilMagnify } from '@mdi/light-js';

import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

import { his, hio, him } from '@xrnoz/heroicons-js';

// To use the plugin some of the functions are different, see section 5.
import { useFA, useHIO, useHIS, useHIM } from '@xrnoz/vuetify-svg-icons';

import type { IconAliases } from 'vuetify';

export const aliases: IconAliases = {
  ...defaultAliases, // Used by Vuetify components, can be customized.

  // mdi
  dislike: mdiThumbDown,

  // mdil
  search: mdilMagnify,

  // fas
  like: useFA(fas.faHeart),

  // far
  notifications: useFA(far.faBell),

  // heroicons outline
  launch: useHIO(hio.rocketLaunch),

  // heroicons solid
  settings: useHIS(his.adjustmentsHorizontal),

  // heroicons mini
  experimental: useHIM(him.beaker),
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
    <v-btn icon>
      <!-- `launch` alias defined in icons.ts -->
      <v-icon>$launch</v-icon>
    </v-btn>
  </v-row>

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
    <v-btn color="yellow" :append-icon="useFA(faFaceSurprise)">Wow!</v-btn>
  </v-row>
</template>

<script lang="ts" setup>
  import { faFaceSurprise } from '@fortawesome/free-solid-svg-icons';
  import { useFA } from '@xrnoz/vuetify-svg-icons';
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

    // Embed Font Awesome solid icons by default (must use `useFAS` instead of `useFA`)
    embedIcons({ include: ['./src/icons.ts', './src/ZaWarudo.vue'], showReplacements: true }),
  ],
});
```

### 5.1. Applying the plugin to other icon packs:

##### `icons.ts`:

```typescript
import { aliases as defaultAliases  } from 'vuetify/iconsets/mdi-svg';

import * as mdi from '@mdi/js';
import * as mdil from '@mdi/light-js';

import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

import { his, hio, him } from '@xrnoz/heroicons-js';

import { useMDI, useMDIL, useFAS, useFAR, useHIO, useHIS, useHIM } from '@xrnoz/vuetify-svg-icons';

import type { IconAliases } from 'vuetify';

export const aliases: IconAliases = {
  ...defaultAliases,

  // mdi
  dislike: useMDI(mdi.mdiThumbDown),

  // mdil
  search: useMDIL(mdil.mdilMagnify) 

  // fas
  like: useFAS(fas.faHeart),

  // far
  notifications: useFAR(far.faBell),

  // heroicons outline
  launch: useHIO(hio.rocketLaunch),

  // heroicons solid
  setting: useHIS(his.adjustmentsHorizontal),

  // heroicons mini
  experimental: useHIM(him.beaker),
};
```

##### `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import embedIcons from '@xrnoz/vuetify-svg-icons/plugin';

export default defineConfig({
  plugins: [
    vue({}),
    vuetify({}),

    // Use `embed` option to indicate the presets to use or add a custom one:
    embedIcons({ include: './src/icons.ts', embed: ['mdi', 'mdil', 'fas', 'far', 'hio', 'his', 'him'] }),
  ],
});
```

## Plugin options

Option           | Required | Default                               | Description
-----------------|----------|---------------------------------------|------------
include          | yes      |                                       | Target files for the plugin.
embed            | no       | `['fas']` | Icons package(s) for extraction and embedding.
removeImports    | no       | `true`                                | Whether to remove from the target the first import of `extractorPkg` and of `iconsPkg` defined in the `ExtractionOptions` of the preset(s) used with the `embed` option.
showReplacements | no       | `false`                               | Whether to show replacement information.
apply            | no       |                                       | Whether to restrict the plugin to run only on `build` or `serve`.
dumpFile         | no       |                                       | File to dump the transform results for debugging purposes.

## Resources

- [Font Awesome Icons Search](https://fontawesome.com/search?o=r&m=free)
- [Material Design Icons](https://pictogrammers.com/library/mdi/)
- [Material Design Icons Light](https://pictogrammers.com/library/mdil/)
- [heroicons](https://heroicons.com/)
- [Vuetify Icon Fonts Documentation](https://next.vuetifyjs.com/en/features/icon-fonts/)
