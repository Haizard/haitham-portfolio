
import { PlatformSettingsManagement } from '@/components/admin/settings/platform-settings-management';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Settings className="mr-3 h-10 w-10 text-primary" />
          Platform Settings
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Manage global settings and configurations for the CreatorOS platform.
        </p>
      </header>
      <PlatformSettingsManagement />
    </div>
  );
}
