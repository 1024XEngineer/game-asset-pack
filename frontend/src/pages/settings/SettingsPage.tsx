import { AppHeader } from "@/app/AppHeader";
import { SettingsScreen } from "@/modules/settings/SettingsScreen";

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <SettingsScreen />
    </div>
  );
}
