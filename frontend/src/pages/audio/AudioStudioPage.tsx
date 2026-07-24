import { AudioStudioScreen } from "@/features/AudioStudio";
import { AppHeader } from "@/components/layouts/AppHeader";

export function AudioStudioPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AudioStudioScreen />
    </div>
  );
}
