
import { Layers } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="bg-primary text-primary-foreground p-2 rounded-lg group-hover:bg-primary/90 transition-colors">
        <Layers className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-semibold text-primary group-hover:text-primary/90 transition-colors font-headline hidden sm:block">
        CreatorOS
      </h1>
    </Link>
  );
}
