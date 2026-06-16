export interface CatalogImage {
  id: number;
  catalog_id: number;
  image_path: string;
  is_primary: boolean;
  url: string;
}

export interface CatalogVideo {
  id: number;
  catalog_id: number;
  video_url: string;
}

export interface Product {
  id: number;
  name: string;
  category_id: number;
  category?: Category;
  pivot: {
    berat: string | number;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Catalog {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  primary_image?: {
    id: number;
    catalog_id: number;
    image_path: string;
    is_primary: boolean;
    url: string;
  };
  images: CatalogImage[];
  videos: CatalogVideo[];
  products: Product[];
}

export interface CatalogResponse {
  success: boolean;
  message: string;
  data: Catalog[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more: boolean;
  };
}

export interface CatalogDetailResponse {
  success: boolean;
  message: string;
  data: Catalog;
}
