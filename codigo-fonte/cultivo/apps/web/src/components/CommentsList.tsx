import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import type { Id } from "../../../../packages/backend/convex/_generated/dataModel";

interface CommentsListProps {
  readonly strapiPostId: string;
  readonly currentUserId: Id<"users"> | undefined;
}

export function CommentsList({
  strapiPostId,
  currentUserId,
}: CommentsListProps) {
  const [editingCommentId, setEditingCommentId] =
    useState<Id<"postComments"> | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Queries do Convex
  const comments = useQuery(
    api.postComments.getCommentsByPostId,
    strapiPostId ? { strapiPostId } : "skip"
  );

  // Mutations do Convex
  const updateComment = useMutation(api.postComments.updateComment);
  const deleteComment = useMutation(api.postComments.deleteComment);

  // Função para formatar data
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Editar comentário
  const handleEditComment = async (commentId: Id<"postComments">) => {
    if (!editingContent.trim() || !currentUserId) return;

    try {
      await updateComment({
        commentId,
        userId: currentUserId,
        content: editingContent.trim(),
      });
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      console.error("Erro ao editar comentário:", error);
      alert("Erro ao editar comentário. Tente novamente.");
    }
  };

  // Deletar comentário
  const handleDeleteComment = async (commentId: Id<"postComments">) => {
    if (!currentUserId) return;

    const confirmed = confirm(
      "Tem certeza que deseja deletar este comentário?"
    );
    if (!confirmed) return;

    try {
      await deleteComment({
        commentId,
        userId: currentUserId,
      });
    } catch (error) {
      console.error("Erro ao deletar comentário:", error);
      alert("Erro ao deletar comentário. Tente novamente.");
    }
  };

  // Iniciar edição
  const startEditing = (commentId: Id<"postComments">, content: string) => {
    setEditingCommentId(commentId);
    setEditingContent(content);
  };

  // Cancelar edição
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  if (comments === undefined) {
    // Loading skeleton
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="pb-3 border-b border-gray-100 dark:border-gray-800"
          >
            <div className="animate-pulse space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
              </div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="p-4 text-center">
        <MessageCircle className="w-6 h-6 mx-auto mb-2 text-gray-300" />
        <p className="text-gray-400 dark:text-gray-500 text-xs">
          Seja o primeiro a comentar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment: any) => (
        <div
          key={comment._id}
          className="pb-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 last:pb-0"
        >
          <div className="space-y-1">
            {/* Header do comentário */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {comment.userName}
                </span>
                <span className="text-[10px] text-gray-400">•</span>
                <span className="text-[10px]">
                  {formatDate(comment.createdAt)}
                </span>
                {comment.updatedAt && (
                  <span className="text-[9px] italic text-gray-400">
                    (editado)
                  </span>
                )}
              </div>

              {/* Ações (editar/deletar) - só para o dono do comentário */}
              {currentUserId === comment.userId && (
                <div className="flex items-center gap-0.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing(comment._id, comment.content)}
                    className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteComment(comment._id)}
                    className="h-5 w-5 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Conteúdo do comentário */}
            {editingCommentId === comment._id ? (
              <div className="space-y-2">
                <Input
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  maxLength={500}
                  className="w-full text-sm"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {editingContent.length}/500 caracteres
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEditComment(comment._id)}
                      disabled={!editingContent.trim()}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-800 dark:text-gray-200 text-sm">
                {comment.content}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
