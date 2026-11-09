import { MatchResult } from "@/components/match-result";
import sample from "@/data/results-ticket-example.json";
import type { DrawResultSnapshot } from "@/domain/result";
import { reviewedCountryBeerBrands } from "@/providers/beer-signal-registry";
export default async function ResultsTicketPreview({searchParams}:{searchParams:Promise<{beer?:string;empty?:string}>}) {
 const params=await searchParams;
 const brand=reviewedCountryBeerBrands.find(b=>b.countryName===sample.country&&b.brandName===params.beer);
 const result:DrawResultSnapshot={...sample,...(params.empty?{headToHead:undefined,beerSignals:undefined}:brand?{beerSignals:{...sample.beerSignals,countryBrand:{countryName:brand.countryName,brandName:brand.brandName,originStatement:brand.originStatement}}}:{})};
 return <MatchResult result={result} tripStartDate="2026-11-20" tripEndDate="2026-11-22" resultPath="/design/results-ticket" preview/>;
}
