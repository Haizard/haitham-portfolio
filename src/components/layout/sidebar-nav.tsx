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
  UserCircle, // Added UserCircle for Profile
  Settings,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "User Profile", icon: UserCircle }, // Added Profile Link
  { href: "/content-studio", label: "Content Studio", icon: Sparkles },
  { href: "/content-calendar", label: "Content Calendar", icon: CalendarDays },
  { href: "/social-media", label: "Social Media", icon: MessagesSquare },
  { href: "/social-post-generator", label: "Post Generator", icon: Share2 },
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/client-portal", label: "Client Portal", icon: ShieldCheck },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false); // Close mobile sidebar on link click
  };

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              variant={pathname === item.href ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === item.href && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                pathname !== item.href && "hover:bg-muted"
              )}
              isActive={pathname === item.href}
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
      ))}
    </SidebarMenu>
  );
}
