import { useQuery } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Heart, User } from "lucide-react";

interface LikesModalProps {
  open: boolean;
  onClose: () => void;
  strapiPostId: string;
}

export function LikesModal({ open, onClose, strapiPostId }: LikesModalProps) {
  const usersWhoLiked = useQuery(api.postLikes.getUsersWhoLikedPost, {
    strapiPostId,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-[90%] max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              Curtidas
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Lista de usuários */}
        <div className="flex-1 overflow-y-auto p-4">
          {!usersWhoLiked ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Carregando...
            </div>
          ) : usersWhoLiked.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Nenhuma curtida ainda
            </div>
          ) : (
            <div className="space-y-3">
              {usersWhoLiked.map((user, index) => (
                <div
                  key={user.id || index}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    {user.foto_url ? (
                      <img
                        src={user.foto_url}
                        alt={user.name || "Usuário"}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>

                  {/* Nome do usuário */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {user.name || "Usuário"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt || 0).toLocaleDateString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>

                  {/* Ícone de coração */}
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            {usersWhoLiked?.length || 0} curtida
            {(usersWhoLiked?.length || 0) !== 1 ? "s" : ""}
          </div>
        </div>
      </Card>
    </div>
  );
}
