"use client";

import { usePathname } from "next/navigation";

export function NavSpacer() {
  const pathname = usePathname();
  if (pathname === "/" || /^\/(en|de|fr|da|nl)\/?$/.test(pathname)) return null;
  return <div style={{ height: "56px" }} />;
}
