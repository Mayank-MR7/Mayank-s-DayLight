"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/features/auth/auth-provider";

export function AuthScreen({ initialMode = "sign-in" }: { initialMode?: "sign-in" | "sign-up" }) {
  const { signIn, signUp, signOut, user, loading, configured } = useAuth();
  const router = useRouter();
  const mode = initialMode;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const signingUp = useRef(false);

  useEffect(() => {
    if (configured && !loading && user && !signingUp.current) router.replace("/");
  }, [configured, loading, router, user]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    if (mode === "sign-up") signingUp.current = true;
    setBusy(true);
    try {
      const error = mode === "sign-in" ? await signIn(email, password) : await signUp(email, password);
      if (error) {
        signingUp.current = false;
        setMessage(error);
        return;
      }
      if (mode === "sign-up") {
        await signOut();
        router.replace("/login?signup=success");
        return;
      }
      setMessage("Signed in.");
    } catch {
      signingUp.current = false;
      setMessage("We could not complete that request. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (mode === "sign-in" && new URLSearchParams(window.location.search).get("signup") === "success") {
      setMessage("Account created. Sign in with your email and password.");
    }
  }, [mode]);

  return <main className={`auth-screen dark-theme auth-screen-${mode}`}>
    <div className="auth-layout">
      <section className="auth-story" aria-label="About Daylight">
        <Link className="auth-brand" href="/" aria-label="Daylight home"><span className="auth-brand-mark"><Icon name="spark" size={17}/></span>daylight<span>.</span></Link>
        <div className="auth-story-copy">
          <div className="auth-story-kicker"><span/> A LITTLE MORE ROOM TO BREATHE</div>
          <h2>Make space for what <em>matters.</em></h2>
          <p>A thoughtful home for your days, your students, and the music you make together.</p>
          <div className="auth-story-card">
            <span className="auth-story-icon"><Icon name="calendar" size={17}/></span>
            <span><b>Your studio, in rhythm</b><small>Plans, lessons, and progress in one calm place.</small></span>
            <Icon name="arrow" size={16}/>
          </div>
        </div>
        <div className="auth-story-foot"><span className="auth-foot-mark">✳</span> A calmer way to keep showing up.</div>
      </section>

      <form className="auth-card" onSubmit={submit}>
        <div className="auth-card-kicker"><span className="auth-kicker-mark"><Icon name="spark" size={14}/></span>{mode === "sign-in" ? "WELCOME BACK" : "YOUR NEXT CHAPTER"}</div>
        <h1>{mode === "sign-in" ? "Come on in." : "Let’s get started."}</h1>
        <p>{mode === "sign-in" ? "Sign in to pick up right where you left off." : "Create your login with an email and password."}</p>
        {!configured && <div className="auth-message" role="status">Authentication is required, but Supabase is not configured yet. Add the project URL and publishable key to enable sign-in.</div>}
        <label htmlFor="auth-email">Email address<input id="auth-email" type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"/></label>
        <label htmlFor="auth-password">Password<span className="auth-password-control"><input id="auth-password" type={showPassword ? "text" : "password"} required minLength={mode === "sign-up" ? 8 : 6} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} value={password} onChange={event => setPassword(event.target.value)} placeholder={mode === "sign-up" ? "At least 8 characters" : "Your password"}/><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></span></label>
        {message && <div className="auth-message" role="status">{message}</div>}
        <button className="auth-submit" disabled={busy || !configured}>{busy ? "Please wait…" : mode === "sign-in" ? "Sign in to your studio" : "Create my account"}<Icon name="arrow" size={16}/></button>
        <div className="auth-switch-row"><span>{mode === "sign-in" ? "New to Daylight?" : "Already have an account?"}<Link href={mode === "sign-in" ? "/signup" : "/login"}>{mode === "sign-in" ? "Create an account" : "Sign in"}</Link></span></div>
        <div className="auth-secure-note"><Icon name="check" size={14}/> Your password is securely protected.</div>
      </form>
    </div>
  </main>;
}
