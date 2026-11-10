import type { RecipeDefinition, RecipeRuntimeFn, RecipeSelection, RecipeVariantRecord } from '../types/recipe';
import type { Assign, JsxHTMLProps, JsxStyleProps } from '../types/system';
import type { AsProps, DataAttrs, ElementType, JsxFactoryOptions, UnstyledProps, WithForwardedProps } from '../types/jsx';
import type { Component, ComponentProps } from 'solid-js';

type AnyRecipeDefinition = RecipeDefinition<RecipeVariantRecord>;
interface RuntimeRecipeFn {
  __type: unknown;
  (props?: never): string;
}
type RecipeContextRecipe = RecipeRuntimeFn<any, any> | RuntimeRecipeFn | AnyRecipeDefinition;
type RecipePropsOf<R extends RecipeContextRecipe> = R extends RuntimeRecipeFn ? R['__type'] : R extends RecipeRuntimeFn<infer P, any> ? P : R extends RecipeDefinition<infer T> ? RecipeSelection<T> : never;
type RecipeContextComponentProps<
  T extends ElementType,
  R extends RecipeContextRecipe,
  F extends string
> = JsxHTMLProps<ComponentProps<T> & UnstyledProps & AsProps, WithForwardedProps<Assign<RecipePropsOf<R>, JsxStyleProps>, T, F>>;
type RecipeContextComponent<
  T extends ElementType,
  R extends RecipeContextRecipe,
  F extends string = never
> = Component<RecipeContextComponentProps<T, R, F>>;
export interface RecipeContext<R extends RecipeContextRecipe> {
  withContext: <
    T extends ElementType,
    F extends string = never
  >(Component: T, options?: JsxFactoryOptions<ComponentProps<T>, F> | undefined) => RecipeContextComponent<T, R, F>;
  PropsProvider: Component<Partial<RecipePropsOf<R>> & DataAttrs>;
  usePropsContext: () => RecipePropsOf<R> | undefined;
}
export declare function createRecipeContext<R extends RecipeContextRecipe>(recipeInput: R): RecipeContext<R>;
export {};