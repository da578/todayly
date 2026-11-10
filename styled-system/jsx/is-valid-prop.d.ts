import type { DistributiveOmit, JsxStyleProps } from '../types/system';

type CssPropKey = keyof JsxStyleProps;
type OmittedCssProps<T> = DistributiveOmit<T, CssPropKey>;
export declare function isCssProperty(value: string): boolean;
export declare function splitCssProps<T>(props: T): [JsxStyleProps, OmittedCssProps<T>];
export {};