import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, AlertTriangle, FileSpreadsheet, Moon } from 'lucide-react';

const painPoints = [
  {
    icon: HelpCircle,
    title: 'Preço errado',
    description: 'Você define seus preços baseado na concorrência ou nos seus custos reais?',
  },
  {
    icon: AlertTriangle,
    title: 'Surpresa no fim do mês',
    description: 'Chega de ser pego de surpresa por taxas e impostos que você esqueceu de calcular.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Cansaço das planilhas',
    description: 'Abandone as planilhas de Excel confusas que ninguém da sua equipe consegue atualizar.',
  },
  {
    icon: Moon,
    title: 'Falta de sono',
    description: 'Tenha a segurança de saber se o seu próximo mês será no azul ou no vermelho antes mesmo dele começar.',
  },
];

const PainPointsSection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
          Isso parece com o seu dia a dia?
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Se você se identificou com algum desses problemas, o LucroFácil foi feito para você.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {painPoints.map((point, index) => (
            <Card key={index} className="border-border/50 shadow-soft hover:shadow-md transition-shadow bg-card">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{point.title}</h3>
                  <p className="text-muted-foreground">{point.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPointsSection;
