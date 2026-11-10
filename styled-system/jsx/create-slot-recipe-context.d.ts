import type { RecipeSelection, SlotRecipeDefinition, SlotRecipeRuntimeFn, SlotRecipeVariantRecord } from '../types/recipe';
import type { Assign, JsxHTMLProps, JsxStyleProps } from '../types/system';
import type { AsProps, DataAttrs, ElementType, JsxFactoryOptions, MaybeAccessor, UnstyledProps, WithForwardedProps } from '../types/jsx';
import type { Component, ComponentProps } from 'solid-js';

type AnySlotRecipeDefinition = SlotRecipeDefinition<string, SlotRecipeVariantRecord<string>>;
interface RuntimeSlotRecipeFn {
  __type: unknown;
  __slot: string;
  (props?: never): unknown;
}
type SlotRecipeContextInput = SlotRecipeRuntimeFn<string, any, any> | RuntimeSlotRecipeFn | AnySlotRecipeDefinition;
type SlotNameOf<R extends SlotRecipeContextInput> = R extends RuntimeSlotRecipeFn ? R['__slot'] : R extends SlotRecipeRuntimeFn<infer S, any, any> ? S : R extends SlotRecipeDefinition<infer S, any> ? S : string;
type SlotRecipePropsOf<R extends SlotRecipeContextInput> = R extends RuntimeSlotRecipeFn ? R['__type'] : R extends SlotRecipeRuntimeFn<any, infer P, any> ? P : R extends SlotRecipeDefinition<any, infer T> ? RecipeSelection<T> : never;
interface WithProviderOptions<P> {
  defaultProps?: MaybeAccessor<Partial<P> & DataAttrs> | undefined;
}
type SlotRecipeProviderComponent<
  T extends ElementType,
  R extends SlotRecipeContextInput,
  F extends string = never
> = Component<JsxHTMLProps<ComponentProps<T> & UnstyledProps & AsProps, WithForwardedProps<Assign<SlotRecipePropsOf<R>, JsxStyleProps>, T, F>>>;
type SlotRecipeRootProviderComponent<
  T extends ElementType,
  R extends SlotRecipeContextInput
> = Component<ComponentProps<T> & UnstyledProps & SlotRecipePropsOf<R>>;
type SlotRecipeConsumerComponent<
  T extends ElementType,
  F extends string = never
> = Component<JsxHTMLProps<ComponentProps<T> & UnstyledProps & AsProps, WithForwardedProps<JsxStyleProps, T, F>>>;
export interface SlotRecipeContext<R extends SlotRecipeContextInput> {
  withRootProvider: <T extends ElementType>(Component: T, options?: WithProviderOptions<ComponentProps<T>> | undefined) => SlotRecipeRootProviderComponent<T, R>;
  withProvider: <
    T extends ElementType,
    F extends string = never
  >(Component: T, slot: SlotNameOf<R>, options?: JsxFactoryOptions<ComponentProps<T>, F> | undefined) => SlotRecipeProviderComponent<T, R, F>;
  withContext: <
    T extends ElementType,
    F extends string = never
  >(Component: T, slot: SlotNameOf<R>, options?: JsxFactoryOptions<ComponentProps<T>, F> | undefined) => SlotRecipeConsumerComponent<T, F>;
}
export declare function createSlotRecipeContext<R extends SlotRecipeContextInput>(recipeInput: R): SlotRecipeContext<R>;
export {};