import { AppHeader } from "@components/AppHeader";
import { QuickGenerateScreen } from "@components/generation/QuickGenerateScreen";

export function QuickGeneratePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <QuickGenerateScreen />
    </div>
  );
}
