import { GoldPriceCard } from '@/components/GoldPriceCard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <GoldPriceCard />
        
        {/* Decorative elements */}
        <div className="decorative-glow" />
      </div>
    </div>
  );
};

export default Index;
