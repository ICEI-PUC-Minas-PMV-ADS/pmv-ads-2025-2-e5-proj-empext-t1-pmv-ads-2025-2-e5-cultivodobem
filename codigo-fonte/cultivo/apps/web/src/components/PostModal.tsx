import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, User, X, Tag } from "lucide-react";
import type { StrapiPost } from "@/types/strapi";
import type { Id } from "../../../../packages/backend/convex/_generated/dataModel";
import { strapiService } from "@/services/strapi";
import { Comments } from "@/components/Comments";

interface PostModalProps {
  readonly post: StrapiPost;
  readonly currentUserId?: Id<"users">;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function PostModal({ post, currentUserId, isOpen, onClose }: PostModalProps) {
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

  // Função para renderizar o conteúdo completo
  const renderContent = (content: string) => {
    const paragraphs = content.split("\n\n");
    return paragraphs.map((paragraph) => {
      const paragraphId = `paragraph-${paragraph.slice(0, 20)}-${Math.random()}`;
      return (
        <p key={paragraphId} className="mb-3 last:mb-0 text-gray-700 dark:text-gray-300 leading-relaxed">
          {paragraph.split("\n").map((line) => {
            const lineId = `line-${line.slice(0, 10)}-${Math.random()}`;
            return (
              <span key={lineId}>
                {line}
                {paragraph.split("\n").indexOf(line) < paragraph.split("\n").length - 1 && <br />}
              </span>
            );
          })}
        </p>
      );
    });
  };

  // Função para renderizar mídia
  const renderMedia = (media: any, index: number) => {
    const isVideo = media.mime?.startsWith("video/");
    
    return (
      <div key={media.id || index} className="aspect-video overflow-hidden rounded-lg">
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
          <img
            src={strapiService.getImageUrl(media.url)}
            alt={media.alternativeText || `Imagem ${index + 1}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title={post.title}>
      <div className="max-w-4xl max-h-[80vh] overflow-y-auto">
        {/* Meta informações */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
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
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                {post.category.name}
              </span>
            </div>
          )}
        </div>

        {/* Conteúdo do modal */}
        <div className="p-6 pt-2">
          {/* Mídia principal */}
          {post.cover && (
            <div className="mb-6">
              <div className="aspect-video overflow-hidden rounded-lg">
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
            </div>
          )}

          {/* Conteúdo completo */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
            {renderContent(post.description || "")}
          </div>

          {/* Galeria de mídias adicionais */}
          {((post.media && post.media.length > 0) || 
            (post.gallery && post.gallery.length > 0) || 
            (post.files && post.files.length > 0)) && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 text-lg">
                Galeria
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.media?.map((media, index) => renderMedia(media, index))}
                {post.gallery?.map((media, index) => renderMedia(media, index))}
                {post.files?.map((media, index) => renderMedia(media, index))}
              </div>
            </div>
          )}

          {/* Seção de comentários */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100 text-lg">
              Comentários
            </h3>
            <Comments
              strapiPostId={post.id.toString()}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}