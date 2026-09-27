import type { SVGProps } from "react";

export type VelvetIconName = "home"|"people"|"plus"|"search"|"calendar"|"sparkle"|"history"|"check"|"heart"|"hourglass"|"plan"|"settings";

const paths: Record<VelvetIconName, React.ReactNode> = {
  home:<><path d="M3.5 10.5 12 3.8l8.5 6.7"/><path d="M5.5 9.5v10h13v-10"/><path d="M9.5 19.5v-6h5v6"/></>,
  people:<><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9.5" r="2.4"/><path d="M3.8 20c.5-4.1 2.5-6.2 5.2-6.2s4.7 2.1 5.2 6.2"/><path d="M14.7 14.5c3.2-.5 5.1 1.4 5.5 4.5"/></>,
  plus:<><path d="M12 5v14"/><path d="M5 12h14"/></>,
  search:<><circle cx="10.5" cy="10.5" r="5.8"/><path d="m15 15 5 5"/></>,
  calendar:<><rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17"/><circle cx="9" cy="14" r=".8" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r=".8" fill="currentColor" stroke="none"/><circle cx="9" cy="17.5" r=".8" fill="currentColor" stroke="none"/><circle cx="15" cy="17.5" r=".8" fill="currentColor" stroke="none"/></>,
  sparkle:<><path d="M12 3.5c.8 4.7 3.1 7 7.5 8.5-4.4 1.5-6.7 3.8-7.5 8.5-.8-4.7-3.1-7-7.5-8.5C8.9 10.5 11.2 8.2 12 3.5Z"/><path d="M19 3v4M17 5h4"/></>,
  history:<><path d="M4 8V3.8M4 3.8h4.2"/><path d="M4.7 5.2A8.5 8.5 0 1 1 3.6 14"/><path d="M12 7.5V12l3.2 2"/></>,
  check:<path d="m5 12.5 4.2 4.2L19 7"/>,
  heart:<path d="M12 20S4 15.5 4 9.3C4 6.5 6 5 8.2 5c1.6 0 3 1 3.8 2.2C12.8 6 14.2 5 15.8 5 18 5 20 6.5 20 9.3 20 15.5 12 20 12 20Z"/>,
  hourglass:<><path d="M7 3.5h10M7 20.5h10"/><path d="M8 4c0 4 1.6 5.5 4 8-2.4 2.5-4 4-4 8M16 4c0 4-1.6 5.5-4 8 2.4 2.5 4 4 4 8"/></>,
  plan:<><path d="M7 4.5h10l-1 15H8l-1-15Z"/><path d="M9.5 4.5V3h5v1.5M9.5 9h5M9.5 13h5"/></>,
  settings:<><circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.1M12 19.1v2.1M2.8 12h2.1M19.1 12h2.1M5.5 5.5 7 7M17 17l1.5 1.5M18.5 5.5 17 7M7 17l-1.5 1.5"/></>,
};

export function VelvetIcon({name,...props}:{name:VelvetIconName}&SVGProps<SVGSVGElement>){
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
