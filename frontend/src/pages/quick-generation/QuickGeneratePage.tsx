import { QuickGenerateScreen } from "@/components/interfaces/QuickGeneration/QuickGenerateScreen";
import { AppHeader } from "@/components/layouts/AppHeader";

export function QuickGeneratePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <QuickGenerateScreen />
    </div>
  );
}
