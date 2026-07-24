import { HomeCapabilities } from "@/features/Home/HomeCapabilities";
import { HomeClosingCta } from "@/features/Home/HomeClosingCta";
import { HomeFooter } from "@/features/Home/HomeFooter";
import { HomeHero } from "@/features/Home/HomeHero";
import { HomeProjectStory } from "@/features/Home/HomeProjectStory";
import { HomeWorkflow } from "@/features/Home/HomeWorkflow";
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
