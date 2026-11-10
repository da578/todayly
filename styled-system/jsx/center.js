import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { centerRaw } from '../patterns/center';
import { styled } from './factory';

export const Center = /* @__PURE__ */ function Center(props) {
  const [patternProps, restProps] = splitProps(props, ["inline"])
  const styleProps = centerRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}