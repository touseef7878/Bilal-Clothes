// Demo data shown when Supabase is not connected yet.
// All images are from Pexels (free to use).

export type DemoProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  fabric: string;
  care_instructions: string;
  delivery_time: string;
  category_id: string;
  base_price: number;
  discount_price: number | null;
  sku: string;
  status: 'active';
  is_featured: boolean;
  is_bestseller: boolean;
  sort_order: number;
  gender: 'men' | 'women';
  categories: { name: string; slug: string };
  product_images: { id: string; url: string; sort_order: number }[];
  product_variants: {
    id: string;
    size: string;
    color: string;
    stock_qty: number;
    price_override: number | null;
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string;
    user_name: string;
    created_at: string;
    is_approved: boolean;
  }[];
};

function mkVariants(id: string, colors: string[], sizes = ['S', 'M', 'L', 'XL'], stock = 20) {
  const variants: DemoProduct['product_variants'] = [];
  colors.forEach((color, ci) =>
    sizes.forEach((size, si) =>
      variants.push({ id: `${id}-v${ci}-${si}`, size, color, stock_qty: stock, price_override: null })
    )
  );
  return variants;
}

function mkReviews(id: string, items: { name: string; rating: number; comment: string }[]) {
  return items.map((r, i) => ({
    id: `${id}-r${i}`,
    rating: r.rating,
    comment: r.comment,
    user_name: r.name,
    created_at: new Date(Date.now() - i * 86400000 * 5).toISOString(),
    is_approved: true,
  }));
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  // ── MEN ──────────────────────────────────────────────────────────────────
  {
    id: 'men-1',
    name: 'Classic White Shalwar Kameez',
    slug: 'classic-white-shalwar-kameez',
    description: 'Crisp white shalwar kameez crafted from premium cotton lawn. Perfect for Eid, weddings, or everyday elegance. Features subtle embroidery on the collar.',
    fabric: 'Cotton Lawn',
    care_instructions: 'Machine wash cold, gentle cycle. Hang dry. Iron on medium heat.',
    delivery_time: '3–5 business days',
    category_id: 'cat-men',
    base_price: 3500,
    discount_price: null,
    sku: 'MN-WSK-001',
    status: 'active',
    is_featured: true,
    is_bestseller: true,
    sort_order: 1,
    gender: 'men',
    categories: { name: 'Men', slug: 'men' },
    product_images: [
      { id: 'men-1-img1', url: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 0 },
      { id: 'men-1-img2', url: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 1 },
    ],
    product_variants: mkVariants('men-1', ['White', 'Off-White']),
    reviews: mkReviews('men-1', [
      { name: 'Ahmed Raza', rating: 5, comment: 'Excellent quality! Wore it on Eid and got so many compliments.' },
      { name: 'Usman Ali', rating: 4, comment: 'Great fabric, very comfortable in the heat.' },
    ]),
  },
  {
    id: 'men-2',
    name: 'Navy Blue Kurta',
    slug: 'navy-blue-kurta',
    description: 'Sophisticated navy blue kurta with fine threadwork detailing. Made from soft khaddar fabric, ideal for winter gatherings and formal occasions.',
    fabric: 'Khaddar',
    care_instructions: 'Hand wash or dry clean recommended. Iron inside out.',
    delivery_time: '3–5 business days',
    category_id: 'cat-men',
    base_price: 4200,
    discount_price: 3399,
    sku: 'MN-NBK-002',
    status: 'active',
    is_featured: true,
    is_bestseller: false,
    sort_order: 2,
    gender: 'men',
    categories: { name: 'Men', slug: 'men' },
    product_images: [
      { id: 'men-2-img1', url: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 0 },
      { id: 'men-2-img2', url: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 1 },
    ],
    product_variants: mkVariants('men-2', ['Navy', 'Charcoal']),
    reviews: mkReviews('men-2', [
      { name: 'Bilal Khan', rating: 5, comment: 'Premium stitching and the fabric feels amazing.' },
      { name: 'Faisal Mahmood', rating: 4, comment: 'Fits true to size. Very happy with this purchase.' },
    ]),
  },
  {
    id: 'men-3',
    name: 'Emerald Green Embroidered Kurta',
    slug: 'emerald-green-embroidered-kurta',
    description: 'Rich emerald green kurta with delicate gold embroidery. A showstopper for weddings and festive occasions. Comes with matching trouser.',
    fabric: 'Silk Blend',
    care_instructions: 'Dry clean only. Store in a cool dry place.',
    delivery_time: '4–6 business days',
    category_id: 'cat-men',
    base_price: 6500,
    discount_price: 5200,
    sku: 'MN-GEK-003',
    status: 'active',
    is_featured: true,
    is_bestseller: true,
    sort_order: 3,
    gender: 'men',
    categories: { name: 'Men', slug: 'men' },
    product_images: [
      { id: 'men-3-img1', url: 'https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 0 },
    ],
    product_variants: mkVariants('men-3', ['Emerald', 'Bottle Green']),
    reviews: mkReviews('men-3', [
      { name: 'Hamza Sheikh', rating: 5, comment: 'Wore this to a wedding – everyone asked where I got it!' },
    ]),
  },
  {
    id: 'men-4',
    name: 'Linen Casual Kurta',
    slug: 'linen-casual-kurta',
    description: 'Relaxed-fit linen kurta for everyday wear. Breathable fabric keeps you cool all day. Minimalist design with side slits for easy movement.',
    fabric: 'Pure Linen',
    care_instructions: 'Machine wash cold. Tumble dry low. Iron while slightly damp.',
    delivery_time: '3–5 business days',
    category_id: 'cat-men',
    base_price: 2800,
    discount_price: null,
    sku: 'MN-LCK-004',
    status: 'active',
    is_featured: false,
    is_bestseller: true,
    sort_order: 4,
    gender: 'men',
    categories: { name: 'Men', slug: 'men' },
    product_images: [
      { id: 'men-4-img1', url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 0 },
    ],
    product_variants: mkVariants('men-4', ['Beige', 'Grey', 'Sky Blue']),
    reviews: mkReviews('men-4', [
      { name: 'Tariq Jameel', rating: 4, comment: 'Perfect summer kurta. Very light and breezy.' },
      { name: 'Zubair Hassan', rating: 5, comment: 'Best casual kurta I have bought. Great value.' },
    ]),
  },
  // ── WOMEN ────────────────────────────────────────────────────────────────
  {
    id: 'women-1',
    name: 'Pink Lawn 3-Piece Suit',
    slug: 'pink-lawn-3-piece-suit',
    description: 'Stunning summer lawn suit in soft pink with floral print. Includes printed shirt, dyed trouser, and chiffon dupatta. Lightweight and perfect for hot days.',
    fabric: 'Lawn',
    care_instructions: 'Machine wash cold. Do not bleach. Iron on low heat.',
    delivery_time: '3–5 business days',
    category_id: 'cat-women',
    base_price: 4500,
    discount_price: 3599,
    sku: 'WM-PL3-001',
    status: 'active',
    is_featured: true,
    is_bestseller: true,
    sort_order: 1,
    gender: 'women',
    categories: { name: 'Women', slug: 'women' },
    product_images: [
      { id: 'women-1-img1', url: 'https://images.pexels.com/photos/2703202/pexels-photo-2703202.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 0 },
      { id: 'women-1-img2', url: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 1 },
    ],
    product_variants: mkVariants('women-1', ['Pink', 'Peach'], ['XS', 'S', 'M', 'L', 'XL']),
    reviews: mkReviews('women-1', [
      { name: 'Ayesha Malik', rating: 5, comment: 'Beautiful colour and the fabric is so soft. Love it!' },
      { name: 'Sana Tariq', rating: 5, comment: 'Perfect stitching and lovely print. Will order again.' },
      { name: 'Rabia Noor', rating: 4, comment: 'Great quality for the price. Fast delivery too.' },
    ]),
  },
  {
    id: 'women-2',
    name: 'Royal Blue Chiffon Anarkali',
    slug: 'royal-blue-chiffon-anarkali',
    description: 'Flowing royal blue Anarkali in premium chiffon. Adorned with intricate silver embroidery on the neckline and sleeves. A timeless choice for weddings.',
    fabric: 'Chiffon',
    care_instructions: 'Dry clean only. Handle with care.',
    delivery_time: '5–7 business days',
    category_id: 'cat-women',
    base_price: 8500,
    discount_price: 6999,
    sku: 'WM-BCA-002',
    status: 'active',
    is_featured: true,
    is_bestseller: true,
    sort_order: 2,
    gender: 'women',
    categories: { name: 'Women', slug: 'women' },
    product_images: [
      { id: 'women-2-img1', url: 'https://images.pexels.com/photos/1381553/pexels-photo-1381553.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 0 },
      { id: 'women-2-img2', url: 'https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 1 },
    ],
    product_variants: mkVariants('women-2', ['Royal Blue', 'Midnight Navy'], ['XS', 'S', 'M', 'L', 'XL']),
    reviews: mkReviews('women-2', [
      { name: 'Mehwish Hayat', rating: 5, comment: 'Absolutely gorgeous! Got so many compliments at the wedding.' },
      { name: 'Zara Ahmed', rating: 5, comment: 'The embroidery is exquisite. Worth every rupee.' },
    ]),
  },
  {
    id: 'women-3',
    name: 'Mustard Cotton Kurta',
    slug: 'mustard-cotton-kurta',
    description: 'Casual mustard kurta in breathable cotton. Features block print detailing and a relaxed silhouette perfect for everyday styling or casual outings.',
    fabric: 'Cotton',
    care_instructions: 'Machine wash cold. Hang dry. Iron on medium.',
    delivery_time: '3–5 business days',
    category_id: 'cat-women',
    base_price: 2200,
    discount_price: null,
    sku: 'WM-MCK-003',
    status: 'active',
    is_featured: true,
    is_bestseller: false,
    sort_order: 3,
    gender: 'women',
    categories: { name: 'Women', slug: 'women' },
    product_images: [
      { id: 'women-3-img1', url: 'https://images.pexels.com/photos/2233416/pexels-photo-2233416.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 0 },
    ],
    product_variants: mkVariants('women-3', ['Mustard', 'Rust', 'Sage Green'], ['XS', 'S', 'M', 'L', 'XL']),
    reviews: mkReviews('women-3', [
      { name: 'Hina Altaf', rating: 4, comment: 'Very comfortable for daily wear. Love the colour.' },
    ]),
  },
  {
    id: 'women-4',
    name: 'Ivory Embroidered Lawn Suit',
    slug: 'ivory-embroidered-lawn-suit',
    description: 'Elegant ivory 2-piece lawn suit with hand-done embroidery. A classic choice for Eid and formal gatherings. Pairs beautifully with gold jewellery.',
    fabric: 'Embroidered Lawn',
    care_instructions: 'Gentle hand wash. Do not wring. Air dry flat.',
    delivery_time: '4–6 business days',
    category_id: 'cat-women',
    base_price: 5800,
    discount_price: 4650,
    sku: 'WM-IEL-004',
    status: 'active',
    is_featured: false,
    is_bestseller: true,
    sort_order: 4,
    gender: 'women',
    categories: { name: 'Women', slug: 'women' },
    product_images: [
      { id: 'women-4-img1', url: 'https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 0 },
    ],
    product_variants: mkVariants('women-4', ['Ivory', 'Cream'], ['XS', 'S', 'M', 'L', 'XL']),
    reviews: mkReviews('women-4', [
      { name: 'Anum Baig', rating: 5, comment: 'Stunning piece. The embroidery detail is very fine.' },
      { name: 'Sara Qureshi', rating: 4, comment: 'Lovely suit. Delivery was quick too!' },
    ]),
  },
  {
    id: 'women-5',
    name: 'Sage Green Khaddar Suit',
    slug: 'sage-green-khaddar-suit',
    description: 'Cosy winter khaddar suit in calming sage green. Thick and warm fabric with subtle woven texture. Includes matching trousers and wool shawl.',
    fabric: 'Khaddar',
    care_instructions: 'Hand wash cold. Dry in shade.',
    delivery_time: '3–5 business days',
    category_id: 'cat-women',
    base_price: 3800,
    discount_price: 2999,
    sku: 'WM-SGK-005',
    status: 'active',
    is_featured: false,
    is_bestseller: false,
    sort_order: 5,
    gender: 'women',
    categories: { name: 'Women', slug: 'women' },
    product_images: [
      { id: 'women-5-img1', url: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 0 },
    ],
    product_variants: mkVariants('women-5', ['Sage Green', 'Olive'], ['XS', 'S', 'M', 'L', 'XL']),
    reviews: mkReviews('women-5', [
      { name: 'Nadia Hussain', rating: 4, comment: 'Perfect winter suit. Fabric is thick and warm.' },
    ]),
  },
  {
    id: 'men-5',
    name: 'Charcoal Waistcoat Set',
    slug: 'charcoal-waistcoat-set',
    description: 'Sophisticated charcoal grey waistcoat paired with matching shalwar kameez. Ideal for formal events, mehndi nights, and office functions.',
    fabric: 'Blended Fabric',
    care_instructions: 'Dry clean recommended for waistcoat. Shirt machine washable cold.',
    delivery_time: '4–6 business days',
    category_id: 'cat-men',
    base_price: 5500,
    discount_price: 4399,
    sku: 'MN-CWS-005',
    status: 'active',
    is_featured: true,
    is_bestseller: false,
    sort_order: 5,
    gender: 'men',
    categories: { name: 'Men', slug: 'men' },
    product_images: [
      { id: 'men-5-img1', url: 'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 0 },
      { id: 'men-5-img2', url: 'https://images.pexels.com/photos/1261422/pexels-photo-1261422.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 1 },
    ],
    product_variants: mkVariants('men-5', ['Charcoal', 'Dark Grey']),
    reviews: mkReviews('men-5', [
      { name: 'Imran Ashraf', rating: 5, comment: 'Looks extremely sharp. Got many compliments at the event.' },
      { name: 'Kamran Akmal', rating: 4, comment: 'Good quality fabric. Fits well.' },
    ]),
  },
  {
    id: 'men-6',
    name: 'Sky Blue Summer Shalwar Kameez',
    slug: 'sky-blue-summer-shalwar-kameez',
    description: 'Light and airy sky blue shalwar kameez. Made with fine cotton lawn for maximum breathability. A go-to outfit for hot Pakistani summers.',
    fabric: 'Cotton Lawn',
    care_instructions: 'Machine wash cold. Hang dry. Iron on medium.',
    delivery_time: '3–5 business days',
    category_id: 'cat-men',
    base_price: 3200,
    discount_price: 2499,
    sku: 'MN-SBS-006',
    status: 'active',
    is_featured: false,
    is_bestseller: true,
    sort_order: 6,
    gender: 'men',
    categories: { name: 'Men', slug: 'men' },
    product_images: [
      { id: 'men-6-img1', url: 'https://images.pexels.com/photos/842811/pexels-photo-842811.jpeg?auto=compress&cs=tinysrgb&w=800', sort_order: 0 },
    ],
    product_variants: mkVariants('men-6', ['Sky Blue', 'Light Blue']),
    reviews: mkReviews('men-6', [
      { name: 'Adeel Chaudhry', rating: 5, comment: 'Great for summer. Very light on the skin.' },
    ]),
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

export const DEMO_CATEGORIES = [
  { id: 'cat-men',   name: 'Men',   slug: 'men',   gender: 'men' },
  { id: 'cat-women', name: 'Women', slug: 'women', gender: 'women' },
];

export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return !url || url.includes('placeholder') || url.includes('your-project');
}

export function getDemoProducts(gender?: 'men' | 'women'): DemoProduct[] {
  if (!gender) return DEMO_PRODUCTS;
  return DEMO_PRODUCTS.filter((p) => p.gender === gender);
}

export function getDemoFeatured(): DemoProduct[] {
  return DEMO_PRODUCTS.filter((p) => p.is_featured).slice(0, 8);
}

export function getDemoBestsellers(): DemoProduct[] {
  return DEMO_PRODUCTS.filter((p) => p.is_bestseller).slice(0, 4);
}

export function getDemoSale(): DemoProduct[] {
  return DEMO_PRODUCTS.filter((p) => p.discount_price !== null);
}

export function getDemoProductBySlug(slug: string): DemoProduct | undefined {
  return DEMO_PRODUCTS.find((p) => p.slug === slug);
}
