import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProductInsight } from '@/lib/insights';
import { AlertTriangle, TrendingDown, CheckCircle } from 'lucide-react';

interface ProductAlertsProps {
  alerts: { product: ProductInsight; message: string }[];
}

export const ProductAlerts = ({ alerts }: ProductAlertsProps) => {
  if (alerts.length === 0) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <CheckCircle className="w-5 h-5" />
            Produtos em Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Todos os produtos estão com margens saudáveis. Continue assim! 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-warning">
          <AlertTriangle className="w-5 h-5" />
          Produtos com Alerta ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => (
          <Alert
            key={`${alert.product.id}-${index}`}
            variant={alert.product.totalProfit < 0 ? 'destructive' : 'default'}
            className={
              alert.product.totalProfit < 0
                ? 'border-destructive/50 bg-destructive/10'
                : 'border-warning/50 bg-warning/10'
            }
          >
            {alert.product.totalProfit < 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle className="font-semibold">{alert.product.name}</AlertTitle>
            <AlertDescription className="text-sm mt-1">
              {alert.message}
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};
