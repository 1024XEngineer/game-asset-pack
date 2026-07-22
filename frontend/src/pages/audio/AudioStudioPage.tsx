import { AudioStudioScreen } from "@/components/interfaces/AudioStudio/AudioStudioScreen";
import { AppHeader } from "@/components/layouts/AppHeader";

export function AudioStudioPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AudioStudioScreen />
    </div>
  );
}
