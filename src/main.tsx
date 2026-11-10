import { render } from "solid-js/web";
import App from "./presentation/App";
import "./index.css";

// Prevent unhandled promise rejections from skipped/aborted native View Transitions
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const isValidReason =
      Boolean(reason) &&
      (typeof reason.message === "string" || typeof reason === "string");
    if (!isValidReason) return;

    const msg = reason.message || reason;
    const isTransitionError =
      msg.includes("Transition was aborted") ||
      msg.includes("Transition was skipped") ||
      msg.includes("Snapshot capture failed") ||
      msg.includes("Animation start failed");

    if (isTransitionError) {
      event.preventDefault();
    }
  });
}

const root = document.getElementById("root");
if (root) {
  render(() => <App />, root);
}
