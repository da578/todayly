import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { linkOverlayRaw } from '../patterns/link-overlay';
import { styled } from './factory';

export const LinkOverlay = /* @__PURE__ */ function LinkOverlay(props) {
  const [patternProps, restProps] = splitProps(props, [])
  const styleProps = linkOverlayRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["a"], mergedProps)
}