import type { StrapiPost, StrapiResponse } from "@/types/strapi";

// Configuração da API do Strapi
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;

class StrapiService {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseURL = `${STRAPI_URL}/api`;
    this.headers = {
      "Content-Type": "application/json",
    };

    // Adiciona token de autorização se disponível
    if (STRAPI_API_TOKEN) {
      this.headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
    }
  }

  /**
   * Busca todos os articles do Strapi
   */
  async getAllPosts(
    page = 1,
    pageSize = 10
  ): Promise<StrapiResponse<StrapiPost[]>> {
    try {
      const response = await fetch(
        `${this.baseURL}/articles?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=publishedAt:desc`,
        {
          method: "GET",
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar posts do Strapi:", error);
      throw error;
    }
  }

  /**
   * Busca um article específico pelo ID
   */
  async getPostById(id: number): Promise<StrapiResponse<StrapiPost>> {
    try {
      const response = await fetch(
        `${this.baseURL}/articles/${id}?populate=*`,
        {
          method: "GET",
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar post do Strapi:", error);
      throw error;
    }
  }

  /**
   * Busca posts por categoria (se aplicável)
   */
  async getPostsByCategory(
    categorySlug: string,
    page = 1,
    pageSize = 10
  ): Promise<StrapiResponse<StrapiPost[]>> {
    try {
      const response = await fetch(
        `${this.baseURL}/articles?populate=*&filters[category][slug][$eq]=${categorySlug}&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=publishedAt:desc`,
        {
          method: "GET",
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar posts por categoria:", error);
      throw error;
    }
  }

  /**
   * Busca posts com filtro de texto
   */
  async searchPosts(
    query: string,
    page = 1,
    pageSize = 10
  ): Promise<StrapiResponse<StrapiPost[]>> {
    try {
      const response = await fetch(
        `${this.baseURL}/articles?populate=*&filters[$or][0][title][$containsi]=${query}&filters[$or][1][description][$containsi]=${query}&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=publishedAt:desc`,
        {
          method: "GET",
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      throw error;
    }
  }

  /**
   * Constrói URL completa para imagens do Strapi
   */
  getImageUrl(imageUrl: string): string {
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    return `${STRAPI_URL}${imageUrl}`;
  }
}

export const strapiService = new StrapiService();
