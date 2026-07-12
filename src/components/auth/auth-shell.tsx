import Image from "next/image";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  eyebrow?: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

export function AuthShell({
  title,
  eyebrow = "Dr. Oscar Dubon",
  description,
  children,
  footer,
  wide = false,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef7fb] px-4 py-8 sm:py-12">
      <section className={`relative w-full ${wide ? "max-w-xl" : "max-w-md"}`}>
        <header className="mb-6 text-center">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg shadow-sky-900/10 sm:h-28 sm:w-28">
            <Image
              src="/images/doctordubon.jpg"
              alt="Dr. Oscar Dubon"
              width={112}
              height={112}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-primary/75">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">{title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">{description}</p>
        </header>

        <div className="rounded-lg border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-900/10 backdrop-blur sm:p-7">
          {children}
        </div>

        {footer ? <div className="mt-5 text-center text-xs leading-5 text-slate-500">{footer}</div> : null}
      </section>
    </main>
  );
}
