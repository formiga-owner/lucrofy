import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useProducts } from '@/hooks/useProducts';
import { PeriodFilter } from '@/components/insights/PeriodFilter';
import { ExecutiveSummary } from '@/components/insights/ExecutiveSummary';
import { ProductRanking } from '@/components/insights/ProductRanking';
import { ProductAlerts } from '@/components/insights/ProductAlerts';
import { InsightChart } from '@/components/insights/InsightChart';
import {
  PeriodFilter as PeriodFilterType,
  generateSimulatedSales,
  calculateProductInsights,
  calculateInsightsSummary,
  getProductAlerts,
  getPeriodLabel,
} from '@/lib/insights';
import { Lightbulb, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MARGIN_THRESHOLD = 15;

const Insights = () => {
  const { products, isLoading } = useProducts();
  const [period, setPeriod] = useState<PeriodFilterType>('30days');

  // Calculate all insights when period or products change
  const { insights, summary, alerts } = useMemo(() => {
    const productsWithSalePrice = products.filter((p) => p.salePrice);
    const sales = generateSimulatedSales(productsWithSalePrice, period);
    const productInsights = calculateProductInsights(productsWithSalePrice, sales, MARGIN_THRESHOLD);
    const insightsSummary = calculateInsightsSummary(productInsights);
    const productAlerts = getProductAlerts(productInsights, MARGIN_THRESHOLD);

    return {
      insights: productInsights,
      summary: insightsSummary,
      alerts: productAlerts,
    };
  }, [products, period]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Carregando insights...</div>
        </div>
      </Layout>
    );
  }

  const productsWithSalePrice = products.filter((p) => p.salePrice);

  // Empty state
  if (products.length === 0 || productsWithSalePrice.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">
                Insights de Produtos
              </h1>
              <p className="text-muted-foreground mt-1">
                Análise inteligente do desempenho dos seus produtos
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum produto com preço de venda</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Para gerar insights, cadastre produtos com preço de venda definido. Os insights serão
              gerados automaticamente com base nas simulações de vendas.
            </p>
            <Link to="/products">
              <Button className="gap-2">
                <Package className="w-4 h-4" />
                Cadastrar Produtos
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text flex items-center gap-2">
              <Lightbulb className="w-8 h-8 text-warning" />
              Insights de Produtos
            </h1>
            <p className="text-muted-foreground mt-1">
              Análise inteligente do desempenho dos seus produtos
            </p>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        {/* Executive Summary */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Resumo Executivo</h2>
          <ExecutiveSummary summary={summary} period={period} />
        </section>

        {/* Charts and Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <InsightChart insights={insights} />

          {/* Alerts */}
          <ProductAlerts alerts={alerts} />
        </div>

        {/* Product Ranking */}
        <section>
          <ProductRanking insights={insights} />
        </section>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>
            📊 Dados baseados em simulações para o período:{' '}
            <span className="font-medium">{getPeriodLabel(period)}</span>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Insights;
