import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Warning: Supabase environment variables are not set. Database features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  profiles: {
    Row: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      role: 'customer' | 'admin' | 'staff';
      is_flagged: boolean;
      flag_reason: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id: string;
      name?: string;
      email?: string | null;
      phone?: string | null;
      role?: 'customer' | 'admin' | 'staff';
    };
    Update: {
      name?: string;
      phone?: string | null;
      role?: 'customer' | 'admin' | 'staff';
      is_flagged?: boolean;
      flag_reason?: string | null;
    };
  };
  addresses: {
    Row: {
      id: string;
      user_id: string;
      label: string;
      recipient_name: string;
      phone: string;
      address_line: string;
      city: string;
      province: string;
      area: string | null;
      is_default: boolean;
      created_at: string;
    };
    Insert: {
      user_id?: string;
      label?: string;
      recipient_name: string;
      phone: string;
      address_line: string;
      city: string;
      province: string;
      area?: string;
      is_default?: boolean;
    };
    Update: {
      label?: string;
      recipient_name?: string;
      phone?: string;
      address_line?: string;
      city?: string;
      province?: string;
      area?: string;
      is_default?: boolean;
    };
  };
  categories: {
    Row: {
      id: string;
      name: string;
      slug: string;
      gender: string;
      parent_id: string | null;
      image_url: string | null;
      sort_order: number;
      created_at: string;
    };
    Insert: {
      name: string;
      slug: string;
      gender?: string;
      parent_id?: string | null;
      image_url?: string | null;
      sort_order?: number;
    };
  };
  products: {
    Row: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      fabric: string | null;
      care_instructions: string | null;
      delivery_time: string | null;
      category_id: string | null;
      base_price: number;
      discount_price: number | null;
      sku: string | null;
      status: 'active' | 'draft' | 'archived';
      is_featured: boolean;
      is_bestseller: boolean;
      sort_order: number;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      name: string;
      slug: string;
      description?: string | null;
      fabric?: string | null;
      care_instructions?: string | null;
      delivery_time?: string | null;
      category_id?: string | null;
      base_price: number;
      discount_price?: number | null;
      sku?: string | null;
      status?: 'active' | 'draft' | 'archived';
      is_featured?: boolean;
      is_bestseller?: boolean;
      sort_order?: number;
    };
    Update: {
      name?: string;
      slug?: string;
      description?: string | null;
      fabric?: string | null;
      care_instructions?: string | null;
      delivery_time?: string | null;
      category_id?: string | null;
      base_price?: number;
      discount_price?: number | null;
      sku?: string | null;
      status?: 'active' | 'draft' | 'archived';
      is_featured?: boolean;
      is_bestseller?: boolean;
    };
  };
  product_variants: {
    Row: {
      id: string;
      product_id: string;
      size: string | null;
      color: string | null;
      sku: string | null;
      stock_qty: number;
      price_override: number | null;
      created_at: string;
    };
    Insert: {
      product_id: string;
      size?: string | null;
      color?: string | null;
      sku?: string | null;
      stock_qty?: number;
      price_override?: number | null;
    };
    Update: {
      size?: string | null;
      color?: string | null;
      sku?: string | null;
      stock_qty?: number;
      price_override?: number | null;
    };
  };
  product_images: {
    Row: {
      id: string;
      product_id: string;
      url: string;
      sort_order: number;
      created_at: string;
    };
    Insert: {
      product_id: string;
      url: string;
      sort_order?: number;
    };
  };
  carts: {
    Row: {
      id: string;
      user_id: string | null;
      session_id: string | null;
      created_at: string;
    };
    Insert: {
      user_id?: string | null;
      session_id?: string | null;
    };
  };
  cart_items: {
    Row: {
      id: string;
      cart_id: string;
      variant_id: string;
      quantity: number;
      created_at: string;
    };
    Insert: {
      cart_id: string;
      variant_id: string;
      quantity?: number;
    };
    Update: {
      quantity?: number;
    };
  };
  orders: {
    Row: {
      id: string;
      user_id: string | null;
      guest_email: string | null;
      guest_phone: string | null;
      guest_name: string | null;
      status: string;
      payment_method: string;
      payment_status: string;
      subtotal: number;
      discount_amount: number;
      shipping_fee: number;
      total: number;
      promo_code: string | null;
      shipping_address: Record<string, unknown> | null;
      courier_tracking_id: string | null;
      payment_proof_url: string | null;
      notes: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      user_id?: string | null;
      guest_email?: string | null;
      guest_phone?: string | null;
      guest_name?: string | null;
      status?: string;
      payment_method?: string;
      payment_status?: string;
      subtotal?: number;
      discount_amount?: number;
      shipping_fee?: number;
      total?: number;
      promo_code?: string | null;
      shipping_address?: Record<string, unknown> | null;
      courier_tracking_id?: string | null;
      payment_proof_url?: string | null;
      notes?: string | null;
    };
    Update: {
      status?: string;
      payment_status?: string;
      courier_tracking_id?: string | null;
      notes?: string | null;
    };
  };
  order_items: {
    Row: {
      id: string;
      order_id: string;
      variant_id: string | null;
      product_name: string;
      variant_info: string | null;
      quantity: number;
      price_at_purchase: number;
      image_url: string | null;
      created_at: string;
    };
    Insert: {
      order_id: string;
      variant_id?: string | null;
      product_name: string;
      variant_info?: string | null;
      quantity?: number;
      price_at_purchase: number;
      image_url?: string | null;
    };
  };
  promo_codes: {
    Row: {
      id: string;
      code: string;
      description: string | null;
      type: string;
      value: number;
      min_order: number;
      max_discount: number | null;
      expiry_date: string | null;
      usage_limit: number | null;
      usage_count: number;
      is_active: boolean;
      created_at: string;
    };
    Insert: {
      code: string;
      description?: string | null;
      type?: string;
      value: number;
      min_order?: number;
      max_discount?: number | null;
      expiry_date?: string | null;
      usage_limit?: number | null;
      is_active?: boolean;
    };
    Update: {
      description?: string | null;
      value?: number;
      min_order?: number;
      max_discount?: number | null;
      expiry_date?: string | null;
      usage_limit?: number | null;
      is_active?: boolean;
    };
  };
  reviews: {
    Row: {
      id: string;
      product_id: string;
      user_id: string;
      user_name: string;
      rating: number;
      comment: string | null;
      images: string[] | null;
      is_approved: boolean;
      created_at: string;
    };
    Insert: {
      product_id: string;
      user_id?: string;
      user_name?: string;
      rating: number;
      comment?: string | null;
      images?: string[] | null;
    };
  };
  wishlist: {
    Row: {
      id: string;
      user_id: string;
      product_id: string;
      created_at: string;
    };
    Insert: {
      user_id?: string;
      product_id: string;
    };
  };
  settings: {
    Row: {
      key: string;
      value: Record<string, unknown>;
      updated_at: string;
    };
  };
};
