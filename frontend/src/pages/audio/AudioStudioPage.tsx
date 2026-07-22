import { AppHeader } from "@components/AppHeader";
import { AudioStudioScreen } from "@components/audio/AudioStudioScreen";

export function AudioStudioPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AudioStudioScreen />
    </div>
  );
}
