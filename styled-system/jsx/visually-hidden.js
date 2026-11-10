import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { visuallyHiddenRaw } from '../patterns/visually-hidden';
import { styled } from './factory';

export const VisuallyHidden = /* @__PURE__ */ function VisuallyHidden(props) {
  const [patternProps, restProps] = splitProps(props, [])
  const styleProps = visuallyHiddenRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}