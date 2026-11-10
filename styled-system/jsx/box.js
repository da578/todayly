import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { boxRaw } from '../patterns/box';
import { styled } from './factory';

export const Box = /* @__PURE__ */ function Box(props) {
  const [patternProps, restProps] = splitProps(props, [])
  const styleProps = boxRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}