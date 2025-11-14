import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import initPush from "../push";

export default function EnableNotificationsButton({
  userId,
  className,
  onSubscribe,
}: {
  userId: any;
  className?: string;
  onSubscribe?: (sub: any) => Promise<any>;
}) {
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  
  React.useEffect(() => {
    // Check if already subscribed
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const sub = await registration.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      }).catch(console.error);
    }
  }, []);
  
  const buttonText = isSubscribed ? '🔔 Reenviar subscription' : 'Ativar notificações';
  
  return (
    <div className="mb-3 text-center">
      <Button
        type="button"
        variant="outline"
        className={className}
        onClick={async () => {
          if (!userId) {
            toast.error("Usuário não autenticado");
            return;
          }

          try {
            console.log('Starting notification setup for user:', userId);
            const sub = await initPush(import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined);
            console.log('Push subscription created:', sub);
            
            if (!sub) {
              console.log('error creating notification');
              toast.error("Não foi possível criar a subscription de push");
              return;
            }
            
            const subJson = (sub as any).toJSON ? (sub as any).toJSON() : sub;
            console.log('Subscription JSON:', subJson);

            // Validate that we have the required fields
            if (!subJson.endpoint || !subJson.keys || !subJson.keys.p256dh || !subJson.keys.auth) {
              console.error('Invalid subscription format:', subJson);
              toast.error("Formato de subscription inválido");
              return;
            }

            if (onSubscribe) {
              console.log('Calling onSubscribe with endpoint:', subJson.endpoint.substring(0, 50) + '...');
              console.log('Keys:', { p256dh: subJson.keys.p256dh.substring(0, 20) + '...', auth: subJson.keys.auth.substring(0, 20) + '...' });
              const result = await onSubscribe(subJson);
              console.log('onSubscribe result:', result);
            } else {
              console.warn('No onSubscribe callback provided');
              // fallback: try POST to /api/push/subscribe
              await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subJson),
              });
            }

            toast.success("Notificações ativadas com sucesso!");
            setIsSubscribed(true);
          } catch (e) {
            console.error("Erro ao ativar notificações", e);
            toast.error("Erro ao ativar notificações: " + (e instanceof Error ? e.message : String(e)));
          }
        }}
      >
        {buttonText}
      </Button>
    </div>
  );
}
