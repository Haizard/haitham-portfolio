"use client";

// This layout is now handled by the logic in the root layout.
// This component can be simplified or removed if the root layout handles everything.
// For now, we'll just pass children through. The AppLayout wrapper is applied in the root layout.
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}