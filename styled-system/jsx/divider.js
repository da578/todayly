import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { dividerRaw } from '../patterns/divider';
import { styled } from './factory';

export const Divider = /* @__PURE__ */ function Divider(props) {
  const [patternProps, restProps] = splitProps(props, ["color","orientation","thickness"])
  const styleProps = dividerRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}