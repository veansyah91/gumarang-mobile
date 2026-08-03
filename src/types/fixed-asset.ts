export interface FixedAssetNode {
  id: number;
  name: string;
  type: string;
  normal_balance: string;
  asset_category: string;
  icon: string;
  color: string;
  opening_balance: number;
  current_balance: number;
  is_default: boolean;
  is_active: boolean;
  parent_id: number | null;
  acquisition_date: string | null;
  children?: FixedAssetNode[];
}

export interface FixedAssetListMeta {
  total_fixed_asset_value: number;
}

export interface CreateFixedAssetPayload {
  asset_name: string;
  icon?: string;
  color?: string;
  opening_balance?: number;
  current_balance?: number;
  acquisition_date?: string;
  is_active?: boolean;
  parent_id?: number | null;
}

export interface UpdateFixedAssetPayload {
  asset_name?: string;
  icon?: string | null;
  color?: string | null;
  opening_balance?: number;
  current_balance?: number;
  acquisition_date?: string | null;
  asset_category?: string;
  is_active?: boolean;
  parent_id?: number | null;
}
