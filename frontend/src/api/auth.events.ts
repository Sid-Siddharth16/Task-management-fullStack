// Lets the axios layer tell the React auth state that the session is gone
// without importing React code into the API layer.
const target = new EventTarget();
const SESSION_EXPIRED = "auth:session-expired";

export const emitSessionExpired = () => target.dispatchEvent(new Event(SESSION_EXPIRED));

export const onSessionExpired = (listener: () => void) => {
  target.addEventListener(SESSION_EXPIRED, listener);
  return () => target.removeEventListener(SESSION_EXPIRED, listener);
};
