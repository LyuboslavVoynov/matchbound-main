import { z } from "zod";
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const https = z.string().url().refine(value => value.startsWith("https://"), "HTTPS source required");
export const beerCatalogueSchema = z.object({
  breweries: z.array(z.object({ id, name: z.string().min(1), countryCode: z.string().regex(/^[A-Z]{2}$/), originNation: z.string().min(1), sourceUrl: https }).strict()),
  products: z.array(z.object({ id, breweryId: id, name: z.string().min(1), normalizedName: z.string().min(1), style: z.string().min(1).nullable(), abvBasisPoints: z.number().int().min(0).max(2000).nullable(), sourceUrl: https, reviewedAt: z.string().datetime(), validUntil: z.string().datetime(), approvalStatus: z.enum(["approved", "pending", "rejected"]), active: z.boolean() }).strict()),
}).strict().superRefine((data, ctx) => {
  const breweries = new Map(data.breweries.map(b => [b.id,b]));
  const seen = new Set<string>();
  for (const b of data.breweries) { if (seen.has(b.id)) ctx.addIssue({code:"custom",message:"Duplicate brewery ID"}); seen.add(b.id); }
  seen.clear(); const names = new Set<string>();
  for (const product of data.products) {
    const key = product.breweryId + ":" + product.normalizedName;
    if (seen.has(product.id) || names.has(key)) ctx.addIssue({code:"custom",message:"Duplicate product"});
    seen.add(product.id); names.add(key);
    if (!breweries.has(product.breweryId)) ctx.addIssue({code:"custom",message:"Unknown brewery"});
    if (product.normalizedName !== normalizeBeerName(product.name)) ctx.addIssue({code:"custom",message:"Invalid normalized name"});
    if (new Date(product.validUntil) <= new Date(product.reviewedAt)) ctx.addIssue({code:"custom",message:"Invalid review expiry"});
  }
});
export function normalizeBeerName(name: string) { return name.normalize("NFKC").trim().toLocaleLowerCase("en").replace(/\s+/g," "); }
export const beerOriginFor = (country: string): {countryCode:string;originNation:string} | undefined => {
  const countries: Record<string,string> = {Germany:"DE",France:"FR",Spain:"ES",Italy:"IT",Portugal:"PT",Netherlands:"NL",England:"GB",Scotland:"GB",Wales:"GB","Northern Ireland":"GB"};
  return countries[country] ? {countryCode:countries[country],originNation:country} : undefined;
};
