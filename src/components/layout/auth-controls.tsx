"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function AuthControls() {
  const router = useRouter();
  const { user, status, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  if (status === "loading") {
    return <span className="nav-pill muted">Checking session...</span>;
  }

  if (!user) {
    return (
      <>
        <Link href="/login" className="nav-link nav-link-login">
          <span className="nav-text-icon" aria-hidden>
            <svg viewBox="0 0 24 24" role="presentation" focusable="false">
              <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M5 20c1.5-3.5 12.5-3.5 14 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          Login
        </Link>
        <Link href="/register" className="nav-link nav-link-primary nav-link-register">
          <span className="nav-text-icon" aria-hidden>
            <svg viewBox="0 0 24 24" role="presentation" focusable="false">
              <circle cx="10" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M3.5 20c1.4-3.4 11.6-3.4 13 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M18 8v6m-3-3h6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          Register
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/account" className="nav-link nav-link-account">
        <span className="nav-text-icon" aria-hidden>
          <svg viewBox="0 0 24 24" role="presentation" focusable="false">
            <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M5 20c1.5-3.5 12.5-3.5 14 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
        Hi, {user.name.split(" ")[0]}
      </Link>
      <button type="button" className="nav-link nav-button nav-link-logout" onClick={handleLogout}>
        <span className="nav-text-icon" aria-hidden>
          <svg viewBox="0 0 24 24" role="presentation" focusable="false">
            <path
              d="M10 7v-2.2c0-0.9 0.7-1.6 1.6-1.6h6.2c0.9 0 1.6 0.7 1.6 1.6v14.4c0 0.9-0.7 1.6-1.6 1.6h-6.2c-0.9 0-1.6-0.7-1.6-1.6V17"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M3.5 12h10m0 0-3.2-3.2M13.5 12l-3.2 3.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        Logout
      </button>
    </>
  );
}
