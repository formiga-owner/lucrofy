import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <CheckCircle className="w-4 h-4" />
          30 dias grátis para testar
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
          Pare de trabalhar de graça.{' '}
          <span className="gradient-text">Saiba exatamente quanto você lucra</span>{' '}
          em cada venda.
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          O LucroFácil é a ferramenta de inteligência financeira feita para pequenos empresários 
          que cansaram de planilhas complexas. Tenha previsibilidade total do seu negócio em minutos.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-glow">
              QUERO TESTAR GRÁTIS POR 30 DIAS
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Sem cartão de crédito • Cancele quando quiser
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
