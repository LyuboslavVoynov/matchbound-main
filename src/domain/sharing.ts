/** Share the stable saved-result route, independent of tracking queries or hashes. */
export function canonicalTripUrl(origin: string, resultPath: string) {
  return new URL(resultPath, new URL(origin).origin).toString();
}
export function whatsAppShareUrl(tripUrl: string, message: string) {
  return `https://wa.me/?text=${encodeURIComponent(`${message}\n${tripUrl}`)}`;
}
