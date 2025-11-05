// src/app/tours/layout.tsx
import { ToursHeader } from "@/components/tours/tours-header";

export default function ToursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background">
      <ToursHeader />
      <main>{children}</main>
    </div>
  );
}
