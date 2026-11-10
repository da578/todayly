import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { circleRaw } from '../patterns/circle';
import { styled } from './factory';

export const Circle = /* @__PURE__ */ function Circle(props) {
  const [patternProps, restProps] = splitProps(props, ["size"])
  const styleProps = circleRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}