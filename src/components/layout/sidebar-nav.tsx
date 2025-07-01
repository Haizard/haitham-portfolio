
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  MessagesSquare,
  Share2,
  Briefcase,
  ShieldCheck,
  UserCircle, 
  Lightbulb, 
  Settings,
  FolderKanban,
  Tags,
  FileText,
  Layers,
  Package, 
  BarChartHorizontalBig, 
  PackageSearch,
  CalendarCheck2,
  MessageCircle,
  FilePlus2,
  Search,
  ClipboardList, 
  Store,
  UserPlus,
  ShoppingCart,
  Landmark,
  Users,
  Banknote,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "My Profile", icon: UserCircle }, 
  {
    group: "Client",
    items: [
       { href: "/post-job", label: "Post a Job", icon: FilePlus2 },
       { href: "/my-jobs", label: "Manage My Jobs", icon: ClipboardList },
       { href: "/client-portal", label: "Client Portal", icon: ShieldCheck },
    ]
  },
  {
    group: "Freelancer",
    items: [
      { href: "/find-work", label: "Find Work", icon: Search },
      { href: "/my-proposals", label: "My Proposals", icon: FileText },
      { href: "/my-projects", label: "My Projects", icon: Briefcase },
      { href: "/my-services", label: "Manage Services", icon: PackageSearch },
      { href: "/my-bookings", label: "Manage Bookings", icon: CalendarCheck2 },
    ]
  },
  {
    group: "Vendor Dashboard",
    items: [
        { href: "/vendor/products", label: "My Products", icon: Store },
        { href: "/vendor/orders", label: "Order Management", icon: ShoppingCart },
        { href: "/vendor/finances", label: "Finances", icon: Landmark },
        { href: "/become-a-vendor", label: "Become a Vendor", icon: UserPlus },
    ]
  },
  { 
    group: "Content",
    items: [
      { href: "/content-studio", label: "Content Studio", icon: Sparkles },
      { href: "/content-inspirer", label: "Content Inspirer", icon: Lightbulb },
      { href: "/content-calendar", label: "Content Calendar", icon: CalendarDays },
      { href: "/social-post-generator", label: "Post Generator", icon: Share2 },
    ]
  },
  { 
    group: "Platform",
    items: [
      { href: "/social-media", label: "Social Media", icon: MessagesSquare },
      { href: "/chat", label: "Chat", icon: MessageCircle },
      { href: "/affiliate-showcase", label: "Affiliate Showcase", icon: Layers },
      { href: "/ecommerce", label: "E-commerce Store", icon: Package }, 
    ]
  },
  { 
    group: "Admin",
    items: [
      { href: "/admin/ecommerce-dashboard", label: "E-commerce Stats", icon: BarChartHorizontalBig },
      { href: "/admin/orders", label: "Manage Orders", icon: ShoppingCart },
      { href: "/admin/payouts", label: "Manage Payouts", icon: Banknote },
      { href: "/admin/vendors", label: "Manage Vendors", icon: Users },
      { href: "/admin/posts", label: "Manage Posts", icon: FileText },
      { href: "/admin/products-management", label: "Manage Products", icon: PackageSearch },
      { href: "/admin/categories", label: "Manage Categories", icon: FolderKanban },
      { href: "/admin/tags", label: "Manage Tags", icon: Tags },
      { href: "/admin/client-projects", label: "Manage Client Projects", icon: Briefcase },
    ]
  }
];

export function SidebarNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false); 
  };
  
  const isActive = (href: string) => {
    if (href === '/dashboard') {
        return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <SidebarMenu>
      {navItems.map((item, index) => {
        if ('group' in item) {
          return (
            <SidebarMenuItem key={`group-${index}`} className="mt-2">
              <span className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">{item.group}</span>
              <SidebarMenu className="mt-1">
                {item.items.map(subItem => (
                  <SidebarMenuItem key={subItem.href}>
                    <Link href={subItem.href} passHref legacyBehavior>
                      <SidebarMenuButton
                        asChild
                        variant={isActive(subItem.href) ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          isActive(subItem.href) && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                          !isActive(subItem.href) && "hover:bg-muted"
                        )}
                        isActive={isActive(subItem.href)}
                        tooltip={subItem.label}
                        onClick={handleLinkClick}
                      >
                        <a>
                          <subItem.icon className="h-5 w-5 mr-3" />
                          <span>{subItem.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarMenuItem>
          );
        }
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                variant={isActive(item.href) ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive(item.href) && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                  !isActive(item.href) && "hover:bg-muted"
                )}
                isActive={isActive(item.href)}
                tooltip={item.label}
                onClick={handleLinkClick}
              >
                <a>
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
