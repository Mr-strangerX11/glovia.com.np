import ProductsContent from "./ProductsContent.client";
import { fetchAllProducts, fetchBrands, fetchCategories, fetchFeaturedProducts, fetchWishlist } from "@/lib/serverApi";
import { cookies } from "next/headers";

export default async function ProductsPage({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  const category = params?.category || undefined;
  const brand = params?.brand || undefined;
  const search = params?.search || params?.q || undefined;

  const [productsResult, brandsResult, categoriesResult, featuredResult, wishlistResult] =
    await Promise.allSettled([
      fetchAllProducts({ category, brand, search }),
      fetchBrands(),
      fetchCategories(),
      fetchFeaturedProducts(12),
      fetchWishlist(cookies()),
    ]);

  const products = productsResult.status === "fulfilled" ? productsResult.value : [];
  const brands = brandsResult.status === "fulfilled" ? brandsResult.value : [];
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const featuredProducts = featuredResult.status === "fulfilled" ? featuredResult.value : [];
  const wishlist = wishlistResult.status === "fulfilled" ? wishlistResult.value : [];

  return (
    <ProductsContent
      products={products}
      brands={brands}
      categories={categories}
      featuredProducts={featuredProducts}
      wishlist={wishlist}
      initialCategory={category}
      initialBrand={brand}
      initialSearch={search}
    />
  );
}
