"use client";

// Inspired by react-hot-toast library
import * as React from "react";

// The original file imported types from "@/components/ui/toast".
// In a pure JS setup, you'll need to ensure the actual Toast component
// (and its sub-components like ToastAction) are available as JS files
// in your src/components/ui/toast.jsx.
// We'll define a basic structure here that matches what's expected.

// Removed: type ToastActionElement, ToastProps
// These types are replaced by inferred types or omitted in JS.

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000; // Original value, consider if this is too long (1 million ms = 1000 seconds)

// Removed: type ToasterToast
// We'll rely on the structure of the toast object itself.
// type ToasterToast = ToastProps & {
//   id: string;
//   title?: React.ReactNode;
//   description?: React.ReactNode;
//   action?: ToastActionElement;
// };

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
}; // Removed 'as const'

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Removed: type ActionType = typeof actionTypes;
// Removed: type Action = ... (all the union types for actions)
// We'll handle actions based on their 'type' property in the reducer.

// Removed: interface State { toasts: ToasterToast[] }
// We'll define the initial state directly.

const toastTimeouts = new Map(); // Removed <string, ReturnType<typeof setTimeout>>

const addToRemoveQueue = (toastId) => { // Removed ': string'
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

// Removed ': State' and ': Action' from parameters and return type
export const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default: // Always include a default case for reducers
        return state;
  }
};

const listeners = []; // Removed ': Array<(state: State) => void>'

let memoryState = { toasts: [] }; // Removed ': State'

function dispatch(action) { // Removed ': Action'
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// Removed: type Toast = Omit<ToasterToast, "id">;
// We'll just accept props directly.
function toast(props) { // Removed '{ ...props }: Toast'
  const id = genId();

  const update = (updatedProps) => // Removed ': ToasterToast'
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...updatedProps, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState(memoryState); // Removed '<State>'

  React.useEffect(() => {
    // Add the setState function to the listeners array
    listeners.push(setState);

    // Cleanup function: remove the setState function from listeners when component unmounts
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]); // Dependency array includes state to re-run effect if state changes,
               // ensuring listeners array is always up-to-date with current setState.
               // Note: The original had [state] which is unusual for a global state manager.
               // Often, this would be [] if setState is stable. However, keeping it as is
               // to match original behavior. If issues arise, consider changing to [].

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }), // Removed '?: string'
  };
}

export { useToast, toast };
