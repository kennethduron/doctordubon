import Image from "next/image";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  eyebrow?: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  variant?: "stacked" | "split";
  panelTitle?: string;
};

export function AuthShell({
  title,
  eyebrow = "Dr. Oscar Dubon",
  description,
  children,
  footer,
  wide = false,
  variant = "stacked",
  panelTitle,
}: AuthShellProps) {
  if (variant === "split") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef7fb] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <section className="grid w-full max-w-6xl items-center gap-6 lg:min-h-[min(760px,calc(100vh-3rem))] lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 xl:gap-14">
          <header className="text-center">
            <div className="mx-auto h-28 w-28 rounded-full border border-white/90 bg-white p-1.5 shadow-xl shadow-sky-900/15 sm:h-32 sm:w-32 lg:h-56 lg:w-56 lg:p-2 xl:h-64 xl:w-64">
              <div className="h-full w-full overflow-hidden rounded-full">
                <Image
                  src="/images/doctordubon.jpg"
                  alt="Dr. Oscar Dubon"
                  width={256}
                  height={256}
                  className="h-full w-full object-cover"
                  preload
                />
              </div>
            </div>

            <p className="mt-4 text-xs font-bold uppercase text-primary/75 sm:mt-5 lg:mt-6">{eyebrow}</p>
            <h1 className="mx-auto mt-3 max-w-xl text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-4xl xl:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              {description}
            </p>

            {footer ? <div className="mt-6 text-center text-xs leading-5 text-slate-500">{footer}</div> : null}
          </header>

          <div className="w-full rounded-lg border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-900/10 backdrop-blur sm:p-7 lg:justify-self-end">
            {panelTitle ? <h2 className="mb-5 text-xl font-bold text-slate-950">{panelTitle}</h2> : null}
            {children}
          </div>
        </section>
      </main>
    );
  }

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
