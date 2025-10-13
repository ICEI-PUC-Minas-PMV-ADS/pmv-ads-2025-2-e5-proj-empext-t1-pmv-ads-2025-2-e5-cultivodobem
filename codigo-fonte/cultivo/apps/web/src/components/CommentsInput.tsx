import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import type { Id } from "../../../../packages/backend/convex/_generated/dataModel";

interface CommentsInputProps {
  readonly strapiPostId: string;
  readonly currentUserId: Id<"users"> | undefined;
}

export function CommentsInput({
  strapiPostId,
  currentUserId,
}: CommentsInputProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutation do Convex
  const createComment = useMutation(api.postComments.createComment);

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

  if (!currentUserId) {
    return (
      <div className="text-center py-4">
        <MessageCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Faça login para comentar nesta publicação
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmitComment} className="space-y-3">
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
  );
}
