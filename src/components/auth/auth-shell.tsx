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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef7fb] px-4 py-6 sm:py-10">
      <section className={`relative w-full ${wide ? "max-w-xl" : "max-w-md"}`}>
        <header className="mb-5 text-center sm:mb-6">
          <div className="mx-auto h-28 w-28 rounded-full border border-white/90 bg-white p-1.5 shadow-xl shadow-sky-900/15 sm:h-36 sm:w-36 sm:p-2">
            <div className="h-full w-full overflow-hidden rounded-full">
              <Image
                src="/images/doctordubon.jpg"
                alt="Dr. Oscar Dubon"
                width={144}
                height={144}
                className="h-full w-full object-cover"
                preload
              />
            </div>
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-primary/75 sm:mt-5">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">{title}</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600 sm:mt-3">{description}</p>
        </header>

        <div className="rounded-lg border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-900/10 backdrop-blur sm:p-7">
          {children}
        </div>

        {footer ? <div className="mt-5 text-center text-xs leading-5 text-slate-500">{footer}</div> : null}
      </section>
    </main>
  );
}
