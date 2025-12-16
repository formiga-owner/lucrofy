import { AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductStock, getStockStatus } from '@/lib/inventory';
import { Product } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface StockAlertsProps {
  products: Product[];
  stocks: Map<string, ProductStock>;
  onRegisterEntry: (productId: string) => void;
}

export const StockAlerts = ({ products, stocks, onRegisterEntry }: StockAlertsProps) => {
  const getStock = (productId: string): ProductStock => {
    return stocks.get(productId) || { productId, currentStock: 0, minimumStock: 5 };
  };

  const alertProducts = products.filter(product => {
    const stock = getStock(product.id);
    const status = getStockStatus(stock.currentStock, stock.minimumStock);
    return status === 'warning' || status === 'critical';
  });

  if (alertProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-warning/50 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-warning">
          <AlertTriangle className="w-5 h-5" />
          Alertas de Estoque
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertProducts.map(product => {
          const stock = getStock(product.id);
          const status = getStockStatus(stock.currentStock, stock.minimumStock);
          const isCritical = status === 'critical';

          return (
            <div
              key={product.id}
              className={cn(
                "p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
                isCritical 
                  ? "bg-destructive/10 border-destructive/30" 
                  : "bg-warning/10 border-warning/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-full flex-shrink-0",
                  isCritical ? "bg-destructive/20" : "bg-warning/20"
                )}>
                  {isCritical ? (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  ) : (
                    <Package className="w-4 h-4 text-warning" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{product.name}</p>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        isCritical 
                          ? "border-destructive/50 text-destructive" 
                          : "border-warning/50 text-warning"
                      )}
                    >
                      {stock.currentStock} un.
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isCritical
                      ? 'Estoque zerado ou crítico. Reposição urgente necessária.'
                      : `Estoque baixo para este produto. Avalie reposição. (Mínimo: ${stock.minimumStock})`
                    }
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={isCritical ? 'destructive' : 'outline'}
                className="flex-shrink-0"
                onClick={() => onRegisterEntry(product.id)}
              >
                Repor estoque
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
