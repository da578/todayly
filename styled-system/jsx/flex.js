import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { flexRaw } from '../patterns/flex';
import { styled } from './factory';

export const Flex = /* @__PURE__ */ function Flex(props) {
  const [patternProps, restProps] = splitProps(props, ["align","basis","direction","grow","justify","shrink","wrap"])
  const styleProps = flexRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}