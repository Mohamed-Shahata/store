"use server";

import { revalidateTag } from "next/cache";
import type { CacheTag } from "@/lib/cache-tags";

/**
 * Bust the public storefront cache for the given tags.
 *
 * Call this from admin client components right after a successful
 * create/update/delete/archive so shoppers see the change without
 * waiting for the cache's time-based revalidation window.
 *
 * NOTE: a "use server" file may only export async functions. Don't
 * re-export CACHE_TAGS (or anything else that isn't a function) from
 * here — import it directly from "@/lib/cache-tags" instead, otherwise
 * Next.js throws "A 'use server' file can only export async functions".
 */
export async function revalidateStoreCache(tags: CacheTag[]) {
  for (const tag of tags) {
    // Next 16 requires a profile argument; { expire: 0 } means "purge now".
    revalidateTag(tag, { expire: 0 });
  }
}
