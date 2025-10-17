import { CommentsList } from "@/components/CommentsList";
import { CommentsInput } from "@/components/CommentsInput";
import { LikesModal } from "@/components/LikesModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { strapiService } from "@/services/strapi";
import type { StrapiPost } from "@/types/strapi";
import { useQuery, useMutation } from "convex/react";
import { Heart, MessageCircle, User, Calendar, X } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import type { Id } from "../../../../packages/backend/convex/_generated/dataModel";
import { toast } from "sonner";

interface PostCardProps {
  readonly post: StrapiPost;
  readonly currentUserId?: Id<"users">;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);

  // Buscar número de comentários
  const commentCount = useQuery(api.postComments.countCommentsByPostId, {
    strapiPostId: post.id.toString(),
  });

  // Buscar número de curtidas
  const likeCount = useQuery(api.postLikes.countLikesByPostId, {
    strapiPostId: post.id.toString(),
  });

  // Verificar se o usuário atual curtiu o post
  const hasLiked = useQuery(
    api.postLikes.hasUserLikedPost,
    currentUserId
      ? {
          strapiPostId: post.id.toString(),
          userId: currentUserId,
        }
      : "skip"
  );

  // Mutation para curtir/descurtir
  const toggleLike = useMutation(api.postLikes.toggleLike);

  // Função para lidar com curtidas
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUserId) {
      toast.error("Faça login para curtir posts");
      return;
    }

    try {
      await toggleLike({
        strapiPostId: post.id.toString(),
        userId: currentUserId,
      });
    } catch (error) {
      toast.error("Erro ao curtir post");
      console.error("Erro ao curtir:", error);
    }
  };

  // Função para abrir modal de curtidas
  const handleShowLikes = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (likeCount && likeCount > 0) {
      setShowLikesModal(true);
    }
  };

  // Função para fechar comentários com animação
  const handleCloseSidebar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSidebar(false);
      setIsClosing(false);
    }, 300);
  };

  // Função para abrir/fechar sidebar de comentários
  const handleCardClick = (e: React.MouseEvent) => {
    // Evitar abrir comentários se clicou em botões, links ou inputs
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest(
      'button, a, input, video, [role="button"]'
    );

    if (!isInteractiveElement) {
      if (showSidebar) {
        handleCloseSidebar();
      } else {
        setShowSidebar(true);
      }
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
    <div className="mb-4 relative overflow-hidden">
      {/* Card Principal do Post */}
      <Card
        className="w-full h-[600px] overflow-hidden cursor-pointer py-2 hover:shadow-lg flex flex-col transition-all duration-300 relative z-10"
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

        {/* Footer fixo do post com ações de interação */}
        <div className="flex-shrink-0 p-2 pt-0 bg-white dark:bg-gray-900">
          {/* Área de ações (curtir, comentar) */}
          <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              {/* Botão de curtir */}
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-1 px-2 py-1 h-auto text-xs transition-colors ${
                    currentUserId
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  } ${
                    hasLiked
                      ? "text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                      : "text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                  }`}
                  disabled={!currentUserId}
                >
                  <Heart
                    className={`w-4 h-4 transition-all ${
                      hasLiked ? "fill-current" : ""
                    }`}
                  />
                  <span>Curtir</span>
                </Button>

                {/* Contador de curtidas clicável */}
                {likeCount !== undefined && likeCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShowLikes}
                    className="px-1 py-1 h-auto text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:underline cursor-pointer"
                  >
                    {likeCount} {likeCount === 1 ? "curtida" : "curtidas"}
                  </Button>
                )}
              </div>

              {/* Informação de comentários */}
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span>
                  {(() => {
                    if (commentCount === 0 || commentCount === undefined) {
                      return "Comentar";
                    }
                    const label =
                      commentCount === 1 ? "comentário" : "comentários";
                    return `${commentCount} ${label}`;
                  })()}
                </span>
              </div>
            </div>

            {/* Indicador de que é clicável para comentários */}
            <div className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span>Clique no card para comentar</span>
              <MessageCircle className="w-2 h-2" />
            </div>
          </div>
        </div>
      </Card>

      {/* Container de Overlay para Comentários */}
      <div
        className={`absolute inset-0 overflow-hidden transition-all duration-300 ${showSidebar ? "z-20" : "z-0 pointer-events-none"}`}
      >
        {/* Backdrop transparente - apenas área clicável para fechar */}
        {showSidebar && (
          <button
            type="button"
            className="absolute inset-0 bg-transparent transition-all duration-300 cursor-pointer border-0 p-0 m-0 w-full h-full"
            onClick={(e) => {
              e.stopPropagation();
              handleCloseSidebar();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleCloseSidebar();
              }
            }}
            aria-label="Fechar comentários"
          />
        )}

        {/* Painel de Comentários */}
        <div
          className={`absolute top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl transform transition-transform duration-300 ease-out ${
            showSidebar && !isClosing ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Card className="h-full flex flex-col overflow-hidden border-0 shadow-none">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3
                  id="comments-header"
                  className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  Comentários
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseSidebar();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Lista de Comentários - Área Scrollável */}
            <div className="flex-1 overflow-y-auto p-3">
              <CommentsList
                strapiPostId={post.id.toString()}
                currentUserId={currentUserId}
              />
            </div>

            {/* Input para Novo Comentário - Fixo na Base */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex-shrink-0 bg-gray-50 dark:bg-gray-800">
              <CommentsInput
                strapiPostId={post.id.toString()}
                currentUserId={currentUserId}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Curtidas */}
      <LikesModal
        open={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        strapiPostId={post.id.toString()}
      />
    </div>
  );
}
