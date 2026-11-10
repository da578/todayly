import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { stackRaw } from '../patterns/stack';
import { styled } from './factory';

export const Stack = /* @__PURE__ */ function Stack(props) {
  const [patternProps, restProps] = splitProps(props, ["align","direction","gap","justify"])
  const styleProps = stackRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}