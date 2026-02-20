"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const nextPath = searchParams.get("next") || "/account";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Password and confirm password do not match.");
      return;
    }

    const result = await register(
      name,
      email,
      phone,
      password,
      confirmPassword,
    );
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Unable to register.");
      return;
    }

    setStep("verify");
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const emailResponse = await fetch("/api/auth/verify-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: emailOtp }),
    });
    const emailPayload = (await emailResponse.json()) as { error?: string };
    if (!emailResponse.ok) {
      setLoading(false);
      setError(emailPayload.error ?? "Email verification failed.");
      return;
    }

    const loginResponse = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const loginPayload = (await loginResponse.json()) as { error?: string };
    if (!loginResponse.ok) {
      setLoading(false);
      setError(loginPayload.error ?? "Login failed.");
      return;
    }

    setLoading(false);
    router.push(nextPath);
    router.refresh();
  }

  return (
    <form className="card auth-card" onSubmit={step === "register" ? handleSubmit : handleVerify}>
      <h2>{step === "register" ? "Register" : "Verify Account"}</h2>
      <p className="muted">
        {step === "register"
          ? "Create an account to track orders and faster checkout."
          : "Enter the OTP sent to your email."}
      </p>

      {step === "register" ? (
        <>
          <div className="field" style={{ marginTop: "0.85rem" }}>
            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="field" style={{ marginTop: "0.75rem" }}>
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="field" style={{ marginTop: "0.75rem" }}>
            <label htmlFor="register-phone">Mobile Number</label>
            <input
              id="register-phone"
              type="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div className="field" style={{ marginTop: "0.75rem" }}>
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="field" style={{ marginTop: "0.75rem" }}>
            <label htmlFor="register-confirm-password">Confirm Password</label>
            <input
              id="register-confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <p className="muted">Password must be 8+ characters with letters and numbers.</p>
        </>
      ) : (
        <>
          <div className="field" style={{ marginTop: "0.85rem" }}>
            <label htmlFor="email-otp">Email OTP</label>
            <input
              id="email-otp"
              required
              value={emailOtp}
              onChange={(event) => setEmailOtp(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-link"
            onClick={async () => {
              setResent(false);
              const response = await fetch("/api/auth/resend-email-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              const payload = (await response.json()) as { error?: string };
              if (!response.ok) {
                setError(payload.error ?? "Unable to resend OTP.");
                return;
              }
              setResent(true);
            }}
          >
            Resend OTP
          </button>
          {resent ? <p className="muted">OTP resent to your email.</p> : null}

          <p className="muted" style={{ marginTop: "0.5rem" }}>
            Only email verification is required.
          </p>
        </>
      )}

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading
          ? step === "register"
            ? "Creating account..."
            : "Verifying..."
          : step === "register"
            ? "Create Account"
            : "Verify & Continue"}
      </button>

      {step === "register" ? (
        <p className="muted">
          Already registered?{" "}
          <Link href="/login" className="text-link">
            Login
          </Link>
        </p>
      ) : null}
    </form>
  );
}
