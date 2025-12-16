import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InsightsSummary, PeriodFilter, generateInsightText } from '@/lib/insights';
import { formatCurrency, formatPercentage } from '@/lib/calculations';
import { TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react';

interface ExecutiveSummaryProps {
  summary: InsightsSummary;
  period: PeriodFilter;
}

export const ExecutiveSummary = ({ summary, period }: ExecutiveSummaryProps) => {
  const insightText = generateInsightText(summary, period);

  const cards = [
    {
      title: 'Produto Mais Lucrativo',
      value: summary.mostProfitableProduct?.name || '-',
      subtitle: summary.mostProfitableProduct
        ? formatCurrency(summary.mostProfitableProduct.totalProfit)
        : 'Nenhum dado',
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Produto Mais Vendido',
      value: summary.bestSellingProduct?.name || '-',
      subtitle: summary.bestSellingProduct
        ? `${summary.bestSellingProduct.quantitySold} unidades`
        : 'Nenhum dado',
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Menor Margem',
      value: summary.lowestMarginProduct?.name || '-',
      subtitle: summary.lowestMarginProduct
        ? formatPercentage(summary.lowestMarginProduct.margin)
        : 'Nenhum dado',
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Lucro Total do Período',
      value: formatCurrency(summary.totalProfit),
      subtitle: `Receita: ${formatCurrency(summary.totalRevenue)}`,
      icon: DollarSign,
      color: summary.totalProfit >= 0 ? 'text-success' : 'text-destructive',
      bgColor: summary.totalProfit >= 0 ? 'bg-success/10' : 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="shadow-soft hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate" title={card.value}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insight Text */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <p className="text-sm text-foreground leading-relaxed">
            💡 <span className="font-medium">Resumo:</span> {insightText}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
