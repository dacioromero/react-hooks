import { useMemo, useState, useRef, useCallback, useEffect } from "react";

// export const useFakeRef: typeof useRef = (initialValue) => {
//   return useState({ current: initialValue })[0]
// }

type UseEffect = typeof useEffect
type Deps = Parameters<UseEffect>[1]

function useDoUpdate (deps: Deps): boolean {
  // Using a ref to prevent rerenders
  const ref = useRef(deps)

  const {
    current: prevDeps
  } = ref

  if (!prevDeps) {
    if (deps) {
      throw new Error('Cannot add deps after init')
    } else {
      // Update every time with no deps
      return true
    }
  } else if (!deps) {
    throw new Error('Cannot remove deps after init')
  }

  if (deps.length !== prevDeps.length) {
    throw new Error('Cannot change number of deps after init')
  }

  // Empty array with return false
  const depsChanged = prevDeps.some((value, index) => value !== deps[index])

  if (depsChanged) {
    return true
  }

  return false
}

type Cleanup = () => void

export const useFakeEffect: UseEffect = (effect, deps): void => {
  const doUpdate = useDoUpdate(deps)
  const cleanupRef = useRef<Cleanup>()
  const firstCallRef = useRef(true)


  function update(): void {
    // Run effect after update
    setTimeout((): void => {
      const { current: cleanup } = cleanupRef

      if (cleanup) {
        cleanup()
      }

      cleanupRef.current = effect() || undefined
    }, 0)
  }

  // Update on first call
  if (firstCallRef.current) {
    firstCallRef.current = false
    return update()
  }

  if (doUpdate) {
    return update()
  }
}

type UseMemo = typeof useMemo

export const useFakeMemo: UseMemo = (factory, deps): ReturnType<typeof factory> => {
  const [state, setState] = useState(factory)
  const doUpdate = useDoUpdate(deps)

  if (doUpdate) {
    const newState = factory()
    setState(newState)

    return newState
  }

  return state
}

type UseCallback = typeof useCallback

// > useCallback(fn, deps) is equivalent to useMemo(() => fn, deps).
// - https://reactjs.org/docs/hooks-reference.html#usecallback
export const useFakeCallback: UseCallback = (callback, deps): typeof callback => useFakeMemo((): typeof callback => callback, deps)
