import { createComponent, mergeProps } from 'solid-js/web';
import { createContext, createMemo, splitProps, useContext } from 'solid-js';
import { cx, sva } from '../css/index';
import { styled } from './factory';
import { getDisplayName } from './helper';

function createSafeContext(contextName) {
  const Context = createContext(undefined)
  const useStyleContext = (componentName, slot) => {
    const context = useContext(Context)
    if (context === undefined) {
      const componentInfo = componentName ? `Component "${componentName}"` : 'A component'
      const slotInfo = slot ? ` (slot: "${slot}")` : ''
      throw new Error(`${componentInfo}${slotInfo} cannot access ${contextName} because it's missing its Provider.`)
    }
    return context
  }
  return [Context, useStyleContext]
}

function resolveSlotRecipe(recipe) {
  if (recipe == null) throw new Error('createSlotRecipeContext requires a slot recipe')
  if (typeof recipe.splitVariantProps === 'function') return recipe
  if (recipe.slots) return recipe
  throw new Error('createSlotRecipeContext requires a slot recipe')
}

export function createSlotRecipeContext(recipeInput) {
  const recipe = resolveSlotRecipe(recipeInput)
  const isRuntimeRecipe = typeof recipe.splitVariantProps === 'function'
  const isConfigRecipe = isRuntimeRecipe && recipe.__recipe__ !== undefined
  const recipeName = isRuntimeRecipe && recipe.__name__ ? recipe.__name__ : undefined
  const contextName = recipeName ? `createSlotRecipeContext("${recipeName}")` : 'createSlotRecipeContext'
  const [SlotStylesContext, useSlotStylesContext] = createSafeContext(contextName)
  const slotRecipeFn = isRuntimeRecipe ? recipe : sva(recipe.config ?? recipe)

  const resolveProps = (props, slotStyles) => {
    const { unstyled, ...restProps } = props
    if (unstyled) return restProps
    if (isConfigRecipe) return { ...restProps, class: cx(slotStyles, restProps.class) }
    return { ...slotStyles, ...restProps }
  }

  const createDefaultProps = (options) => {
    const defaults = options?.defaultProps
    return typeof defaults === 'function' ? createMemo(defaults) : () => defaults
  }

  const resolveSlots = (variantProps) => {
    const styles = isConfigRecipe ? slotRecipeFn(variantProps) : slotRecipeFn.raw(variantProps)
    if (!isConfigRecipe) styles._classNameMap = slotRecipeFn.classNameMap
    return styles
  }

  const withRootProvider = (Component, options) => {
    const WithRootProvider = (props) => {
      const [variantProps, otherProps] = slotRecipeFn.splitVariantProps(props)
      const [local, propsWithoutChildren] = splitProps(otherProps, ['children'])

      const resolvedSlots = createMemo(() => {
        return resolveSlots(variantProps)
      })
      const defaultProps = createDefaultProps(options)

      const mergedProps = createMemo(() => {
        const defaults = defaultProps()
        if (!defaults) return propsWithoutChildren
        return { ...defaults, ...propsWithoutChildren }
      })

      return createComponent(SlotStylesContext.Provider, {
        get value() {
          return resolvedSlots()
        },
        get children() {
          return createComponent(
            Component,
            mergeProps(mergedProps, {
              get children() {
                return local.children ?? defaultProps()?.children
              },
            }),
          )
        },
      })
    }
    const componentName = getDisplayName(Component)
    WithRootProvider.displayName = `withRootProvider(${componentName})`
    return WithRootProvider
  }

  const withProvider = (Component, slot, options) => {
    const StyledComponent = styled(Component, {}, options)
    const WithProvider = (props) => {
      const [variantProps, restProps] = slotRecipeFn.splitVariantProps(props)
      const [local, propsWithoutChildren] = splitProps(restProps, ['children'])

      const forwardedProps = {}
      options?.forwardProps?.forEach((key) => {
        if (key in variantProps) {
          Object.defineProperty(forwardedProps, key, { get: () => variantProps[key], enumerable: true })
        }
      })

      const resolvedSlots = createMemo(() => {
        return resolveSlots(variantProps)
      })
      const defaultProps = createDefaultProps(options)

      const resolvedProps = createMemo(() => {
        const defaults = defaultProps()
        const propsWithClass = defaults ? { ...defaults, ...propsWithoutChildren } : propsWithoutChildren
        const slots = resolvedSlots()
        const resolved = resolveProps(propsWithClass, slots[slot])
        resolved.class = cx(resolved.class, slots._classNameMap?.[slot])
        resolved['data-slot'] = slot
        return resolved
      })

      return createComponent(SlotStylesContext.Provider, {
        get value() {
          return resolvedSlots()
        },
        get children() {
          return createComponent(
            StyledComponent,
            mergeProps(resolvedProps, forwardedProps, {
              get children() {
                return local.children ?? defaultProps()?.children
              },
            }),
          )
        },
      })
    }
    const componentName = getDisplayName(Component)
    WithProvider.displayName = `withProvider(${componentName})`
    return WithProvider
  }

  const withContext = (Component, slot, options) => {
    const StyledComponent = styled(Component, {}, options)
    const componentName = getDisplayName(Component)
    const WithContext = (props) => {
      const resolvedSlots = useSlotStylesContext(componentName, slot)
      const [local, propsWithoutChildren] = splitProps(props, ['children'])
      const defaultProps = createDefaultProps(options)

      const resolvedProps = createMemo(() => {
        const defaults = defaultProps()
        const propsWithClass = defaults ? { ...defaults, ...propsWithoutChildren } : propsWithoutChildren
        const resolved = resolveProps(propsWithClass, resolvedSlots[slot])
        resolved.class = cx(resolved.class, resolvedSlots._classNameMap?.[slot])
        resolved['data-slot'] = slot
        return resolved
      })

      return createComponent(
        StyledComponent,
        mergeProps(resolvedProps, {
          get children() {
            return local.children ?? defaultProps()?.children
          },
        }),
      )
    }
    WithContext.displayName = `withContext(${componentName})`
    return WithContext
  }

  return {
    withRootProvider,
    withProvider,
    withContext,
  }
}