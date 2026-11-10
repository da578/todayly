import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { aspectRatioRaw } from '../patterns/aspect-ratio';
import { styled } from './factory';

export const AspectRatio = /* @__PURE__ */ function AspectRatio(props) {
  const [patternProps, restProps] = splitProps(props, ["ratio"])
  const styleProps = aspectRatioRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}