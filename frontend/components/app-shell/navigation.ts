import {
  LayoutDashboard,
  FolderKanban,
  Map,
  Landmark,
  SearchCheck,
  Database,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Project Evidence", href: "/projects", icon: FolderKanban },
  { label: "GIS Map View", href: "/map", icon: Map },
  { label: "Agency Watch", href: "/agency-watch", icon: Landmark },
  { label: "Investigation", href: "/investigations", icon: SearchCheck },
  { label: "Data Ingestion", href: "/data-ingestion", icon: Database },
];

export function isNavItemActive(item: NavItem, pathname: string) {
  if (pathname === item.href) return true;
  return item.href !== "/" && pathname.startsWith(item.href + "/");
}

export function getPageTitle(pathname: string) {
  const item = NAV_ITEMS.find((entry) => isNavItemActive(entry, pathname));
  if (item) return item.label;

  const segment = pathname.split("/").filter(Boolean).pop();
  if (!segment) return "Dashboard";
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}