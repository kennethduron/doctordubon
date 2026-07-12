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
      className="flex min-h-screen items-center justify-center bg-[#eef7fb] px-4 py-10"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-sm rounded-lg border border-white/80 bg-white/90 px-6 py-8 text-center shadow-xl shadow-slate-900/10 backdrop-blur">
        <div className="mx-auto h-20 w-20 animate-pulse overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
          <Image
            src="/images/doctordubon.jpg"
            alt=""
            width={80}
            height={80}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <LoaderCircle className="mx-auto mt-5 animate-spin text-primary" size={24} aria-hidden="true" />
        <p className="mt-4 font-semibold text-slate-950">{title}</p>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
    </main>
  );
}
