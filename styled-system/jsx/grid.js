import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { gridRaw } from '../patterns/grid';
import { styled } from './factory';

export const Grid = /* @__PURE__ */ function Grid(props) {
  const [patternProps, restProps] = splitProps(props, ["columnGap","columns","gap","minChildWidth","rowGap"])
  const styleProps = gridRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}