import { Package, Plus, Minus, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductStock, getStockStatus } from '@/lib/inventory';
import { Product } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface StockOverviewProps {
  products: Product[];
  stocks: Map<string, ProductStock>;
  onRegisterEntry: (productId: string) => void;
  onRegisterExit: (productId: string) => void;
}

export const StockOverview = ({ products, stocks, onRegisterEntry, onRegisterExit }: StockOverviewProps) => {
  const getStock = (productId: string): ProductStock => {
    return stocks.get(productId) || { productId, currentStock: 0, minimumStock: 5 };
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const getStatusLabel = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'Saudável';
      case 'warning':
        return 'Atenção';
      case 'critical':
        return 'Crítico';
    }
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum produto cadastrado.</p>
          <p className="text-sm text-muted-foreground mt-1">Cadastre produtos para controlar o estoque.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Visão Geral do Estoque
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Produto</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Estoque Atual</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground hidden sm:table-cell">Mínimo</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = getStock(product.id);
                const status = getStockStatus(stock.currentStock, stock.minimumStock);
                
                return (
                  <tr key={product.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {status === 'critical' && (
                          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                        )}
                        <span className="font-medium truncate max-w-[150px] sm:max-w-none">{product.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={cn(
                        "font-semibold",
                        status === 'critical' && "text-destructive",
                        status === 'warning' && "text-warning"
                      )}>
                        {stock.currentStock}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2 hidden sm:table-cell text-muted-foreground">
                      {stock.minimumStock}
                    </td>
                    <td className="text-center py-3 px-2">
                      <Badge variant="outline" className={cn("text-xs", getStatusColor(status))}>
                        {getStatusLabel(status)}
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                          onClick={() => onRegisterEntry(product.id)}
                          title="Registrar entrada"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onRegisterExit(product.id)}
                          disabled={stock.currentStock === 0}
                          title="Registrar saída"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
