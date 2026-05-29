"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const nextPath = searchParams.get("next") || "/account";
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;

    let disposed = false;

    const handleGoogleCredential = async (response: GoogleCredentialResponse) => {
      if (disposed) return;
      if (!response.credential) {
        setError("Google login failed. Please try again.");
        return;
      }

      setError("");
      setGoogleLoading(true);
      const result = await googleLogin(response.credential);
      setGoogleLoading(false);

      if (!result.ok) {
        setError(result.error ?? "Google login failed.");
        return;
      }

      const destination = result.requiresPhoneVerification
        ? "/account?verify_phone=1&source=google"
        : nextPath;
      router.push(destination);
      router.refresh();
    };

    const initializeGoogleButton = () => {
      if (disposed || !googleButtonRef.current || !window.google?.accounts?.id) return;
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "signin_with",
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
      return () => {
        disposed = true;
      };
    }

    const scriptId = "google-identity-service";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const onLoad = () => {
      initializeGoogleButton();
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", onLoad);
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", onLoad);
    }

    return () => {
      disposed = true;
      script?.removeEventListener("load", onLoad);
    };
  }, [googleClientId, googleLogin, nextPath, router]);

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

      <button type="submit" className="btn btn-primary" disabled={loading || googleLoading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      {googleClientId ? (
        <>
          <div className="auth-divider">or</div>
          <div
            ref={googleButtonRef}
            className={`google-login-btn-wrap ${googleLoading ? "is-loading" : ""}`}
          />
        </>
      ) : null}

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
