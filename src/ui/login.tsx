import { useEffect, useState } from "react";
import { ArrowRight, Check, Mail, LockKeyhole, BookOpen } from "lucide-react";
import { z } from "zod";
import { api } from "./store";

export function Brand() {
  return (
    <a href="/" className="brand" aria-label="CS50 Track home">
      <span>
        cs50<span className="brand-light">track</span>
      </span>
    </a>
  );
}
export function Login({
  development,
  configured,
  failure,
}: {
  development: boolean;
  configured: boolean;
  failure?: string;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [developmentUrl, setDevelopmentUrl] = useState("");
  return (
    <div className="login-page">
      <header>
        <Brand />
        <a href="https://cs50.harvard.edu/x/" target="_blank" rel="noreferrer">
          Harvard CS50x <ArrowRight size={14} />
        </a>
      </header>
      <main className="login-layout">
        <section className="login-story">
          <span className="eyebrow">
            <span className="status-dot" /> A little further, every day
          </span>
          <h1>
            A big goal.
            <br />A plan that
            <br />
            <em>makes it happen.</em>
          </h1>
          <p>
            Your own little campus. A morning routine, a clear next step, and
            ten weeks to turn curiosity into code.
          </p>
          <div className="login-course">
            <BookOpen size={20} />
            <div>
              <strong>CS50’s Introduction to Computer Science</strong>
              <p>Harvard University · Your personal study companion</p>
            </div>
          </div>
          <div className="login-week-strip" aria-label="Ten week study plan">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i}>{String(i + 1).padStart(2, "0")}</span>
            ))}
          </div>
          <p className="login-caption">
            17 Nov 2026 <span>10 weeks · 5 SKS study budget</span> 25 Jan 2027
          </p>
        </section>
        <section className="login-form-panel">
          <div className="login-form">
            <div className="login-mail">
              <Mail size={24} />
            </div>
            <p className="eyebrow">Your space to learn</p>
            <h2>Welcome to your track.</h2>
            <p>
              Sign in with a link sent to your email.
              <br />
              Your plan will be right where you left it.
            </p>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setError("");
                try {
                  const result = z
                    .object({
                      message: z.string(),
                      developmentUrl: z.string().optional(),
                    })
                    .parse(await api("/api/auth/request", { email }));
                  setMessage(result.message);
                  setDevelopmentUrl(result.developmentUrl ?? "");
                } catch (failure) {
                  setError(
                    failure instanceof Error ? failure.message : "Try again.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="button primary"
                type="submit"
                disabled={busy || !configured}
              >
                {busy ? "Sending your link…" : "Send me a login link"}
                <ArrowRight size={16} />
              </button>
            </form>
            {message && (
              <p className="notice success" role="status">
                <Check size={16} />
                {message}
              </p>
            )}
            {(error || failure) && (
              <p className="notice danger" role="alert">
                {error || failure}
              </p>
            )}
            {!configured && (
              <p className="notice">
                Owner access is being configured. Your study space will be
                available once email delivery is connected.
              </p>
            )}
            {developmentUrl && (
              <a className="button secondary local-link" href={developmentUrl}>
                Open captured local login link <ArrowRight size={14} />
              </a>
            )}
            {development && (
              <p className="local-note">
                Local development · use student@localhost.test
              </p>
            )}
            <div className="login-private">
              <LockKeyhole size={14} />
              <span>
                A private space, just for you. No passwords to remember.
              </span>
            </div>
          </div>
        </section>
      </main>
      <footer>
        Built for showing up. One morning at a time.
        <span>An independent companion to Harvard CS50x.</span>
      </footer>
    </div>
  );
}
export function VerifyLink() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="verify-page">
      <Brand />
      <section className="verify-card">
        <div className="login-mail">
          <Mail size={24} />
        </div>
        <p className="eyebrow">You’re one step away</p>
        <h1>Back to your track.</h1>
        <p>Continue to open your private study plan.</p>
        <button
          className="button primary"
          type="button"
          disabled={busy || !ready}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              const token = new URLSearchParams(window.location.search).get(
                "token",
              );
              if (!token)
                throw new Error("This link is incomplete. Request a new one.");
              await api("/api/auth/verify", { token });
              window.location.replace("/");
            } catch (failure) {
              setError(
                failure instanceof Error
                  ? failure.message
                  : "This link could not be verified.",
              );
              setBusy(false);
            }
          }}
        >
          {busy ? "Opening your study space…" : "Continue to CS50 Track"}
          <ArrowRight size={16} />
        </button>
        {error && (
          <p className="notice danger" role="alert">
            {error}
          </p>
        )}
        <a href="/" className="text-link">
          Request a new login link
        </a>
      </section>
    </div>
  );
}
