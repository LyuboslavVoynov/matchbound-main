import {describe,it,expect}from"vitest";
import{creativeStorageHeaders}from"@/providers/creative-storage";
describe("Supabase creative storage credentials",()=>{
 it("uses opaque sb_secret keys only as apikey, never as Bearer JWTs",()=>{const secret="sb_secret_test_server_key";expect(creativeStorageHeaders(secret)).toEqual({apikey:secret})});
 it("retains compatibility with legacy service-role JWTs",()=>{const jwt=`header.${Buffer.from(JSON.stringify({role:"service_role"})).toString("base64url")}.signature`;expect(creativeStorageHeaders(jwt)).toEqual({apikey:jwt,Authorization:`Bearer ${jwt}`})});
 it("rejects publishable/anon/malformed keys without revealing their contents",()=>{for(const secret of ["sb_publishable_not_a_write_key","private_value_not_a_jwt",`header.${Buffer.from(JSON.stringify({role:"anon"})).toString("base64url")}.signature`]){expect(()=>creativeStorageHeaders(secret)).toThrow();try{creativeStorageHeaders(secret)}catch(error){expect((error as Error).message).not.toContain(secret)}}});
});
