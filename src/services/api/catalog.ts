import {
  CatalogDetailResponse,
  CatalogResponse,
  JewelryPriceListResponse,
} from '@/src/types/catalog';
import { apiClient } from './client';

export const catalogApi = {
  getPublicCatalogs: async (): Promise<CatalogResponse> => {
    try {
      const response =
        await apiClient.get<CatalogResponse>('/v1/catalog/public');

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
      return response.data;
    } catch (err) {
      console.error('[Catalog API] getPrivateCatalogs error:', err);
      throw err;
    }
  },

  getJewelryPriceList: async (): Promise<JewelryPriceListResponse> => {
    try {
      const response = await apiClient.get<JewelryPriceListResponse>(
        '/v1/jewelry-price-list',
      );
      return response.data;
    } catch (err) {
      console.error('[Catalog API] getJewelryPriceList error:', err);
      throw err;
    }
  },
};
