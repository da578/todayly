/**
 * SolidJS reactive hook subscribing to the unidirectional framework-agnostic TaskStore.
 *
 * # Traceability
 * - Requirement: `@impl:FR-STORE-01`
 * - Design: `@design:FR-STORE-01`
 *
 * # Arguments
 * - None.
 *
 * # Returns
 * Tuple of `[stateAccessor, actions]` providing fine-grained reactive read access and action dispatchers.
 */
import { createSignal, onCleanup } from "solid-js";
import { taskStore, TaskStoreState } from "./taskStore";

export function useSolidTaskStore(): [() => TaskStoreState, typeof taskStore] {
  const [state, setState] = createSignal<TaskStoreState>(taskStore.getState());
  const unsubscribe = taskStore.subscribe(() => {
    setState({ ...taskStore.getState() });
  });
  onCleanup(unsubscribe);
  return [state, taskStore];
}
