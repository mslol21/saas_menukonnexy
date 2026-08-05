export type FilterTag =
  | 'vegano'
  | 'vegetariano'
  | 'sem_lactose'
  | 'sem_gluten'
  | 'apimentado'
  | 'fit'
  | 'zero_acucar'
  | 'artesanal'
  | 'premium';

export interface FilterOption {
  id: FilterTag;
  label: string;
  icon: string;
  color: string;
}

export interface TenantOpeningHours {
  mon_fri: string;
  sat_sun: string;
}

export interface TenantThemeConfig {
  primary_color: string;
  mode: 'dark' | 'light';
  style: 'glass' | 'minimal' | 'vibrant';
}

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: 'owner' | 'admin' | 'master';
  created_at?: string;
}

export interface Tenant {
  id: string;
  owner_id?: string;
  name: string;
  slug: string;
  logo_url: string;
  banner_url: string;
  description: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  website?: string;
  address: string;
  google_maps_url?: string;
  opening_hours?: TenantOpeningHours;
  subscription_status: 'active' | 'suspended' | 'trial' | 'cancelled';
  subscription_plan?: 'monthly' | 'annual';
  expires_at?: string;
  theme_config: TenantThemeConfig;
  promo_banner_text?: string;
  created_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promo_price?: number;
  image_url: string;
  gallery?: string[];
  ingredients: string[];
  weight?: string;
  volume?: string;
  calories?: number;
  prep_time_min?: number;
  serves?: number;
  is_available: boolean;
  sort_order: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new?: boolean;
  is_promo?: boolean;
  filters: FilterTag[];
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface QRCodeData {
  id: string;
  tenant_id: string;
  table_number?: number;
  category_slug?: string;
  target_url: string;
  scans_count: number;
  created_at: string;
}

export interface AnalyticsSummary {
  total_views: number;
  qr_scans: number;
  whatsapp_clicks: number;
  top_products: { name: string; views: number; image_url: string }[];
  recent_activity: { time: string; type: string; details: string }[];
}

export interface OrderDetails {
  customer_name: string;
  table_number?: string;
  order_type: 'table' | 'delivery' | 'takeaway';
  payment_method: 'pix' | 'card' | 'cash';
  items: CartItem[];
  total: number;
  notes?: string;
}
