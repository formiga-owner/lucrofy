import { ArrowDownCircle, ArrowUpCircle, Calendar, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StockMovement, MovementReason } from '@/lib/inventory';
import { Product } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface DailySummaryProps {
  totalEntradas: number;
  totalSaidas: number;
  saldoDia: number;
  movimentacoes: StockMovement[];
  products: Product[];
}

const reasonLabels: Record<MovementReason, string> = {
  compra: 'Compra',
  venda: 'Venda',
  perda: 'Perda',
  ajuste: 'Ajuste',
};

export const DailySummary = ({
  totalEntradas,
  totalSaidas,
  saldoDia,
  movimentacoes,
  products,
}: DailySummaryProps) => {
  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Produto removido';
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Resumo de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
            <ArrowDownCircle className="w-5 h-5 mx-auto text-success mb-1" />
            <p className="text-2xl font-bold text-success">{totalEntradas}</p>
            <p className="text-xs text-muted-foreground">Entradas</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <ArrowUpCircle className="w-5 h-5 mx-auto text-destructive mb-1" />
            <p className="text-2xl font-bold text-destructive">{totalSaidas}</p>
            <p className="text-xs text-muted-foreground">Saídas</p>
          </div>
          <div className={cn(
            "text-center p-3 rounded-lg border",
            saldoDia >= 0 
              ? "bg-success/10 border-success/20" 
              : "bg-destructive/10 border-destructive/20"
          )}>
            <Package className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
            <p className={cn(
              "text-2xl font-bold",
              saldoDia >= 0 ? "text-success" : "text-destructive"
            )}>
              {saldoDia >= 0 ? '+' : ''}{saldoDia}
            </p>
            <p className="text-xs text-muted-foreground">Saldo</p>
          </div>
        </div>

        {/* Movements List */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Movimentações do dia</h4>
          {movimentacoes.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma movimentação registrada hoje</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {movimentacoes
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      {movement.type === 'entrada' ? (
                        <div className="p-1.5 rounded-full bg-success/10">
                          <ArrowDownCircle className="w-4 h-4 text-success" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-full bg-destructive/10">
                          <ArrowUpCircle className="w-4 h-4 text-destructive" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{getProductName(movement.productId)}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">
                            {reasonLabels[movement.reason]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(movement.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "font-semibold",
                      movement.type === 'entrada' ? "text-success" : "text-destructive"
                    )}>
                      {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
