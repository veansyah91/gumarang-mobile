import { CatalogDetailResponse, CatalogResponse } from '@/src/types/catalog';
import { apiClient } from './client';

export const catalogApi = {
  getPublicCatalogs: async (): Promise<CatalogResponse> => {
    try {
      const response =
        await apiClient.get<CatalogResponse>('/v1/catalog/public');
      console.log('[Catalog API] getPublicCatalogs response:', {
        status: response.status,
        success: response.data.success,
        dataLength: response.data.data?.length,
        primaryImages: response.data.data?.map((c) => ({
          id: c.id,
          name: c.name,
          hasPrimaryImage: !!c.primary_image,
          imageUrl: c.primary_image?.url,
          imagesCount: c.images?.length,
        })),
      });
      return response.data;
    } catch (err) {
      console.error('[Catalog API] getPublicCatalogs error:', err);
      throw err;
    }
  },

  getPrivateCatalogById: async (id: number): Promise<CatalogDetailResponse> => {
    try {
      const response = await apiClient.get<CatalogDetailResponse>(
        `/v1/catalog/private/${id}`,
      );
      return response.data;
    } catch (err) {
      console.error('[Catalog API] getPrivateCatalogById error:', err);
      throw err;
    }
  },

  getPublicCatalogById: async (id: number): Promise<CatalogDetailResponse> => {
    try {
      const response = await apiClient.get<CatalogDetailResponse>(
        `/v1/catalog/public/${id}`,
      );
      return response.data;
    } catch (err) {
      console.error('[Catalog API] getPublicCatalogById error:', err);
      throw err;
    }
  },

  getPrivateCatalogs: async (page: number = 1): Promise<CatalogResponse> => {
    try {
      const response = await apiClient.get<CatalogResponse>(
        '/v1/catalog/private',
        {
          params: { page },
        },
      );
      console.log('[Catalog API] getPrivateCatalogs response:', {
        status: response.status,
        page,
        success: response.data.success,
        dataLength: response.data.data?.length,
        primaryImages: response.data.data?.map((c) => ({
          id: c.id,
          name: c.name,
          hasPrimaryImage: !!c.primary_image,
          imageUrl: c.primary_image?.url,
          imagesCount: c.images?.length,
        })),
      });
      return response.data;
    } catch (err) {
      console.error('[Catalog API] getPrivateCatalogs error:', err);
      throw err;
    }
  },
};
