import {describe,it,expect}from"vitest";
import{creativeStorageHeaders,creativeUploadAlreadyExists}from"@/providers/creative-storage";
describe("immutable creative upload responses",()=>{
 it("recognizes both HTTP conflict and Supabase's wrapped duplicate response",async()=>{
  expect(await creativeUploadAlreadyExists(new Response(null,{status:409}))).toBe(true);
  expect(await creativeUploadAlreadyExists(Response.json({statusCode:"409",error:"Duplicate"},{status:400}))).toBe(true);
 });
 it("rejects unrelated failures, malformed bodies and misleading messages",async()=>{
  for(const response of [new Response(null,{status:403}),new Response("invalid",{status:400}),Response.json(null,{status:400}),Response.json({statusCode:400,error:"Duplicate"},{status:400}),Response.json({statusCode:409,error:"AccessDenied"},{status:400}),Response.json({message:"The resource already exists"},{status:400})]){
   expect(await creativeUploadAlreadyExists(response)).toBe(false);
  }
 });
});
describe("Supabase creative storage credentials",()=>{
 it("uses opaque sb_secret keys only as apikey, never as Bearer JWTs",()=>{const secret="sb_secret_test_server_key";expect(creativeStorageHeaders(secret)).toEqual({apikey:secret})});
 it("retains compatibility with legacy service-role JWTs",()=>{const jwt=`header.${Buffer.from(JSON.stringify({role:"service_role"})).toString("base64url")}.signature`;expect(creativeStorageHeaders(jwt)).toEqual({apikey:jwt,Authorization:`Bearer ${jwt}`})});
 it("rejects publishable/anon/malformed keys without revealing their contents",()=>{for(const secret of ["sb_publishable_not_a_write_key","private_value_not_a_jwt",`header.${Buffer.from(JSON.stringify({role:"anon"})).toString("base64url")}.signature`]){expect(()=>creativeStorageHeaders(secret)).toThrow();try{creativeStorageHeaders(secret)}catch(error){expect((error as Error).message).not.toContain(secret)}}});
});
