import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { getSession } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams: Promise<{
    reason?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session) {
    redirect("/home");
  }

  const params = await searchParams;
  const reason = Array.isArray(params.reason)
    ? params.reason[0]
    : params.reason;

  const notice =
    reason === "session-expired"
      ? "Sesi Anda telah berakhir. Silakan masuk kembali."
      : undefined;

  return (
    <div className="animate-rise-in mx-auto w-full max-w-[460px]">
      <div className="overflow-hidden rounded-[26px] border border-line bg-surface shadow-card">
        <div
          aria-hidden="true"
          className="h-1.5 bg-gradient-to-r from-accent to-accent-light"
        />

        <div className="p-6 sm:p-8">
          <div className="mt-8">
            <p className="text-eyebrow font-bold uppercase tracking-[0.18em] text-accent">
              Akses akun
            </p>
            <h1
              id="login-title"
              className="mt-2 text-pretty text-display-md leading-tight font-semibold tracking-[-0.035em] text-ink sm:text-display-xl"
            >
              Masuk ke akun Anda
            </h1>
          </div>

          <div className="mt-7">
            <LoginForm notice={notice} />
          </div>
        </div>
      </div>
    </div>
  );
}
