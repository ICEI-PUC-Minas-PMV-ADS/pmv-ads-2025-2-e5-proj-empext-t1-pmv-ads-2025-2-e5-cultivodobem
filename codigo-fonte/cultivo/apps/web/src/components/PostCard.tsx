import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useQuery } from "convex/react";
import type { StrapiPost } from "@/types/strapi";
import type { Id } from "../../../../packages/backend/convex/_generated/dataModel";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import { strapiService } from "@/services/strapi";
import { Comments } from "@/components/Comments";

interface PostCardProps {
  readonly post: StrapiPost;
  readonly currentUserId?: Id<"users"> | undefined;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  // Buscar número de comentários
  const commentCount = useQuery(api.postComments.countCommentsByPostId, {
    strapiPostId: post.id.toString(),
  });

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Função para renderizar o conteúdo do post (formatação básica)
  const renderContent = (content: string) => {
    // Converte quebras de linha simples em parágrafos
    const paragraphs = content.split("\n\n");

    return paragraphs.map((paragraph) => {
      const paragraphId = `paragraph-${paragraph.slice(0, 20)}-${Math.random()}`;
      return (
        <p key={paragraphId} className="mb-3 last:mb-0">
          {paragraph.split("\n").map((line) => {
            const lineId = `line-${line.slice(0, 10)}-${Math.random()}`;
            return (
              <span key={lineId}>
                {line}
                {paragraph.split("\n").indexOf(line) <
                  paragraph.split("\n").length - 1 && <br />}
              </span>
            );
          })}
        </p>
      );
    });
  };

  return (
    <Card className="mb-6 overflow-hidden">
      {/* Imagem de capa */}
      {post.cover && (
        <div className="aspect-video overflow-hidden">
          <img
            src={strapiService.getImageUrl(post.cover.url)}
            alt={post.cover.alternativeText || post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Título */}
        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
          {post.title}
        </h2>

        {/* Meta informações */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>

          {post.author && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{post.author.name}</span>
            </div>
          )}

          {post.category && (
            <div className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
              {post.category.name}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="prose dark:prose-invert max-w-none mb-4">
          {renderContent(post.description || "")}
        </div>

        {/* Ações do post */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{commentCount ?? 0} comentários</span>
            {showComments ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Seção de comentários */}
        {showComments && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <Comments
              strapiPostId={post.id.toString()}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
