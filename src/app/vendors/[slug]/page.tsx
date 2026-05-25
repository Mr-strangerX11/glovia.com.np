import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import VendorStoreContent from "./VendorStoreContent.client";

export const dynamic = "force-dynamic";

const API = 'https://backend.glovia.com.np/api/v1';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`${API}/vendors/store/${params.slug}`, { cache: 'no-store' });
    const data = await res.json();
    const vendor = data?.vendor;
    if (vendor) {
      const name = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email;
      return {
        title: `${name} — Glovia Marketplace`,
        description: vendor.vendorDescription || `Shop from ${name} on Glovia Marketplace.`,
      };
    }
  } catch {}
  return { title: 'Vendor Store — Glovia Marketplace' };
}

export default async function VendorStorePage({ params }: Props) {
  const { slug } = params;

  const vendorRes = await fetch(`${API}/vendors/store/${slug}`, { cache: 'no-store' });
  if (!vendorRes.ok) notFound();

  const vendorData = await vendorRes.json();
  const vendor = vendorData?.vendor;
  if (!vendor) notFound();

  const vendorId = String(vendor._id || slug);
  let products: any[] = [];
  try {
    const prodRes = await fetch(`${API}/products?vendorId=${vendorId}&limit=100`, { cache: 'no-store' });
    const prodData = await prodRes.json();
    products = Array.isArray(prodData?.data) ? prodData.data : [];
  } catch {}

  return <VendorStoreContent vendor={vendor} products={products} slug={slug} />;
}
