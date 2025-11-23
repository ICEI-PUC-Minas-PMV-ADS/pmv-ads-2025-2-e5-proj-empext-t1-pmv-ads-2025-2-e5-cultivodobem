import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export default function NotificationsBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<any>(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      setUserId(u?._id ?? null);
    } catch {
      setUserId(null);
    }
  }, []);

  const notifications = useQuery(
    api.notifications.listByUser,
    userId ? { userId } : "skip"
  );

  const markAsRead = useMutation(api.notifications.markAsRead);
  const navigate = useNavigate();

  const unreadCount = (notifications || []).filter((n: any) => !n.read)
    .length;

  const handleOpen = () => setOpen((s) => !s);

  const handleClickNotification = async (n: any) => {
    try {
      if (!n.read) {
        await markAsRead({ id: n._id });
      }
      setOpen(false);
      if (n.url) {
        navigate({ to: n.url });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`relative ${className || ""}`}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100"
        title="Notificações"
      >
        <Bell className="w-6 h-6 text-[#7c6a5c]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0 -right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-2 border-b text-sm font-semibold">Notificações</div>
          <div className="max-h-64 overflow-y-auto">
            {(!notifications || notifications.length === 0) && (
              <div className="p-4 text-sm text-gray-600">Nenhuma notificação</div>
            )}
            {notifications && notifications.map((n: any) => (
              <button
                key={n._id}
                onClick={() => handleClickNotification(n)}
                className={`w-full text-left p-3 border-b hover:bg-gray-50 flex flex-col ${n.read ? "" : "bg-gray-50"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{n.title}</div>
                  <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-xs text-gray-600 mt-1 truncate">{n.body}</div>
              </button>
            ))}
          </div>
          <div className="p-2 text-right">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
