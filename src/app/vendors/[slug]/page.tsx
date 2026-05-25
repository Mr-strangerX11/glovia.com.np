import axios from "axios";
import { fetchProducts } from "@/lib/serverApi";
import { getServerErrorSummary } from "@/lib/serverError";
import VendorStoreContent from "./VendorStoreContent.client";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';

export const dynamic = "force-dynamic";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.glovia.com.np/api/v1').replace(/\/+$/, '');

type Props = { params: { slug: string } };

async function fetchVendorBySlug(slug: string) {
  const res = await axios.get(`${API_BASE}/vendors/store/${slug}`);
  return res.data?.vendor ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const vendor = await fetchVendorBySlug(params.slug);
    if (vendor) {
      const name = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email;
      return {
        title: `${name} — Glovia Marketplace`,
        description: vendor.vendorDescription || `Shop products from ${name} on Glovia Marketplace Nepal.`,
      };
    }
  } catch {
    // ignore
  }
  return { title: `Vendor Store — Glovia Marketplace` };
}

export default async function VendorStorePage({ params }: Props) {
  const { slug } = params;

  try {
    const vendor = await fetchVendorBySlug(slug);

    if (!vendor) {
      notFound();
    }

    const vendorId = vendor._id?.toString();
    const productsResult = await fetchProducts({ vendorId, limit: 100 });
    const products = Array.isArray(productsResult) ? productsResult : productsResult?.data ?? [];

    return (
      <VendorStoreContent
        vendor={vendor}
        products={products}
        slug={slug}
      />
    );
  } catch (err) {
    console.warn(`[VendorStore] Fetch failed (${getServerErrorSummary(err)})`);
    notFound();
  }
}
