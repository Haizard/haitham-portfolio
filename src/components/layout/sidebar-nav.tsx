
// src/components/layout/sidebar-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  Package, 
  BarChartHorizontalBig, 
  PackageSearch,
  CalendarCheck2,
  MessageCircle,
  FilePlus2,
  ClipboardList, 
  Store,
  ShoppingCart,
  Landmark,
  Users,
  Banknote,
  Leaf,
  Utensils,
  Truck,
  Map,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[]; // Roles that can see this item
};

type NavGroup = {
  group: string;
  roles: string[]; // Roles that can see this group
  items: Omit<NavItem, 'roles'>[];
};

// All available navigation items, structured by role/feature set
const navConfig: (NavItem | NavGroup)[] = [
  // Always visible items
  { href: "/dashboard", label: "Hub", icon: LayoutDashboard },
  { href: "/profile", label: "My Profile", icon: UserCircle },
  {
    group: "Freelancer Tools",
    roles: ['freelancer'],
    items: [
      { href: "/my-proposals", label: "My Proposals", icon: FileText },
      { href: "/my-projects", label: "My Projects", icon: Briefcase },
    ],
  },
  {
    group: "Client Tools",
    roles: ['client'],
    items: [
      { href: "/post-job", label: "Post a Job", icon: FilePlus2 },
      { href: "/my-jobs", label: "Manage My Jobs", icon: ClipboardList },
    ],
  },
  {
    group: "Services Marketplace",
    roles: ['freelancer'],
    items: [
      { href: "/my-services", label: "Manage My Services", icon: PackageSearch },
      { href: "/my-bookings", label: "Manage Bookings", icon: CalendarCheck2 },
      { href: "/client-portal", label: "Client Portal", icon: ShieldCheck },
    ],
  },
  {
    group: "E-commerce Marketplace",
    roles: ['vendor'],
    items: [
      { href: "/vendor/dashboard", label: "Vendor Dashboard", icon: Store },
      { href: "/vendor/products", label: "My Products", icon: Package },
      { href: "/vendor/posts", label: "My Blog Posts", icon: FileText },
      { href: "/vendor/orders", label: "Order Management", icon: ShoppingCart },
      { href: "/vendor/finances", label: "Finances", icon: Landmark },
    ],
  },
   {
    group: "Restaurant Platform",
    roles: ['vendor'], // Assuming restaurant owners have the 'vendor' role
    items: [
      { href: "/vendor/restaurant/dashboard", label: "Restaurant Dashboard", icon: Utensils },
      { href: "/vendor/restaurant/profile", label: "Restaurant Profile", icon: Settings },
      { href: "/vendor/restaurant/menu-items", label: "Manage Menu", icon: ClipboardList },
      // Add more restaurant-specific links here as they are built
    ],
  },
  {
    group: "Delivery Agent",
    roles: ['delivery_agent'],
    items: [
      { href: "/delivery/find-work", label: "Find Deliveries", icon: Map },
      { href: "/delivery/my-deliveries", label: "My Deliveries", icon: Truck },
    ]
  },
  {
    group: "AI Content Tools",
    roles: ['creator', 'admin', 'vendor'],
    items: [
      { href: "/content-studio", label: "Content Studio", icon: Sparkles },
      {
        href: "/content-inspirer",
        label: "Content Inspirer",
        icon: Lightbulb,
      },
      {
        href: "/content-calendar",
        label: "Content Calendar",
        icon: CalendarDays,
      },
      { href: "/social-post-generator", label: "Post Generator", icon: Share2 },
    ],
  },
  {
    group: "Platform Tools",
    roles: ['admin', 'vendor', 'freelancer', 'client'],
    items: [
      { href: "/social-media", label: "Social Media", icon: MessagesSquare },
      { href: "/chat", label: "Chat", icon: MessageCircle },
    ],
  },
  {
    group: "Admin",
    roles: ['admin'],
    items: [
      { href: "/admin/dashboard", label: "Platform Dashboard", icon: BarChartHorizontalBig },
      { href: "/admin/settings", label: "Platform Settings", icon: Settings },
      { href: "/admin/orders", label: "Manage Orders", icon: ShoppingCart },
      { href: "/admin/payouts", label: "Manage Payouts", icon: Banknote },
      { href: "/admin/vendors", label: "Manage Vendors", icon: Users },
      { href: "/admin/delivery-agents", label: "Manage Delivery Agents", icon: Truck },
      { href: "/admin/posts", label: "Manage Posts", icon: FileText },
      { href: "/admin/products-management", label: "Manage Products", icon: PackageSearch },
      { href: "/admin/categories", label: "Blog Categories", icon: FolderKanban },
      { href: "/admin/tags", label: "Blog Tags", icon: Tags },
      { href: "/admin/service-categories", label: "Service Categories", icon: FolderKanban },
      { href: "/admin/food-types", label: "Food Types", icon: Leaf },
      { href: "/admin/client-projects", label: "Manage Client Projects", icon: Briefcase },
    ],
  },
];


export function SidebarNav({ userRoles }: { userRoles: string[] }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false); 
  };
  
  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/profile') {
        return pathname === href;
    }
    // Updated to match specific prefixes more accurately
    const appPrefixes = ['/admin', '/vendor', '/delivery', '/content-studio', '/my-jobs', '/my-proposals', '/my-projects', '/my-services', '/post-job', '/client-portal', '/social-media', '/chat'];
    const matchingPrefix = appPrefixes.find(prefix => href.startsWith(prefix));
    if (matchingPrefix) {
        return pathname.startsWith(href);
    }
    return pathname === href; // Fallback for other routes
  };


  const hasAccess = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true; // Accessible to all if no roles are defined
    return requiredRoles.some(role => userRoles.includes(role));
  }

  return (
    <SidebarMenu>
      {navConfig.filter(item => hasAccess(item.roles)).map((item, index) => {
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
                          isActive(subItem.href) && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
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
                  isActive(item.href) && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
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
