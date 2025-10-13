import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Send,
  Calendar,
  Edit,
  Trash2,
  User,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import type { Id } from "../../../../packages/backend/convex/_generated/dataModel";

interface CommentsSidebarProps {
  readonly strapiPostId: string;
  readonly currentUserId: Id<"users"> | undefined;
}

export function CommentsSidebar({
  strapiPostId,
  currentUserId,
}: CommentsSidebarProps) {
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] =
    useState<Id<"postComments"> | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries do Convex
  const comments = useQuery(
    api.postComments.getCommentsByPostId,
    strapiPostId ? { strapiPostId } : "skip"
  );

  // Mutations do Convex
  const createComment = useMutation(api.postComments.createComment);
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

  // Criar novo comentário
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || !currentUserId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createComment({
        strapiPostId,
        userId: currentUserId,
        content: newComment.trim(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Erro ao criar comentário:", error);
      alert("Erro ao enviar comentário. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="space-y-1">
      {/* Formulário para novo comentário */}
      {currentUserId ? (
        <Card className="p-1">
          <form onSubmit={handleSubmitComment} className="space-y-0.5">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva um comentário..."
              className="w-full"
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {newComment.length}/500 caracteres
              </span>
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                size="sm"
                className="flex items-center gap-2"
              >
                <Send className="w-3 h-3" />
                {isSubmitting ? "Enviando..." : "Comentar"}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-1 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Faça login para comentar nesta publicação
          </p>
        </Card>
      )}

      {/* Lista de comentários */}
      <div className="space-y-0.5">
        {comments === undefined && (
          // Loading skeleton
          <div className="space-y-0.5">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-1">
                <div className="animate-pulse space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {comments !== undefined && comments.length === 0 && (
          <Card className="p-2 text-center">
            <MessageCircle className="w-4 h-4 mx-auto mb-0 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Seja o primeiro a comentar!
            </p>
          </Card>
        )}

        {comments !== undefined && comments.length > 0 && (
          <>
            {comments.map((comment: any) => (
              <Card key={comment._id} className="p-1">
                <div className="space-y-0.5">
                  {/* Header do comentário */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <User className="w-2 h-2" />
                      <span className="font-medium">{comment.userName}</span>
                      <Calendar className="w-2 h-2" />
                      <span>{formatDate(comment.createdAt)}</span>
                      {comment.updatedAt && (
                        <span className="text-[10px] italic">(editado)</span>
                      )}
                    </div>

                    {/* Ações (editar/deletar) - só para o dono do comentário */}
                    {currentUserId === comment.userId && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            startEditing(comment._id, comment.content)
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteComment(comment._id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
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
                        className="w-full"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {editingContent.length}/500 caracteres
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                          >
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
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
