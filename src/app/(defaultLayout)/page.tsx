import DashboardOverviewSection from "@/components/Home/DashboardOverviewSection";
import FeaturesSection from "@/components/Home/FeaturesSection";
import HeroSection from "@/components/Home/HeroSection";
import HowItWorksSection from "@/components/Home/HowItWorksSection";
import TrustedBySection from "@/components/Home/TrustedBySection";



const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <HowItWorksSection />
      <DashboardOverviewSection />
    </div>
  );
};

export default HomePage;
