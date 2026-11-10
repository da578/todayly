import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { hstackRaw } from '../patterns/hstack';
import { styled } from './factory';

export const HStack = /* @__PURE__ */ function HStack(props) {
  const [patternProps, restProps] = splitProps(props, ["gap","justify"])
  const styleProps = hstackRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}