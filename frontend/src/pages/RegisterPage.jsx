import { useMemo, useState } from "react";
import { createPerson } from "../lib/api.js";
import { validateEmail, validateFullName } from "../lib/validation.js";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const errors = useMemo(() => {
    const fullNameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    return { fullNameError, emailError, hasAny: !!(fullNameError || emailError) };
  }, [fullName, email]);

  async function onSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (errors.hasAny) {
      setMessage({ type: "error", text: "Please fix the validation errors." });
      return;
    }

    setSubmitting(true);
    try {
      await createPerson({ full_name: fullName.trim(), email: email.trim() });
      setFullName("");
      setEmail("");
      setMessage({ type: "success", text: "Person created successfully." });
    } catch (err) {
      const code = err?.data?.error;
      if (err?.status === 409 && code === "EMAIL_ALREADY_EXISTS") {
        setMessage({ type: "error", text: "This email already exists." });
      } else if (err?.status === 400) {
        setMessage({ type: "error", text: "Validation error from server." });
      } else {
        setMessage({ type: "error", text: "Server error. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Registration</h1>
          <p className="muted">Add a new person to the database.</p>
        </div>
      </div>

      <div className="card">
        <form className="form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="fullName">
              Full Name<span className="required-star">*</span>
            </label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ada Lovelace"
              autoComplete="name"
            />
            {errors.fullNameError ? (
              <div className="field-error">{errors.fullNameError}</div>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="email">
              Email<span className="required-star">*</span>
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ada@example.com"
              autoComplete="email"
            />
            {errors.emailError ? (
              <div className="field-error">{errors.emailError}</div>
            ) : null}
          </div>

          <div className="row">
            <button className="btn btn-primary" disabled={submitting} type="submit">
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setFullName("");
                setEmail("");
                setMessage(null);
              }}
              disabled={submitting}
            >
              Clear
            </button>
          </div>

          {message ? (
            <div className={message.type === "success" ? "alert success" : "alert error"}>
              {message.text}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}

