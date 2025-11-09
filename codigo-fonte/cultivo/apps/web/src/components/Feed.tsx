import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/PostCard";
import { Search, RefreshCw } from "lucide-react";
import type { StrapiPost, StrapiResponse } from "@/types/strapi";
import type { Id } from "../../../../packages/backend/convex/_generated/dataModel";
import { strapiService } from "@/services/strapi";
import "@/styles/feed.css";

export function Feed() {
  const [posts, setPosts] = useState<StrapiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obter usuário atual do localStorage
  const getCurrentUserId = (): Id<"users"> | undefined => {
    try {
      const stored = localStorage.getItem("user");

      if (stored) {
        const user = JSON.parse(stored);
        return user._id;
      }
    } catch (error) {
      console.error("Erro ao obter usuário atual:", error);
    }
    return undefined;
  };

  const currentUserId = getCurrentUserId();

  // Carregar posts iniciais
  useEffect(() => {
    loadPosts(true);
  }, []);

  const loadPosts = async (isFirstLoad = false) => {
    try {
      setError(null);

      if (isFirstLoad) {
        setLoading(true);
        setPosts([]);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      let response: StrapiResponse<StrapiPost[]>;

      if (searchQuery.trim()) {
        response = await strapiService.searchPosts(
          searchQuery,
          isFirstLoad ? 1 : page
        );
      } else {
        response = await strapiService.getAllPosts(isFirstLoad ? 1 : page);
      }

      const newPosts = response.data || [];

      if (isFirstLoad) {
        setPosts(newPosts);
        setPage(2);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage((prev) => prev + 1);
      }

      // Verificar se há mais posts para carregar
      const pagination = response.meta.pagination;
      if (pagination) {
        setHasMore(pagination.page < pagination.pageCount);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
      setError(
        "Erro ao carregar publicações. Verifique se o Strapi está configurado corretamente."
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Buscar posts
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPosts(true);
  };

  // Limpar busca
  const handleClearSearch = () => {
    setSearchQuery("");
    setTimeout(() => loadPosts(true), 100);
  };

  // Carregar mais posts
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(false);
    }
  };

  // Skeleton para loading
  const renderSkeletons = () => (
    <div className="space-y-6">
      <div className="border rounded-lg p-6">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="border rounded-lg p-6">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="border rounded-lg p-6">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Feed de Publicações</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Conteúdos educativos e informativos sobre agricultura e cultivo do
          bem.
        </p>
      </div>

      {/* Barra de busca */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar publicações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={loading}>
            Buscar
          </Button>
          {searchQuery && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClearSearch}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Indicador de busca ativa */}
      {searchQuery && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Mostrando resultados para: <strong>"{searchQuery}"</strong>
          </p>
        </div>
      )}

      {/* Conteúdo principal */}
      {loading && renderSkeletons()}

      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery
              ? "Nenhuma publicação encontrada para sua busca."
              : "Nenhuma publicação disponível no momento."}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={handleClearSearch}>
              Ver todas as publicações
            </Button>
          )}
        </div>
      )}

      {!loading && posts.length > 0 && (
        <>
          {/* Lista de posts */}
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
              />
            ))}
          </div>

          {/* Botão carregar mais */}
          {hasMore && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
              >
                {loadingMore ? "Carregando..." : "Carregar mais publicações"}
              </Button>
            </div>
          )}

          {/* Fim da lista */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center mt-8 py-4">
              <p className="text-gray-500 dark:text-gray-400">
                Você viu todas as publicações disponíveis.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
