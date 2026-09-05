import * as admin from "firebase-admin";
import { getFirestore, Firestore } from "firebase-admin/firestore";

/**
 * The app is pinned to this named Firestore database everywhere else
 * (client SDK: src/lib/firebase.ts, firebase.json's "firestore.default").
 * Bare admin.firestore() always resolves to "(default)", a different,
 * empty database — every Cloud Function must use this helper instead.
 */
export const FIRESTORE_DATABASE_ID =
  "ai-studio-dishadiagnostice-63fe1b2b-7f23-4689-aa1a-cd41267d5918";

let dbInstance: Firestore | undefined;

export function getDb(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(admin.app(), FIRESTORE_DATABASE_ID);
  }
  return dbInstance;
}
