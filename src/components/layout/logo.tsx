
import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative h-10 w-10 group-hover:opacity-90 transition-opacity">
        <Image
          src="/logo.png"
          alt="Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <h1 className="text-xl font-semibold text-primary group-hover:text-primary/90 transition-colors font-headline hidden sm:block">
        CreatorOS
      </h1>
    </Link>
  );
}
