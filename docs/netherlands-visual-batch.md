# Netherlands visual batch — reviewed9November2026, publication verified10November

Branch: feat/visual-coverage-netherlands. Added33reviewed Commons photographs and34exact mappings: all16destination cities,17/18grounds and one Netherlands country scene. The geographic manifest now has72photos/76placements. Beer artwork is a separate collection and is not counted as a city/ground photo.

Every selected subject, creator, source, reusable licence, original URL, transformation note, hash, dimensions and focal point is recorded in data/creatives/manifest.json. Attribution for Museum De Waag names Bart Ros / Erfgoed Deventer. Retain the source licence on image derivatives. Source dates are recorded; historic stadium names/branding and archival architecture do not claim current conditions. Beeckestijn's facade is explicitly labelled archival.

Publication: existing immutable-key importer uploaded only this33-image batch and downloaded every public object to verify its exact hash. The shared runtime resolves the same country/city/ground keys on production. No fuzzy aliases or invented grounds were added.

The remaining ground gap is Koning Willem II Stadion: the available map is not a photograph and the small author-release photographs did not meet this batch's licence/quality gate. Keep its editorial fallback. Kooi Stadion uses the new ground photographed in2025, not the old Cambuur stadium. Rejected false matches included a stadium model, apartment block, seating map, museum logo and painting.

Verification: eight content browser cases pass on the live app across desktop/mobile, covering Amsterdam, Utrecht, Leeuwarden/Kooi and Portugal's new country-scoped beer ticket. The Utrecht city reveal's actual responsive crop and photo credits were inspected. Unit publication/source gates, TypeScript, scoped lint, dry-run byte checks and live importer verification pass. Test-owned draws were cleaned up.

The sourcing script now generates only missing exact subjects; the checked-in queue contains the one remaining Dutch ground. The initial candidate file is discovery history, not an approval list. reviewed.json records decisions and the remaining gap. The unrelated original Around the Match worktree is excluded.
