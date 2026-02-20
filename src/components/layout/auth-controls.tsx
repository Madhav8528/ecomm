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
        <Link href="/login" className="nav-link">
          Login
        </Link>
        <Link href="/register" className="nav-link nav-link-primary">
          Register
        </Link>
      </>
    );
  }

  return (
    <>
      <span className="nav-pill">Hi, {user.name.split(" ")[0]}</span>
      <Link href="/account" className="nav-link">
        My Account
      </Link>
      <button type="button" className="nav-link nav-button" onClick={handleLogout}>
        Logout
      </button>
    </>
  );
}

