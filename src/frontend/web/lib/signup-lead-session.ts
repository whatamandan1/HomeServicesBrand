const SESSION_KEY = "signup_session_id";

export function getSignupSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function signupLeadStepLabel(step: number): string {
  switch (step) {
    case 0:
      return "Garden size";
    case 1:
      return "Services selected";
    case 2:
      return "Plan matched";
    case 3:
      return "Contact details";
    case 4:
      return "Address entered";
    default:
      return "Signup started";
  }
}
