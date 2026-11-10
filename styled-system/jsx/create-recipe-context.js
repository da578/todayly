import { createComponent, mergeProps } from 'solid-js/web';
import { createContext, useContext } from 'solid-js';
import { styled } from './factory';
import { getDisplayName } from './helper';

function resolveRecipe(recipe) {
  if (recipe == null) throw new Error('createRecipeContext requires a recipe')
  if (typeof recipe === 'function') return recipe
  throw new Error('createRecipeContext requires a recipe')
}

export function createRecipeContext(recipeInput) {
  const recipe = resolveRecipe(recipeInput)
  const PropsContext = createContext(undefined)
  const usePropsContext = () => useContext(PropsContext)

  const withContext = (Component, options) => {
    const StyledComponent = styled(Component, recipe, options)
    const componentName = getDisplayName(Component)

    const WithContext = (inProps) => {
      const propsContext = usePropsContext()
      const props = propsContext ? mergeProps(propsContext, inProps) : inProps
      return createComponent(StyledComponent, props)
    }

    WithContext.displayName = `withContext(${componentName})`
    return WithContext
  }

  return {
    withContext,
    PropsProvider: PropsContext.Provider,
    usePropsContext,
  }
}