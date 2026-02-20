import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Login",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getSessionUser();
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/account";

  if (user) {
    redirect(nextPath);
  }

  return (
    <>
      <header className="page-header">
        <div className="container">
          <h1>Login</h1>
          <p>Secure sign in to access account and orders.</p>
        </div>
      </header>
      <section className="section">
        <div className="container auth-layout">
          <LoginForm />
        </div>
      </section>
    </>
  );
}

