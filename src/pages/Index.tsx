import { VolatilityCard } from '@/components/VolatilityCard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <VolatilityCard />
        
        {/* Decorative elements */}
        <div className="decorative-glow" />
      </div>
    </div>
  );
};

export default Index;
