import { mergeProps, createVNode, toRefs, JSXComponent } from 'vue';
import { defineComponent, propsFactory } from 'vuetify/lib/util/index.mjs';
import { IconValue } from 'vuetify/lib/composables/icons.mjs';

import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import type { IconProps, IconSet } from 'vuetify';

/** @public */
export const faIconToString = (icon: IconDefinition) => `SVG;0 0 ${icon.icon[0]} ${icon.icon[1]};${icon.icon[4]}`;

/** @public */
export const SVGIcon: JSXComponent<IconProps> = defineComponent({
  name: 'SVGIcon',
  inheritAttrs: false,
  props: propsFactory(
    {
      icon: {
        type: IconValue,
        required: true,
      },
      tag: {
        type: String,
        required: true,
      },
    },
    'icon',
  )(),
  setup(props: IconProps, _ref: { attrs: Record<string, unknown> }) {
    const { icon, tag } = toRefs(props);
    const { attrs } = _ref;

    let viewBox = '0 0 24 24';
    let d = icon.value as string;

    if (d.startsWith?.('SVG;')) {
      const parts = d.split(';');
      viewBox = parts[1] ?? '';
      d = parts[2] ?? '';
    }

    return () => {
      return createVNode(
        tag.value,
        mergeProps(attrs, {
          style: null,
        }),
        {
          default: () => [
            createVNode(
              'svg',
              {
                class: 'v-icon__svg',
                xmlns: 'http://www.w3.org/2000/svg',
                viewBox,
                role: 'img',
                'aria-hidden': 'true',
              },
              [createVNode('path', { d }, null)],
            ),
          ],
        },
      );
    };
  },
});

export default <IconSet>{ component: SVGIcon };
