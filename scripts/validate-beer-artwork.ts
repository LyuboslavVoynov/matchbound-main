import {readFile,readdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {beerProductArtworkSchema} from "../src/domain/beer-product-artwork";
import {beerCatalogueSchema} from "../src/domain/beer-catalogue";
async function main(){
 const manifest=beerProductArtworkSchema.parse(JSON.parse(await readFile("src/data/beer-product-artwork.json","utf8")));
 const products=new Map<string,string>();
 for(const file of (await readdir("data")).filter(name=>/^beer-catalogue(?:\.[a-z-]+)?\.json$/.test(name))){
  const catalogue=beerCatalogueSchema.parse(JSON.parse(await readFile("data/"+file,"utf8")));
  for(const p of catalogue.products){if(products.has(p.id))throw Error("Duplicate catalogue product ID");products.set(p.id,catalogue.breweries.find(b=>b.id===p.breweryId)!.originNation);}
 }
 for(const asset of manifest.assets){
  if(products.get(asset.productId)!==asset.country)throw Error("Artwork product/country mismatch");
  const bytes=await readFile("public"+asset.src);
  if(createHash("sha256").update(bytes).digest("hex")!==asset.sha256)throw Error("Artwork bytes do not match reviewed hash");
 }
 console.info(JSON.stringify({approved:manifest.assets.filter(a=>a.approvalStatus==="approved").length,catalogueProductTargets:products.size,missingApprovedArtwork:[...products.keys()].filter(id=>!manifest.assets.some(a=>a.productId===id&&a.approvalStatus==="approved"))},null,2));
}
main().catch(()=>{console.error("Beer artwork validation failed; inspect source, product, licence and file hash.");process.exitCode=1});
