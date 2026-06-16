"use server";

import { revalidateTag } from "next/cache";
import { CACHE_TAGS, type CacheTag } from "@/lib/cache-tags";

/**
 * Bust the public storefront cache for the given tags.
 *
 * Call this from admin client components right after a successful
 * create/update/delete/archive so shoppers see the change without
 * waiting for the cache's time-based revalidation window.
 */
export async function revalidateStoreCache(tags: CacheTag[]) {
  for (const tag of tags) {
    // Next 16 requires a profile argument; { expire: 0 } means "purge now".
    revalidateTag(tag, { expire: 0 });
  }
}

export { CACHE_TAGS };
