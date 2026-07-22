import { AppHeader } from "@/app/AppHeader";
import { QuickGenerateScreen } from "@/modules/generation/QuickGenerateScreen";

export function QuickGeneratePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <QuickGenerateScreen />
    </div>
  );
}
