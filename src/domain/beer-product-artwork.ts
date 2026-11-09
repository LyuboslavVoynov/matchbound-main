import {z} from "zod";
import {reusableCreativeLicense,safeHttps} from "./creative-library";
const https=z.string().refine(safeHttps,"Credential-free HTTPS source required");
export const beerProductArtworkSchema=z.object({version:z.literal(1),assets:z.array(z.object({
 productId:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),country:z.string().min(1),brand:z.string().min(1),
 src:z.string().regex(/^\/beer\/products\/[a-z0-9-]+\.(?:webp|png|jpg|gif)$/),
 source:https,author:z.string().min(1),license:z.string(),licenseUrl:https,
 sha256:z.string().regex(/^[a-f0-9]{64}$/),reviewedAt:z.string().datetime(),approvalStatus:z.enum(["pending","approved","rejected"]),
}).strict().refine(a=>reusableCreativeLicense(a.license,a.licenseUrl),"Reviewed reusable licence required"))}).strict().superRefine((m,ctx)=>{
 const ids=new Set<string>();for(const a of m.assets){if(ids.has(a.productId))ctx.addIssue({code:"custom",message:"Duplicate artwork product ID"});ids.add(a.productId);}
});
/** Product snapshots resolve only reviewed exact ID/country mappings. No name inference. */
export function productBeerArtworkFor(manifest:unknown,country:string,productId:string){
 const parsed=beerProductArtworkSchema.safeParse(manifest);if(!parsed.success)return undefined;
 return parsed.data.assets.find(a=>a.productId===productId&&a.country===country&&a.approvalStatus==="approved");
}
