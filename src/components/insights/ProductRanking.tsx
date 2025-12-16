import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductInsight } from '@/lib/insights';
import { formatCurrency, formatPercentage } from '@/lib/calculations';
import { Trophy } from 'lucide-react';

interface ProductRankingProps {
  insights: ProductInsight[];
}

const StatusBadge = ({ status }: { status: ProductInsight['status'] }) => {
  const config = {
    good: { emoji: '🟢', label: 'Bom' },
    warning: { emoji: '🟡', label: 'Atenção' },
    danger: { emoji: '🔴', label: 'Risco' },
  };

  const { emoji, label } = config[status];

  return (
    <span className="flex items-center gap-1.5" title={label}>
      <span>{emoji}</span>
      <span className="text-xs text-muted-foreground hidden sm:inline">{label}</span>
    </span>
  );
};

export const ProductRanking = ({ insights }: ProductRankingProps) => {
  // Sort by total profit descending
  const sortedInsights = [...insights].sort((a, b) => b.totalProfit - a.totalProfit);

  if (sortedInsights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Ranking de Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum produto com vendas no período selecionado.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" />
          Ranking de Produtos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Qtd. Vendida</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Receita</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Margem</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInsights.map((insight, index) => (
                <TableRow key={insight.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{insight.name}</TableCell>
                  <TableCell className="text-right">{insight.quantitySold}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    {formatCurrency(insight.totalRevenue)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      insight.totalProfit >= 0 ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {formatCurrency(insight.totalProfit)}
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    {formatPercentage(insight.margin)}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={insight.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
