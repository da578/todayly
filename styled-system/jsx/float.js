import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { floatRaw } from '../patterns/float';
import { styled } from './factory';

export const Float = /* @__PURE__ */ function Float(props) {
  const [patternProps, restProps] = splitProps(props, ["offset","offsetX","offsetY","placement"])
  const styleProps = floatRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}