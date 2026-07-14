import Image from "next/image";
import { LoaderCircle } from "lucide-react";

type AppLoadingProps = {
  title?: string;
  description?: string;
};

export function AppLoading({
  title = "Cargando Centro Financiero",
  description = "Preparando la información del consultorio…",
}: AppLoadingProps) {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f8fbff_0,#eef7fb_42%,#e8f2f8_100%)] px-4 py-10"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-sm rounded-lg border border-white/80 bg-white/95 px-6 py-8 text-center shadow-xl shadow-slate-900/10 backdrop-blur sm:px-8 sm:py-9">
        <div className="mx-auto h-24 w-24 animate-pulse rounded-full border border-white/90 bg-white p-1.5 shadow-lg shadow-sky-900/15 sm:h-28 sm:w-28">
          <Image
            src="/images/doctordubon.jpg"
            alt=""
            width={112}
            height={112}
            className="h-full w-full rounded-full object-cover"
            preload
          />
        </div>
        <LoaderCircle className="mx-auto mt-5 animate-spin text-primary/80" size={24} aria-hidden="true" />
        <p className="mt-4 text-base font-bold text-slate-950">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </main>
  );
}
