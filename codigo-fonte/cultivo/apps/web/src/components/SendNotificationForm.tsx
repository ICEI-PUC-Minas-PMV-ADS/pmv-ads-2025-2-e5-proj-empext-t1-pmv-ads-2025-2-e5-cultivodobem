import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAction } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";

export default function SendNotificationForm() {
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");

  const sendToUser = useAction(api.push.sendToUser);
  const sendAll = useAction(api.push.sendAll);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const payload = JSON.stringify({ title, body, url });
    try {
      if (userId) {
        await sendToUser({ userId: userId as any, payload });
        toast.success("Notificação enviada ao usuário");
      } else {
        await sendAll({ payload });
        toast.success("Notificação enviada para todos");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao enviar notificação");
    }
  }

  return (
    <form onSubmit={onSend} className="p-4 rounded-md border bg-white">
      <div className="mb-2">
        <label className="block text-sm font-medium">User ID (leave empty to send to all)</label>
        <Input value={userId} onChange={(e) => setUserId(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Body</label>
        <Input value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">URL</label>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="submit">Enviar</Button>
        <Button type="button" variant="outline" onClick={() => { setUserId(""); setTitle(""); setBody(""); setUrl("/"); }}>
          Limpar
        </Button>
      </div>
    </form>
  );
}
