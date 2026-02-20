"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nextPath = searchParams.get("next") || "/account";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Unable to login.");
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <p className="muted">Access your account securely.</p>

      <div className="field" style={{ marginTop: "0.85rem" }}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="field" style={{ marginTop: "0.75rem" }}>
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="muted">
        New user?{" "}
        <Link href="/register" className="text-link">
          Register here
        </Link>
      </p>
      <p className="muted">
        Forgot your password?{" "}
        <Link href="/forgot-password" className="text-link">
          Reset it
        </Link>
      </p>
    </form>
  );
}
