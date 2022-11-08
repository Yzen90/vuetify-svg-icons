# Font Awesome SVG Icons alternative support for Vuetify 3

Alternative to the built-in support for [Font Awesome SVG Icons](https://fontawesome.com/search?o=r&m=free) of Vuetify, allowing the mixed usage of other SVG icon packs as `@mdi/js`.

This package is composed of three main parts:

1. A Vue component for Vuetify based on the one from the `mdi` IconPack exported by `'vuetify/iconsets/mdi-svg'`, that gets the viewbox and path data from a string with the format: `'SVG;<view box>;<path data>'` if the string does not start with `'SVG;'`, it just uses the string as the path data like `mdi` does.
2. The function `faIconToString` that turns an `IconDefinition` object thats represents a Font Awesome icon, to a string literal with the format mentioned before. The combination of the component and this function allows the usage of Font Awesome SVG icons in any Vuetify component that uses icons.
3. A Vite plugin that replaces the calls to `faIconToString` with it's resulting string to optimize the usage of the icons. By default it also removes the first import to `@xrnoz/vuetify-svg-icons` and `@fortawesome/free-solid-svg-icons`, as after replacing the function calls the imports are no longer neccesary.

## Usage (Examples in TypeScript)

### 1. Add the dependencies:

```shell
yarn add @xrnoz/vuetify-svg-icons @fortawesome/free-solid-svg-icons @mdi/js
```

### 2. Create a file `icons.ts`:

```typescript
import { aliases as defaultAliases  } from 'vuetify/iconsets/mdi-svg';
import { mdiThumbDown } from '@mdi/js';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { faIconToString } from '@xrnoz/vuetify-svg-icons';

import type { IconAliases } from 'vuetify';

export const aliases: IconAliases = {
  ...defaultAliases, // Needed by Vuetify components, can be customized.

  // mdi
  dislike: mdiThumbDown,

  // fa
  like: faIconToString(fas.faHeart),
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
    <v-btn color="red" append-icon="$dislike">Like</v-btn>
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

5. (Optional) Configure the plugin

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import embedIcons from '@xrnoz/vuetify-svg-icons/plugin';

export default defineConfig({
  plugins: [
    vue({}),
    vuetify({}),
    embedIcons({ include: './src/icons.ts', showReplacements: true }),
  ],
});
```

## Plugin options


Option           | Required | Default                               | Description
-----------------|----------|---------------------------------------|------------
include          | yes      |                                       | Target files for the plugin.
package          | no       | `'@fortawesome/free-solid-svg-icons'` | Package for icon extraction.
iconsExport      | no       | `'fas'`                               | Export of `options.package` that provides the icons.
removeImports    | no       | `true`                                | Whether to remove the first import of `@xrnoz/vuetify-svg-icons` and of `options.package` from the target.
showReplacements | no       | `false`                               | Whether to show replacement information.
extractor        | no       | `faIconToString`                      | Function to get the SVG data from the icon object as a string.
apply            | no       |                                       | Whether to restrict the plugin to run only on `build` or `serve`.
dumpFile         | no       |                                       | File to dump the transform results for debugging purposes.

## Resources

- [Font Awesome Icons Search](https://fontawesome.com/search?o=r&m=free)
- [Material Design Icons Search](https://materialdesignicons.com/)
- [Vuetify Icon Fonts Documentation](https://next.vuetifyjs.com/en/features/icon-fonts/)
