import { internalVisualAssetPolicy } from "@/domain/visual-identity";

/**
 * Internal-only visual preview. This must be disabled before any public
 * deployment unless written display rights and the allowed origins are
 * documented for that environment.
 */
export const visualAssetDisplayPolicy = internalVisualAssetPolicy(
  process.env.NEXT_PUBLIC_MATCHBOUND_INTERNAL_ASSET_PREVIEW === "true",
  process.env.NODE_ENV,
);
