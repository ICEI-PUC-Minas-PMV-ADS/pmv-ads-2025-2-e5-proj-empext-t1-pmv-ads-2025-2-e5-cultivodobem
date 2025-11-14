import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function InstallPWAButton({ className }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const beforeInstallHandler = (e: any) => {
      // Prevent Chrome 67+ from automatically showing the prompt
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const appInstalledHandler = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      toast.success("Aplicativo instalado");
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler as EventListener);
    window.addEventListener("appinstalled", appInstalledHandler as EventListener);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler as EventListener);
      window.removeEventListener("appinstalled", appInstalledHandler as EventListener);
    };
  }, []);

  if (installed) return null;
  if (!deferredPrompt) return null;

  return (
    <Button
      variant="outline"
      className={className}
      onClick={async () => {
        try {
          deferredPrompt.prompt();
          const choiceResult = await deferredPrompt.userChoice;
          if (choiceResult && choiceResult.outcome === "accepted") {
            toast.success("Obrigado! Instalação aceita.");
            setDeferredPrompt(null);
          } else {
            toast("Instalação cancelada");
          }
        } catch (e) {
          console.warn("Install prompt error", e);
          toast.error("Erro ao tentar instalar o aplicativo");
        }
      }}
    >
      <Download size={14} className="mr-2" /> Instalar app
    </Button>
  );
}
