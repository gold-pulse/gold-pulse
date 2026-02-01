import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, Bot, Shield, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-volt">
              <TrendingUp className="h-6 w-6 text-background" />
            </div>
            <span className="text-2xl font-bold">TradeBot</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-volt text-background hover:bg-volt/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
            Automated Trading
            <span className="block text-volt">Made Simple</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Harness the power of algorithmic trading with real-time market analysis,
            technical indicators, and automated trade execution on Deriv's volatility indices and forex markets.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2 bg-volt text-background hover:bg-volt/90">
                Start Trading <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="gap-2">
                View Live Charts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-card/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Platform Features</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-volt/10">
                <BarChart3 className="h-6 w-6 text-volt" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Live Charts</h3>
              <p className="text-muted-foreground">
                Real-time candlestick charts with multiple timeframes and technical indicators
                including SMA, EMA, RSI, and MACD.
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-volt/10">
                <Bot className="h-6 w-6 text-volt" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Trading Bot</h3>
              <p className="text-muted-foreground">
                Automated trading strategies that analyze market conditions and execute
                trades based on predefined rules and risk management.
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-volt/10">
                <Shield className="h-6 w-6 text-volt" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Secure Trading</h3>
              <p className="text-muted-foreground">
                OAuth-based Deriv integration ensures your credentials are never stored.
                Trade safely with stop-loss and daily loss limits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Markets */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Available Markets</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-card/50 p-6">
              <h3 className="mb-4 text-xl font-semibold text-volt">Volatility Indices</h3>
              <div className="flex flex-wrap gap-2">
                {['V10', 'V25', 'V50', 'V75', 'V100', 'V10 1s', 'V25 1s', 'V50 1s', 'V75 1s', 'V100 1s'].map((v) => (
                  <span key={v} className="rounded-full bg-muted px-3 py-1 text-sm">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 p-6">
              <h3 className="mb-4 text-xl font-semibold text-volt">Forex Pairs</h3>
              <div className="flex flex-wrap gap-2">
                {['XAU/USD', 'XAG/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF'].map((v) => (
                  <span key={v} className="rounded-full bg-muted px-3 py-1 text-sm">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Trading involves risk. Only trade with funds you can afford to lose.</p>
          <p className="mt-2">© 2025 TradeBot. Not affiliated with Deriv.</p>
        </div>
      </footer>

      {/* Decorative elements */}
      <div className="decorative-glow fixed left-1/4 top-1/4 -z-10" />
      <div className="decorative-glow fixed bottom-1/4 right-1/4 -z-10" />
    </div>
  );
};

export default Index;
