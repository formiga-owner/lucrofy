import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  'Sem letras miúdas',
  'Sem cartão de crédito',
  'Cancele quando quiser',
];

const OfferSection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Teste sem risco. Decida com dados.
        </h2>

        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Teste o LucroFy com todas as funcionalidades liberadas por 30 dias.
          <br />
          <strong className="text-foreground">É por nossa conta.</strong>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        <Link to="/register">
          <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-glow">
            QUERO Testar POR 30 DIAS
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default OfferSection;
