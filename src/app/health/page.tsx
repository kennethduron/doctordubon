import { APP_NAME, APP_URL } from "@/lib/constants";

export default function HealthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-xl rounded-lg border border-border-soft bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-base font-bold text-white">
          CF
        </div>
        <h1 className="mt-5 text-3xl font-bold text-slate-950">Sistema activo</h1>
        <p className="mt-3 text-base font-medium text-primary">{APP_NAME}</p>
        <p className="mt-6 text-sm text-slate-500">URL esperada:</p>
        <p className="mt-1 break-all text-sm font-semibold text-slate-900">{APP_URL}</p>
      </section>
    </main>
  );
}
