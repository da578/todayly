import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { spacerRaw } from '../patterns/spacer';
import { styled } from './factory';

export const Spacer = /* @__PURE__ */ function Spacer(props) {
  const [patternProps, restProps] = splitProps(props, ["size"])
  const styleProps = spacerRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}