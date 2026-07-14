export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getEffectivePrice(basePrice: number, discountPrice: number | null): number {
  if (discountPrice !== null && discountPrice !== undefined && discountPrice < basePrice) {
    return discountPrice;
  }
  return basePrice;
}

export function getDiscountPercentage(basePrice: number, discountPrice: number | null): number {
  if (!discountPrice || discountPrice >= basePrice) return 0;
  return Math.round(((basePrice - discountPrice) / basePrice) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function validatePakistaniPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  const pattern = /^(\+92|0)?3\d{9}$/;
  return pattern.test(cleaned);
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+92')) return cleaned;
  if (cleaned.startsWith('0')) return '+92' + cleaned.slice(1);
  if (cleaned.startsWith('3')) return '+92' + cleaned;
  return cleaned;
}

export const PAKISTANI_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
  'Islamabad Capital Territory',
];

export const PAKISTANI_CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot', 'Gujranwala', 'Bahawalpur',
  'Sargodha', 'Sukkur', 'Mardan', 'Larkana', 'Sheikhupura', 'Kasur',
  'Rahim Yar Khan', 'Jhang', 'Dera Ghazi Khan', 'Sahiwal', 'Wah Cantonment',
  'Muzaffarabad', 'Gilgit', 'Skardu', 'Abbottabad', 'Mansehra', 'Chiniot',
  'Jhelum', 'Kamoke', 'Mandi Bahauddin', 'Kot Addu', 'Okara', 'Vehari',
];

export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

export function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
}
