import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { gridItemRaw } from '../patterns/grid-item';
import { styled } from './factory';

export const GridItem = /* @__PURE__ */ function GridItem(props) {
  const [patternProps, restProps] = splitProps(props, ["colEnd","colSpan","colStart","rowEnd","rowSpan","rowStart"])
  const styleProps = gridItemRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}