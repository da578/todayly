import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { vstackRaw } from '../patterns/vstack';
import { styled } from './factory';

export const VStack = /* @__PURE__ */ function VStack(props) {
  const [patternProps, restProps] = splitProps(props, ["gap","justify"])
  const styleProps = vstackRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}