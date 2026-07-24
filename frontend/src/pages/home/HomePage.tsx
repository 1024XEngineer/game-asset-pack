import { HomeCapabilities } from "@/components/interfaces/Home/HomeCapabilities";
import { HomeClosingCta } from "@/components/interfaces/Home/HomeClosingCta";
import { HomeFooter } from "@/components/interfaces/Home/HomeFooter";
import { HomeHero } from "@/components/interfaces/Home/HomeHero";
import { HomeProjectStory } from "@/components/interfaces/Home/HomeProjectStory";
import { HomeWorkflow } from "@/components/interfaces/Home/HomeWorkflow";
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
