/** A duplicate upload is reusable only after the caller verifies the public bytes. */
export async function creativeUploadAlreadyExists(response: Response): Promise<boolean> {
  if (response.status === 409) return true;
  if (response.status !== 400) return false;
  try {
    const body = await response.json() as {statusCode?: unknown; error?: unknown};
    return body !== null && String(body.statusCode) === "409" && body.error === "Duplicate";
  } catch { return false; }
}

/** Server-only Storage request headers. New opaque secret keys are not JWTs. */
export function creativeStorageHeaders(secret: string): Record<string, string> {
  if (secret.startsWith("sb_secret_") && secret.length > 12) return { apikey: secret };
  if (secret.startsWith("sb_publishable_")) throw Error("Creative publication requires a server-side Supabase secret key, not a publishable key.");
  try {
    const parts=secret.split(".");
    const payload=JSON.parse(Buffer.from(parts[1],"base64url").toString("utf8")) as {role?:string};
    if(parts.length===3&&payload.role==="service_role")return {apikey:secret,Authorization:`Bearer ${secret}`};
  } catch { /* Do not include the supplied secret in diagnostics. */ }
  throw Error("Creative publication requires SUPABASE_SECRET_KEY or a legacy service-role JWT.");
}
