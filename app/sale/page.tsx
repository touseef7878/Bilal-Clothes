import { CategoryPage } from '@/components/storefront/category-page';

export const revalidate = 60;

export default async function SalePage() {
  return <CategoryPage params={{ slug: 'sale' }} title="Sale" isSalePage />;
}
