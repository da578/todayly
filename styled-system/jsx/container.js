import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { containerRaw } from '../patterns/container';
import { styled } from './factory';

export const Container = /* @__PURE__ */ function Container(props) {
  const [patternProps, restProps] = splitProps(props, [])
  const styleProps = containerRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}