import { Timestamp } from "firebase-admin/firestore";

/**
 * Recursively converts Firestore Timestamp instances (and anything with
 * a similar _seconds/_nanoseconds shape or toDate method) into plain ISO strings,
 * so the result can be safely passed from Server Components to Client Components.
 */
export function serializeFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) return data;

  // 1. Instance of Firestore Timestamp
  if (data instanceof Timestamp) {
    return data.toDate().toISOString() as unknown as T;
  }

  // 2. Duck-typed object with toDate() function
  if (
    typeof data === "object" &&
    data !== null &&
    "toDate" in data &&
    typeof (data as Record<string, unknown>).toDate === "function"
  ) {
    try {
      return (data as { toDate: () => Date }).toDate().toISOString() as unknown as T;
    } catch {}
  }

  // 3. Duck-typed object with _seconds and _nanoseconds
  if (
    typeof data === "object" &&
    data !== null &&
    "_seconds" in data &&
    typeof (data as Record<string, unknown>)._seconds === "number"
  ) {
    const raw = data as { _seconds: number; _nanoseconds?: number };
    const seconds = raw._seconds;
    const nanoseconds = raw._nanoseconds || 0;
    return new Date(seconds * 1000 + nanoseconds / 1000000).toISOString() as unknown as T;
  }

  // 4. Native JavaScript Date instance
  if (data instanceof Date) {
    return data.toISOString() as unknown as T;
  }

  // 5. Array
  if (Array.isArray(data)) {
    return data.map((item) => serializeFirestoreData(item)) as unknown as T;
  }

  // 6. Plain or nested object
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
