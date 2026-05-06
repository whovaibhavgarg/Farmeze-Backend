import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import HowItWorks from "@/components/HowItWorks";
import QualityCheckForm from "@/components/QualityCheckForm";
import WhyFarmeze from "@/components/WhyFarmeze";
import Footer from "@/components/Footer";
import LiveMarketplaceSection from "@/components/LiveMarketplaceSection";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <FeatureCards />
    <HowItWorks />
    <QualityCheckForm />
    <LiveMarketplaceSection />
    <WhyFarmeze />
    <Footer />
  </div>
);

export default Index;
