import {
  HomeCapabilities,
  HomeClosingCta,
  HomeFooter,
  HomeHero,
  HomeProjectStory,
  HomeWorkflow,
} from "@/features/Home";
import { AppHeader } from "@/components/layouts/AppHeader";

export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main>
        <HomeHero />
        <HomeCapabilities />
        <HomeProjectStory />
        <HomeWorkflow />
        <HomeClosingCta />
      </main>
      <HomeFooter />
    </div>
  );
}
