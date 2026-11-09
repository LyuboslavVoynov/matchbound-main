# Weekend Journal photography study

Branch: `feat/weekend-journal-preview`, based on main (9bda9fd).
Preview: `/design/weekend-journal` (local server port 3012).

## Live implementation

The live saved-trip reveal now uses the Weekend Journal card layout for country → city → league → stadium → clubs, retaining the Matchbound brand bookends and existing result handoff. Draw logic, database snapshots and the result page are unchanged. Playback is automatic, with no Pause, Next, Skip or Lock it in buttons. Photo credits suspend playback while expanded and resume it when closed; hidden-tab suspension and reduced-motion bypass remain implemented. The existing chapter circles fill progressively using the playback timer; there is no additional countdown or bottom progress bar. Photo-credit expansion and hidden-tab suspension preserve the remaining reading time. Playback never creates a new draw.

Static comparison storyboards remain at `/design/weekend-journal`; they have no playback controls. Each destination links to interactive playback at `/design/weekend-journal/play?destination=porto` (also milan/bilbao/fallback). These demo matchups are illustrative and end on an explicitly labelled demonstration page. Real saved draws still end at `/m/{shareToken}`.

Nine real photographs are stored locally as optimized WebP files; no runtime photo-search API or AI-generated photography. Country scenes represent national atmosphere, not the destination city's vicinity (Algarve/Portugal, Tuscany/Italy, Basque coast/Spain). City images depict the named landmarks. Stadium photos identify the actual grounds but are archival and do not establish current ground condition. League cards use an original typographic treatment; crests use the existing football-data host.

## Sources and reuse

Each photograph's author, source, original URL and licence are recorded in `src/data/journal-assets.json` and visible in the preview credits. Images are displayed with responsive crops, without retouching. CC BY-SA image adaptations remain subject to their stated share-alike licences; photograph licences are separate from application code.

- **porto-city**: [Puente de Don Luis I, Oporto, Portugal, 2019-06-02, DD 29-31 HDR.jpg](https://commons.wikimedia.org/wiki/File:Puente_de_Don_Luis_I,_Oporto,_Portugal,_2019-06-02,_DD_29-31_HDR.jpg) — Diego Delso, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0). Cropped for display.
- **porto-stadium**: [Porto Estádio do Dragão 1.jpg](https://commons.wikimedia.org/wiki/File:Porto_Est%C3%A1dio_do_Drag%C3%A3o_1.jpg) — Валерий Дед, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0). Cropped for display.
- **milan-city**: [Duomo Di Milano, Front Facade, Milan, Italy.jpg](https://commons.wikimedia.org/wiki/File:Duomo_Di_Milano,_Front_Facade,_Milan,_Italy.jpg) — Saptarshi Pal, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0). Cropped for display.
- **milan-stadium**: [Giuseppe Meazza (San Siro) stadium, exterior view.jpg](https://commons.wikimedia.org/wiki/File:Giuseppe_Meazza_(San_Siro)_stadium,_exterior_view.jpg) — https://www.flickr.com/photos/johnseb/, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0). Cropped for display.
- **bilbao-city**: [Bilbao - Guggenheim aurore.jpg](https://commons.wikimedia.org/wiki/File:Bilbao_-_Guggenheim_aurore.jpg) — PA, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0). Cropped for display.
- **bilbao-stadium**: [Exterior of San Mamés stadium.jpg](https://commons.wikimedia.org/wiki/File:Exterior_of_San_Mam%C3%A9s_stadium.jpg) — Marco Almbauer, [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en). Cropped for display.
- **portugal-country**: [Portugal - Algarve - coast west of Lagos (25657164162).jpg](https://commons.wikimedia.org/wiki/File:Portugal_-_Algarve_-_coast_west_of_Lagos_(25657164162).jpg) — muffinn from Worcester, UK, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0). Cropped for display.
- **italy-country**: [Cypress tree alley at sunset in Asciano, Tuscany.jpg](https://commons.wikimedia.org/wiki/File:Cypress_tree_alley_at_sunset_in_Asciano,_Tuscany.jpg) — Eric Kilby, [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0). Cropped for display.
- **spain-country**: [Gaztelugatxe (11355271064).jpg](https://commons.wikimedia.org/wiki/File:Gaztelugatxe_(11355271064).jpg) — Grand Parc - Bordeaux, France from France, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0). Cropped for display.

## Image reliability

The country, city and stadium library is preloaded with a 1.4-second bound. Only successfully decoded photos from that preload are used in playback; slow or failed images stay on the editorial fallback. A runtime image error also switches to the fallback. Exact country/city mappings select landmarks; stadium photographs additionally require an approved ground-name match. Unknown cities and unreviewed grounds never borrow another destination’s photos.

## Checks

- TypeScript and focused page ESLint passed.
- Browser: 15 static storyboard cards, no broken photographs/crests, no page exceptions.
- Desktop 1512px and mobile 390px inspected; no document-level horizontal overflow on mobile.
- Five photo mapping/provenance tests passed. Six focused browser cases cover slower automatic playback, distinct chapter animation names, the absence of playback buttons, photo-credit suspension, failed images and reduced motion across desktop/mobile. Two additional existing browser cases confirm a persisted saved-trip handoff and 320px long-name layout/unmount cleanup.
- Production collection still requires a deliberate image selection for every supported destination, crop/focal-point review, required credits and a missing-image fallback. Only the three reviewed destinations have city/stadium photography in this first implementation; other destinations use the editorial treatment. No deployment has been performed.

## Motion direction

24 seconds of normal playback including the 700ms result handoff: brand intro 1.8s; country 3.7s, city 4s, league 3.5s, stadium 4.1s, clubs 4.7s; closing brand 1.5s. Photo preparation runs during the intro. Distinct 1.3–1.5s entrances animate whole cards: country zoom, city horizontal slide, league perspective turn, stadium upward wipe and clubs angled rise. These motions affect whole cards; photographs, league emblems and club crests do not animate independently. The league chapter uses a light, open layout with the emblem on the journal paper background. Reduced motion still opens saved details directly. Network navigation, hidden tabs and expanded photo credits can extend elapsed wall-clock time.
