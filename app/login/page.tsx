"use client";
import { identifyAnalytics, track } from "@/lib/analytics";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "@/components/icons";
import { useApp } from "@/components/context";
import { api } from "@/lib/store";
import type { User } from "@/lib/config";
function AuthForm({ register = false }: { register?: boolean }) {
  const { setUser, notify } = useApp(),
    router = useRouter();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="auth-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        const data = new FormData(e.currentTarget),
          email = String(data.get("email")),
          password = String(data.get("password"));
        if (
          register &&
          (email !== data.get("verifyEmail") ||
            password !== data.get("verifyPassword"))
        ) {
          setError("The email addresses and passwords must match.");
          return;
        }
        setBusy(true);
        try {
          const { user } = await api<{ user: User }>(
            register ? "auth/register" : "auth/login",
            "POST",
            {
              email,
              password,
              ...(register ? { name: data.get("name") } : {}),
            },
          );
          identifyAnalytics(user.id);
          track(register ? "account_created" : "account_signed_in");
          setUser(user);
          notify(register ? "Account created. Welcome!" : "Signed in.");
          router.push("/account");
        } catch (error) {
          track("account_auth_failed", { action: register ? "register" : "login" });
          setError(
            error instanceof Error ? error.message : "Unable to sign in.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>
        {register ? <UserPlus size={20} /> : <LogIn size={20} />}{" "}
        {register ? "register" : "login"}
      </h2>
      {register && (
        <input
          required
          name="name"
          aria-label="Username"
          placeholder="username"
          pattern="[a-zA-Z0-9_-]{3,20}"
          minLength={3}
          maxLength={20}
          autoComplete="username"
        />
      )}
      <input
        required
        name="email"
        aria-label={register ? "Registration email" : "Login email"}
        type="email"
        placeholder="email"
        autoComplete="email"
      />
      {register && (
        <input
          required
          name="verifyEmail"
          aria-label="Verify email"
          type="email"
          placeholder="verify email"
          autoComplete="off"
        />
      )}
      <input
        required
        name="password"
        aria-label={register ? "Registration password" : "Login password"}
        type="password"
        placeholder="password"
        autoComplete={register ? "new-password" : "current-password"}
        minLength={8}
        maxLength={128}
      />
      {register && (
        <input
          required
          name="verifyPassword"
          aria-label="Verify password"
          type="password"
          placeholder="verify password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
        />
      )}
      {error && (
        <div role="alert" className="form-error">
          {error}
        </div>
      )}
      <button type="submit" disabled={busy} className="primary-button">
        {register ? <UserPlus size={16} /> : <LogIn size={16} />}{" "}
        {busy ? "please wait..." : register ? "sign up" : "sign in"}
      </button>
      <small>
        {register
          ? "By creating an account, you agree to the terms and privacy policy. These accounts are separate from monkeytype.com."
          : "Your session is securely remembered on this device. You can sign out from your account."}
      </small>
    </form>
  );
}
export default function LoginPage() {
  return (
    <div className="auth-page">
      <AuthForm register />
      <AuthForm />
    </div>
  );
}
