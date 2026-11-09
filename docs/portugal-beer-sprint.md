# Sprint 6 — Portugal beer catalogue

Branch: feat/beer-catalogue-portugal. Target20–30reviewed distinct products. The initial manifest contains20candidate products from Musa, Dois Corvos and Super Bock, with manufacturer source URLs. It is a separate import file and does not replace Germany.

Current state: pending and inactive, not published or eligible for draws. Names/range/style were checked against the manufacturer lists; complete product-page and origin/availability review is still required before approval. Three Dois Corvos entries come from the available-now list rather than its seven-product permanent range. Review these sooner if published. ABV remains null. Cider, alcohol-free ranges and foreign products sold through Portuguese shops are excluded.

Primary sources: https://cervejamusa.com/ ; https://www.doiscorvos.pt/pt/beer/all?range=core-range ; https://www.doiscorvos.pt/pt/beer/all?scope=now ; https://www.superbock.pt/as-nossas-cervejas . No marketing descriptions or product images copied. Factory provenance: https://cervejamusa.com/pages/fabrica and Dois Corvos factory address on its range page.

Dry run: npm run beers:import -- data/beer-catalogue.portugal.json . After review, approved/active entries can be applied using the existing importer. Verify origin, per-product selection, legacy fallback and saved-ticket persistence; never auto-approve search results. Keep Matchbound seal until exact artwork is approved in the independent artwork sprint.
