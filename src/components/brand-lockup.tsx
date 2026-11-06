export function BrandLockup({ caption }: Readonly<{ caption: string }>) {
  return <><div className="ticket-brandword" aria-hidden="true">matchbound<b>•</b></div><span className="ticket-dotmark" aria-hidden="true" /><p>{caption}</p></>;
}
