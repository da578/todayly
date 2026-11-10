import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { bleedRaw } from '../patterns/bleed';
import { styled } from './factory';

export const Bleed = /* @__PURE__ */ function Bleed(props) {
  const [patternProps, restProps] = splitProps(props, ["block","inline"])
  const styleProps = bleedRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}