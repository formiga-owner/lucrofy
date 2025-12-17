import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard, Calculator, Package } from 'lucide-react';

const solutions = [
  {
    icon: LayoutDashboard,
    title: 'Visão Geral em Segundos',
    description: 'Um dashboard limpo que mostra sua margem média e previsão de lucro real.',
  },
  {
    icon: Calculator,
    title: 'Simulador de Lucro',
    description: '"E se eu aumentar o preço em 10%?" "E se meu fornecedor subir o custo?" Simule cenários antes de tomar decisões arriscadas.',
  },
  {
    icon: Package,
    title: 'Cadastro Simplificado',
    description: 'Organize seus produtos por custo e margem sem complicação.',
  },
];

const SolutionSection = () => {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
          Do caos ao controle em poucos minutos
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Funcionalidades simples e poderosas para você tomar decisões com confiança.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solutions.map((solution, index) => (
            <Card key={index} className="border-border/50 shadow-soft hover:shadow-glow transition-all bg-card text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <solution.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{solution.title}</h3>
                <p className="text-muted-foreground">{solution.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
