import { CategoryPage } from '@/components/storefront/category-page';

export const revalidate = 60;

export default async function MenPage() {
  return <CategoryPage params={{ slug: 'men' }} title="Men's Collection" />;
}
