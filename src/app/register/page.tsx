import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Register",
};

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
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
          <h1>Create Account</h1>
          <p>Register to manage profile, orders, and checkout faster.</p>
        </div>
      </header>
      <section className="section">
        <div className="container auth-layout">
          <RegisterForm />
        </div>
      </section>
    </>
  );
}

