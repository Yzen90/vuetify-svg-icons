import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import type { IconSet } from 'vuetify';

import { SVGIcon } from './component.js';
export { SVGIcon };
export default <IconSet>{ component: SVGIcon };

export const embed = (icon: string) => icon;

// Component expected format: 'SVG;<path data>;<view box>;<fill>;<stroke width>;<fill rule>'

// Font Awesome
export const useFA = (icon: IconDefinition) => `SVG;${icon.icon[4]};0 0 ${icon.icon[0]} ${icon.icon[1]}`;
export const useFAS = useFA;
export const useFAR = useFA;

// Material Design Icons
export const useMDI = embed;
export const useMDIL = embed;

// Heroicons
export const useHIS = (icon: string) => `SVG;${icon};;;;evenodd`;
export const useHIO = (icon: string) => `SVG;${icon};;none;1.5`;
export const useHIM = (icon: string) => `SVG;${icon};0 0 20 20;;;evenodd`;

// Bootstrap Icons
export const useBI = (icon: string) => `SVG;${icon};0 0 16 16`;
