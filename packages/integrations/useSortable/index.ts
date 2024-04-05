import { defaultDocument, toValue, tryOnMounted, tryOnScopeDispose, unrefElement } from '@vueuse/core'
import type { ConfigurableDocument, MaybeRefOrGetter } from '@vueuse/core'
import Sortable, { MultiDrag, type Options } from 'sortablejs'
import { isRef, nextTick } from 'vue-demi'

export interface UseSortableReturn {
  /**
   * start sortable instance
   */
  start: () => void
  /**
   * destroy sortable instance
   */
  stop: () => void

  /**
   * Options getter/setter
   * @param name a Sortable.Options property.
   * @param value a value.
   */
  option: (<K extends keyof Sortable.Options>(name: K, value: Sortable.Options[K]) => void) & (<K extends keyof Sortable.Options>(name: K) => Sortable.Options[K])
}

export type UseSortableOptions = Options & ConfigurableDocument

export function useSortable<T>(selector: string, list: MaybeRefOrGetter<T[]>,
  options?: UseSortableOptions): UseSortableReturn
export function useSortable<T>(el: MaybeRefOrGetter<HTMLElement | null | undefined>, list: MaybeRefOrGetter<T[]>,
  options?: UseSortableOptions): UseSortableReturn

/**
 * Wrapper for sortablejs.
 * @param el
 * @param list
 * @param options
 */
export function useSortable<T>(
  el: MaybeRefOrGetter<HTMLElement | null | undefined> | string,
  list: MaybeRefOrGetter<T[]>,
  options: UseSortableOptions = {},
): UseSortableReturn {
  let sortable: Sortable | undefined

  const { document = defaultDocument, ...resetOptions } = options

  const defaultOptions: Options = {
    onUpdate: (e) => {
      moveArrayElement(
        list,
        e.items?.length ? e.items : [e.item!],
        e.oldIndicies?.length ? e.oldIndicies.map(oldIndex => oldIndex.index) : [e.oldIndex!],
        e.newIndicies?.length ? e.newIndicies.map(newIndex => newIndex.index) : [e.newIndex!],
      )
    },
  }

  const start = () => {
    const target = (typeof el === 'string' ? document?.querySelector(el) : unrefElement(el))
    const mergedOptions = { ...defaultOptions, ...resetOptions }

    if (!target || sortable !== undefined)
      return

    if (mergedOptions.multiDrag)
      Sortable.mount(new MultiDrag())

    sortable = new Sortable(target as HTMLElement, { ...defaultOptions, ...resetOptions })
  }

  const stop = () => {
    sortable?.destroy()
    sortable = undefined
  }

  const option = <K extends keyof Options>(name: K, value?: Options[K]) => {
    if (value !== undefined)
      sortable?.option(name, value)
    else
      return sortable?.option(name)
  }

  tryOnMounted(start)

  tryOnScopeDispose(stop)

  return {
    stop,
    start,
    option: option as UseSortableReturn['option'],
  }
}

export function moveArrayElement<T>(
  list: MaybeRefOrGetter<T[]>,
  domElements: HTMLElement[],
  from: number[],
  to: number[],
): void {
  const _valueIsRef = isRef(list)
  // When the list is a ref, make a shallow copy of it to avoid repeatedly triggering side effects when moving elements
  const array = _valueIsRef ? [...toValue(list)] : toValue(list)
  const originalArray = [...array]

  // Credits: https://stackoverflow.com/a/69574526
  const swapIndex = (array: T[], from: number, to: number) => (
    from < to
      ? [
          ...array.slice(0, from), // Chunk from beginning of array up to original position
          ...array.slice(from + 1, to + 1), // Chunk from after original position up to new position
          array[from], // Target element gets inserted here
          ...array.slice(to + 1), // Chunk from after new position to end of array
        ]
      : [...array.slice(0, to), array[from], ...array.slice(to, from), ...array.slice(from + 1)]
  )

  let newArray = originalArray
  let currentTo = to[0]
  const targetElements = from.map(idx => array[idx])
  let lastMovedElement = null
  targetElements.forEach((element, idx) => {
    lastMovedElement = element
    currentTo = newArray.indexOf(lastMovedElement)
    if (currentTo === -1)
      currentTo = to[idx]
    const fromIndex = newArray.indexOf(element)
    newArray = swapIndex(newArray, fromIndex, currentTo)
  })

  nextTick(() => {
    // When list is ref, assign array to list.value
    if (_valueIsRef)
      list.value = newArray

    // If multiDrag is enabled, deselect all elements
    if (Sortable.MultiDrag) {
      domElements.forEach((element) => {
        Sortable.utils.deselect(element)
      })
    }
  })
}
