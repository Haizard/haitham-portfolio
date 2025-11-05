
// src/app/restaurants/layout.tsx
import { RestaurantsHeader } from "@/components/restaurants/restaurants-header";

export default function RestaurantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background">
      <RestaurantsHeader />
      <main>{children}</main>
    </div>
  );
}
