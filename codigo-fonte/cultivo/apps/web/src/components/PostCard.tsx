import { CommentsList } from "@/components/CommentsList";
import { CommentsInput } from "@/components/CommentsInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { strapiService } from "@/services/strapi";
import type { StrapiPost } from "@/types/strapi";
import { useQuery } from "convex/react";
import {
  Heart,
  MessageSquare,
  Share2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  User,
  Calendar,
  X,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import type { Id } from "../../../../packages/backend/convex/_generated/dataModel";

interface PostCardProps {
  readonly post: StrapiPost;
  readonly currentUserId?: Id<"users">;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [showSidebar, setShowSidebar] = useState(false);

  // Buscar número de comentários
  const commentCount = useQuery(api.postComments.countCommentsByPostId, {
    strapiPostId: post.id.toString(),
  });

  // Função para abrir/fechar sidebar de comentários
  const handleCardClick = (e: React.MouseEvent) => {
    // Evitar abrir comentários se clicou em botões, links ou inputs
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest(
      'button, a, input, video, [role="button"]'
    );

    if (!isInteractiveElement) {
      setShowSidebar(!showSidebar);
    }
  };

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
        <p key={paragraphId} className="mb-0 last:mb-0">
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
    <div className="mb-1 flex gap-4 items-stretch">
      {/* Card Principal do Post */}
      <Card
        className={`${
          showSidebar ? "flex-1 max-w-[600px]" : "w-full"
        } h-[600px] overflow-hidden cursor-pointer py-2 hover:shadow-lg flex flex-col ${
          showSidebar ? "ring-2 ring-green-500 ring-opacity-20" : ""
        }`}
        onClick={handleCardClick}
      >
        {/* Header do Post - Informações principais no topo */}
        <div className="flex-shrink-0 p-2 pb-0">
          {/* Título */}
          <h2 className="text-lg font-bold mb-0 text-gray-900 dark:text-gray-100 leading-tight">
            {post.title}
          </h2>

          {/* Meta informações */}
          <div className="flex flex-wrap items-center gap-1 text-xs mb-0">
            {post.author && (
              <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                <User className="w-3 h-3" />
                <span className="font-medium">{post.author.name}</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>

            {post.category && (
              <div className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-[10px] font-medium">
                {post.category.name}
              </div>
            )}
          </div>
        </div>

        {/* Área de conteúdo com scroll - inclui mídia de capa */}
        <div className="flex-1 overflow-y-auto">
          <div className="pb-4">
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

            <div className="p-2 pt-2">
              {/* Conteúdo */}
              <div className="prose dark:prose-invert max-w-none mb-1 text-sm">
                {renderContent(post.description || "")}
              </div>

              {/* Galeria de mídias adicionais */}
              {((post.media && post.media.length > 0) ||
                (post.gallery && post.gallery.length > 0) ||
                (post.files && post.files.length > 0)) && (
                <div className="mb-1">
                  <h3 className="font-semibold mb-0 text-gray-900 dark:text-gray-100 text-sm">
                    Galeria
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {/* Renderizar media */}
                    {post.media?.map((media, index) =>
                      renderMedia(media, index)
                    )}

                    {/* Renderizar gallery */}
                    {post.gallery?.map((media, index) =>
                      renderMedia(media, index)
                    )}

                    {/* Renderizar files */}
                    {post.files?.map((media, index) =>
                      renderMedia(media, index)
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer fixo do post com informação de comentários */}
        <div className="flex-shrink-0 p-2 pt-0 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <MessageCircle className="w-3 h-3 text-green-600" />
              <span>
                {(() => {
                  if (commentCount === 0 || commentCount === undefined) {
                    return "Clique para comentar";
                  }
                  const label =
                    commentCount === 1 ? "comentário" : "comentários";
                  return `${commentCount} ${label}`;
                })()}
              </span>
            </div>

            {/* Indicador de que é clicável */}
            <div className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span>Clique no card para comentar</span>
              <MessageCircle className="w-2 h-2" />
            </div>
          </div>
        </div>
      </Card>

      {/* Sidebar de Comentários */}
      {showSidebar && (
        <div className="w-80 flex-shrink-0">
          <Card className="h-[600px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-green-600" />
                  Comentários
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSidebar(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Lista de Comentários - Área Scrollável */}
            <div className="flex-1 overflow-y-auto p-2">
              <CommentsList
                strapiPostId={post.id.toString()}
                currentUserId={currentUserId}
              />
            </div>

            {/* Input para Novo Comentário - Fixo na Base */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-2 flex-shrink-0 bg-gray-50 dark:bg-gray-800">
              <CommentsInput
                strapiPostId={post.id.toString()}
                currentUserId={currentUserId}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
