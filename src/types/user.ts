export type User = {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  is_admin: boolean;
  phone_verified_at: string | null;
};
