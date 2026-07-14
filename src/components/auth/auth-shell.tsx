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
  highlights?: string[];
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
  highlights,
}: AuthShellProps) {
  if (variant === "split") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef7fb] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <section className="grid w-full max-w-6xl items-center gap-6 lg:min-h-[min(760px,calc(100vh-3rem))] lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 xl:gap-14">
          <header className="text-center lg:text-left">
            <div className="mx-auto h-28 w-28 rounded-full border border-white/90 bg-white p-1.5 shadow-xl shadow-sky-900/15 sm:h-32 sm:w-32 lg:mx-0 lg:h-48 lg:w-48 lg:p-2 xl:h-56 xl:w-56">
              <div className="h-full w-full overflow-hidden rounded-full">
                <Image
                  src="/images/doctordubon.jpg"
                  alt="Dr. Oscar Dubon"
                  width={224}
                  height={224}
                  className="h-full w-full object-cover"
                  preload
                />
              </div>
            </div>

            <p className="mt-4 text-xs font-bold uppercase text-primary/75 sm:mt-5 lg:mt-6">{eyebrow}</p>
            <h1 className="mx-auto mt-2 max-w-xl text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:mx-0 lg:text-4xl xl:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base lg:mx-0 lg:mt-4">
              {description}
            </p>

            {highlights?.length ? (
              <div className="mx-auto mt-5 hidden max-w-xl gap-2 text-left lg:mx-0 lg:mt-6 lg:grid">
                {highlights.map((highlight) => (
                  <div key={highlight} className="flex items-center gap-3 rounded-lg border border-white/75 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    <span className="min-w-0">{highlight}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {footer ? <div className="mt-5 text-center text-xs leading-5 text-slate-500 lg:text-left">{footer}</div> : null}
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
