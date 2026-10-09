import HeroSection from "@/components/Home/HeroSection";
import CategoriesSection from "@/components/Home/CategoriesSection";
import PopularServices from "@/components/Home/PopularServices";
import HowItWorks from "@/components/Home/HowItWorks";
import WhyChooseFixItNow from "@/components/Home/WhyChooseFixItNow";
// import ReviewsSection from "@/components/Home/ReviewsSection";
import FinalCTA from "@/components/Home/FinalCTA";

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <CategoriesSection />
      <PopularServices />
      <HowItWorks />
      <WhyChooseFixItNow />
      {/* <ReviewsSection /> */}
      <FinalCTA />
    </div>
  );
};

export default HomePage;
