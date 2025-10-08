import { Comments } from "@/components/Comments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { strapiService } from "@/services/strapi";
import type { StrapiPost } from "@/types/strapi";
import { useQuery } from "convex/react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  User,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import type { Id } from "../../../../packages/backend/convex/_generated/dataModel";

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

  // Função para renderizar mídia (imagem ou vídeo)
  const renderMedia = (media: any, index: number) => {
    const isVideo = media.mime?.startsWith("video/");

    return (
      <div
        key={media.id || index}
        className="aspect-square overflow-hidden rounded-lg"
      >
        {isVideo ? (
          <video
            src={strapiService.getImageUrl(media.url)}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
            title={media.alternativeText || `Vídeo ${index + 1}`}
          >
            <track kind="captions" srcLang="pt" label="Português" />
            Seu navegador não suporta vídeos.
          </video>
        ) : (
          <button
            type="button"
            className="w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            onClick={() =>
              window.open(strapiService.getImageUrl(media.url), "_blank")
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                window.open(strapiService.getImageUrl(media.url), "_blank");
              }
            }}
            title={
              media.alternativeText
                ? `Abrir imagem: ${media.alternativeText}`
                : `Abrir Imagem ${index + 1}`
            }
          >
            <img
              src={strapiService.getImageUrl(media.url)}
              alt={media.alternativeText || `Imagem ${index + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </button>
        )}
      </div>
    );
  };

  return (
    <Card className="mb-6 overflow-hidden">
      {/* Mídia de capa (imagem ou vídeo) */}
      {post.cover && (
        <div className="aspect-video overflow-hidden">
          {post.cover.mime?.startsWith("video/") ? (
            <video
              src={strapiService.getImageUrl(post.cover.url)}
              className="w-full h-full object-cover"
              controls
              preload="metadata"
              title={post.cover.alternativeText || post.title}
            >
              <track kind="captions" srcLang="pt" label="Português" />
              Seu navegador não suporta vídeos.
            </video>
          ) : (
            <img
              src={strapiService.getImageUrl(post.cover.url)}
              alt={post.cover.alternativeText || post.title}
              className="w-full h-full object-cover"
            />
          )}
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

        {/* Galeria de mídias adicionais */}
        {((post.media && post.media.length > 0) ||
          (post.gallery && post.gallery.length > 0) ||
          (post.files && post.files.length > 0)) && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Galeria
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {/* Renderizar media */}
              {post.media?.map((media, index) => renderMedia(media, index))}

              {/* Renderizar gallery */}
              {post.gallery?.map((media, index) => renderMedia(media, index))}

              {/* Renderizar files */}
              {post.files?.map((media, index) => renderMedia(media, index))}
            </div>
          </div>
        )}

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
