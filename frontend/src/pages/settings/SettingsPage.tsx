import { AppHeader } from "@components/AppHeader";
import { SettingsScreen } from "@components/settings/SettingsScreen";

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <SettingsScreen />
    </div>
  );
}
