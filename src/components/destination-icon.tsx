import "./destination-icon.css";
/** Original Matchbound marks for destinations without usable photography. */
export function DestinationIcon({kind}:{kind:"country"|"city"|"stadium"}) {
 return <svg className="journal-destination-icon" data-destination-icon={kind} viewBox="0 0 160 112" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
  {kind==="country" ? <><circle cx="80" cy="56" r="42"/><ellipse cx="80" cy="56" rx="20" ry="42"/><path d="M38 56h84M46 32c20 12 48 12 68 0M46 80c20-12 48-12 68 0"/><circle cx="112" cy="25" r="6" fill="currentColor" stroke="none"/></> : kind==="city" ? <><path d="M20 94h120M27 94V52h30v42M65 94V30h31v64M105 94V44h27v50M80 30V16M74 16h12M35 63h3m9 0h3m-15 13h3m9 0h3M75 44h11M75 57h11M75 70h11M76 94V82h9v12M114 56h9m-9 13h9m-9 13h9"/></> : <><path d="M20 48 42 26h76l22 22v36l-22 15H42L20 84V48ZM20 48l22 12h76l22-12M42 60v39m76-39v39M42 26v18h76V26M55 44V26m17 18V26m17 18V26m17 18V26"/><path d="m52 71 13-7h30l13 7v13l-13 7H65l-13-7V71Zm28-7v27"/><ellipse cx="80" cy="77.5" rx="10" ry="6"/></>}
 </svg>;
}
