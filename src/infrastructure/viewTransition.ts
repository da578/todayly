/**
 * Browser-native CSS View Transitions API helper.
 * Provides GPU-accelerated layout morphing with full error silencing
 * for aborted/skipped/snapshot-capture transitions.
 */

interface ViewTransitionHandle {
  ready?: Promise<void>;
  finished?: Promise<void>;
  updateCallbackDone?: Promise<void>;
  skipTransition?: () => void;
  catch?: (onrejected?: (reason: unknown) => unknown) => Promise<unknown>;
}

let activeTransition: ViewTransitionHandle | null = null;

export function startViewTransition(callback: () => void): void {
  const isSupported =
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    typeof (document as any).startViewTransition === "function" &&
    document.visibilityState !== "hidden";

  if (!isSupported) {
    callback();
    return;
  }

  if (activeTransition) {
    callback();
    return;
  }

  try {
    const transition = (document as any).startViewTransition(() => {
      try {
        callback();
      } catch (err) {
        console.warn("ViewTransition update callback error:", err);
      }
    });

    activeTransition = transition;

    if (!transition) {
      return;
    }

    if (typeof transition.catch === "function") {
      transition.catch(() => {});
    }
    if (typeof transition.ready?.catch === "function") {
      transition.ready.catch(() => {});
    }
    if (typeof transition.updateCallbackDone?.catch === "function") {
      transition.updateCallbackDone.catch(() => {});
    }
    if (typeof transition.finished?.catch === "function") {
      transition.finished.catch(() => {});
      transition.finished.finally(() => {
        if (activeTransition === transition) {
          activeTransition = null;
        }
      });
    }
  } catch {
    callback();
  }
}
