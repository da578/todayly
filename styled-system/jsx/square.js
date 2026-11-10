import { createMemo, mergeProps, splitProps } from 'solid-js';
import { createComponent } from 'solid-js/web';
import { squareRaw } from '../patterns/square';
import { styled } from './factory';

export const Square = /* @__PURE__ */ function Square(props) {
  const [patternProps, restProps] = splitProps(props, ["size"])
  const styleProps = squareRaw(patternProps)
  const mergedProps = mergeProps(styleProps, restProps)
  return createComponent(styled["div"], mergedProps)
}