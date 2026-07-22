import { AppHeader } from "@/app/AppHeader";
import { AudioStudioScreen } from "@/modules/editor/audio/AudioStudioScreen";

export function AudioStudioPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AudioStudioScreen />
    </div>
  );
}
