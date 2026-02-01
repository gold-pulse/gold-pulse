-- Create enum for market types
CREATE TYPE public.market_type AS ENUM ('volatility', 'forex');

-- Create profiles table for user settings
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    deriv_app_id TEXT,
    deriv_token_hash TEXT,
    preferred_market market_type DEFAULT 'volatility',
    risk_per_trade NUMERIC DEFAULT 2.0,
    daily_loss_limit NUMERIC DEFAULT 10.0,
    bot_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trade history table
CREATE TABLE public.trade_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    symbol TEXT NOT NULL,
    market market_type NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('buy', 'sell')),
    entry_price NUMERIC NOT NULL,
    exit_price NUMERIC,
    amount NUMERIC NOT NULL,
    profit_loss NUMERIC,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
    opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    closed_at TIMESTAMP WITH TIME ZONE,
    is_bot_trade BOOLEAN DEFAULT false
);

-- Enable RLS on trade_history
ALTER TABLE public.trade_history ENABLE ROW LEVEL SECURITY;

-- Policies for trade_history
CREATE POLICY "Users can view their own trades" 
ON public.trade_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trades" 
ON public.trade_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" 
ON public.trade_history 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();