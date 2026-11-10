import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { cqRaw } from '../patterns/cq';
import { styled } from './factory';

export const Cq = /* @__PURE__ */ function Cq(props) {
  const [patternProps, restProps] = splitProps(props, ["name","type"])
  const styleProps = cqRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}