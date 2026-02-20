"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Step = "request" | "verify" | "reset" | "done";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setLoading(false);
      setError(payload.error ?? "Unable to send OTP.");
      return;
    }
    setLoading(false);
    setStep("verify");
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/password-reset/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setLoading(false);
      setError(payload.error ?? "OTP verification failed.");
      return;
    }
    setLoading(false);
    setStep("reset");
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    const response = await fetch("/api/auth/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        otp,
        newPassword: password,
        confirmPassword,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setLoading(false);
      setError(payload.error ?? "Password reset failed.");
      return;
    }
    setLoading(false);
    setStep("done");
  }

  return (
    <form
      className="card auth-card"
      onSubmit={
        step === "request" ? handleRequest : step === "verify" ? handleVerify : handleReset
      }
    >
      <h2>Forgot Password</h2>
      <p className="muted">
        {step === "request" && "Enter your email to receive a reset OTP."}
        {step === "verify" && "Enter the OTP sent to your email."}
        {step === "reset" && "Set a new password for your account."}
        {step === "done" && "Your password has been updated."}
      </p>

      {step === "request" ? (
        <div className="field" style={{ marginTop: "0.85rem" }}>
          <label htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      ) : null}

      {step === "verify" ? (
        <div className="field" style={{ marginTop: "0.85rem" }}>
          <label htmlFor="reset-otp">Email OTP</label>
          <input
            id="reset-otp"
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
          />
        </div>
      ) : null}

      {step === "reset" ? (
        <>
          <div className="field" style={{ marginTop: "0.85rem" }}>
            <label htmlFor="reset-password">New Password</label>
            <input
              id="reset-password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="field" style={{ marginTop: "0.75rem" }}>
            <label htmlFor="reset-confirm-password">Confirm Password</label>
            <input
              id="reset-confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        </>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      {step !== "done" ? (
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading
            ? "Please wait..."
            : step === "request"
              ? "Send OTP"
              : step === "verify"
                ? "Verify OTP"
                : "Reset Password"}
        </button>
      ) : (
        <Link href="/login" className="btn btn-primary">
          Back to Login
        </Link>
      )}
    </form>
  );
}
