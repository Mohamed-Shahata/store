import { Timestamp } from "firebase-admin/firestore";

/**
 * Recursively converts Firestore Timestamp instances (and anything with
 * a similar _seconds/_nanoseconds shape) into plain ISO strings, so the
 * result can be passed from Server Components to Client Components.
 */
export function serializeFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (data instanceof Timestamp) {
    return data.toDate().toISOString() as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeFirestoreData(item)) as unknown as T;
  }

  if (typeof data === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      data as Record<string, unknown>,
    )) {
      result[key] = serializeFirestoreData(value);
    }
    return result as T;
  }

  return data;
}
