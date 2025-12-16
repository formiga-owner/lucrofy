import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ProductInsight } from '@/lib/insights';
import { BarChart3 } from 'lucide-react';

interface InsightChartProps {
  insights: ProductInsight[];
}

const chartConfig: ChartConfig = {
  revenue: {
    label: 'Receita',
    color: 'hsl(var(--primary))',
  },
  profit: {
    label: 'Lucro',
    color: 'hsl(var(--success))',
  },
};

export const InsightChart = ({ insights }: InsightChartProps) => {
  // Take top 6 products by revenue for the chart
  const chartData = [...insights]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 6)
    .map((insight) => ({
      name: insight.name.length > 12 ? insight.name.slice(0, 12) + '...' : insight.name,
      fullName: insight.name,
      revenue: insight.totalRevenue,
      profit: insight.totalProfit,
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Receita x Lucro por Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Nenhum dado disponível para exibir o gráfico.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Receita x Lucro por Produto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(value) =>
                  new Intl.NumberFormat('pt-BR', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(value)
                }
                className="text-muted-foreground"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      const formattedValue = new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(value as number);
                      return [formattedValue, name === 'revenue' ? 'Receita' : 'Lucro'];
                    }}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="Receita"
              />
              <Bar
                dataKey="profit"
                fill="hsl(var(--success))"
                radius={[4, 4, 0, 0]}
                name="Lucro"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-sm text-muted-foreground">Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-success" />
            <span className="text-sm text-muted-foreground">Lucro</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
