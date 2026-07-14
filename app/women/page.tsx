import { CategoryPage } from '@/components/storefront/category-page';

export const revalidate = 60;

export default async function WomenPage() {
  return <CategoryPage params={{ slug: 'women' }} title="Women's Collection" />;
}
