import "./destination-icon.css";
/** Original field marks; labels remain in the reveal heading. */
export function DestinationIcon({kind}:{kind:"country"|"city"|"stadium"}) {
 return <svg className="journal-destination-icon" data-destination-icon={kind} viewBox="0 0 112 112" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
  <circle className="journal-destination-accent" cx="69" cy="46" r="36" stroke="none"/>
  {kind==="country" ? <path d="m16 30 25-10 27 10 25-10v64L68 94 41 84 16 94V30Zm25-10v64m27-54v64"/> : kind==="city" ? <path d="M23 96V24h52v72M15 96h82M75 48h15v48M36 38h3m20 0h3M36 53h3m20 0h3M36 68h3m20 0h3M42 96V82h15v14"/> : <path d="M18 95V31h76v64M18 31l17 17h42l17-17M35 48v47m42-47v47M18 95h76M35 65h42M35 81h42M49 48v47m14-47v47"/>}
 </svg>;
}
