import { createVNode, mergeProps } from 'vue';
import type { IconProps } from 'vuetify';

export function SVGIcon(props: IconProps, { attrs }: any) {
  return () => {
    const svgAttrs: Record<string, any> = {
      class: 'v-icon__svg',
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      role: 'img',
      'aria-hidden': 'true',
    };

    let d = props.icon as string;

    if (d.startsWith?.('SVG;')) {
      const parts = d.split(';');

      d = parts[1] ?? '';

      if (parts[2]?.length) svgAttrs['viewBox'] = parts[2];

      if (parts[3]?.length) {
        svgAttrs['fill'] = parts[3];
        svgAttrs['style'] = `fill: ${parts[3]};`;
      }

      if (parts[4]?.length) {
        svgAttrs['stroke-width'] = parts[4];
        svgAttrs['stroke'] = 'currentColor';
      }

      if (parts[5]?.length) svgAttrs['fill-rule'] = parts[5];
    }

    return createVNode(props.tag, mergeProps(attrs, { style: null }), {
      default: () => [createVNode('svg', svgAttrs, [createVNode('path', { d }, null)])],
    });
  };
}

SVGIcon.props = ['icon', 'tag'];
