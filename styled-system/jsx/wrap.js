import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { wrapRaw } from '../patterns/wrap';
import { styled } from './factory';

export const Wrap = /* @__PURE__ */ function Wrap(props) {
  const [patternProps, restProps] = splitProps(props, ["align","columnGap","gap","justify","rowGap"])
  const styleProps = wrapRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}