export interface CertificateListFilters {
  page?: number;
  limit?: number;
  query?: string;
  start_date?: string;
  end_date?: string;
}

export interface CertificateListItem {
  id: number;
  no_ref: string;
  weight: number | string;
  created_at: string;
}

export interface CertificatePaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface CertificatePagination {
  current_page: number;
  data: CertificateListItem[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: CertificatePaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface CertificateListData {
  certificates: CertificatePagination;
  total_weight: number | string;
}

export interface CertificateProduct {
  id: number;
  name: string;
  width: number | string;
  length: number | string;
  height: number | string;
  diameter: number | string;
  weight: number | string;
  qty: number | string;
}

export interface CertificateDetail {
  id: number;
  no_ref: string;
  token: string;
  user_name: string;
  user_id: number;
  is_active: number;
  weight: number | string;
  created_at: string;
  products: CertificateProduct[];
}

export interface CertificateDetailData {
  certificate: CertificateDetail;
}
