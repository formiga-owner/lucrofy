import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency, formatPercentage } from '@/lib/calculations';
import { 
  TrendingUp, 
  Package, 
  PiggyBank, 
  Plus, 
  Calculator, 
  Target,
  ArrowRight,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const { products, stats, isLoading } = useProducts();

  const quickActions = [
    {
      title: 'Cadastrar Produto',
      description: 'Adicione um novo produto com custos e margens',
      icon: Plus,
      to: '/products/new',
      variant: 'default' as const,
    },
    {
      title: 'Simular Lucro',
      description: 'Teste diferentes cenários de venda',
      icon: Calculator,
      to: '/simulator',
      variant: 'outline' as const,
    },
    {
      title: 'Previsibilidade',
      description: 'Calcule metas e break-even',
      icon: Target,
      to: '/predictability',
      variant: 'outline' as const,
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Margem Média"
            value={stats.averageMargin > 0 ? formatPercentage(stats.averageMargin) : '--'}
            icon={<TrendingUp className="w-6 h-6" />}
            description={stats.averageMargin >= 20 ? 'Ótima margem!' : stats.averageMargin > 0 ? 'Margem pode melhorar' : 'Cadastre produtos'}
            trend={stats.averageMargin >= 20 ? 'up' : stats.averageMargin > 0 ? 'neutral' : 'neutral'}
          />
          <StatCard
            title="Produtos Cadastrados"
            value={stats.totalProducts}
            icon={<Package className="w-6 h-6" />}
            description={stats.totalProducts > 0 ? `${stats.totalProducts} produto${stats.totalProducts > 1 ? 's' : ''} ativo${stats.totalProducts > 1 ? 's' : ''}` : 'Nenhum produto ainda'}
          />
          <StatCard
            title="Previsão de Lucro"
            value={stats.estimatedMonthlyProfit > 0 ? formatCurrency(stats.estimatedMonthlyProfit) : '--'}
            icon={<PiggyBank className="w-6 h-6" />}
            description="Estimativa mensal"
            trend={stats.estimatedMonthlyProfit > 0 ? 'up' : 'neutral'}
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map(({ title, description, icon: Icon, to, variant }) => (
            <Link key={to} to={to}>
              <Card className="h-full cursor-pointer hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 flex flex-col items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <Button variant={variant} size="sm" className="mt-auto gap-2">
                    Acessar
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Products */}
        {products.length > 0 && (
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Produtos Recentes
                </CardTitle>
                <CardDescription>Seus últimos produtos cadastrados</CardDescription>
              </div>
              <Link to="/products">
                <Button variant="ghost" size="sm" className="gap-2">
                  Ver todos
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Custo: {formatCurrency(product.totalCost)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {product.realMargin !== undefined && (
                        <p className={`font-semibold ${product.realMargin >= 20 ? 'text-success' : product.realMargin >= 10 ? 'text-warning' : 'text-destructive'}`}>
                          {formatPercentage(product.realMargin)}
                        </p>
                      )}
                      {product.salePrice && (
                        <p className="text-sm text-muted-foreground">
                          Venda: {formatCurrency(product.salePrice)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {products.length === 0 && !isLoading && (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Comece cadastrando seu primeiro produto para visualizar métricas e simular lucros.
              </p>
              <Link to="/products/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Cadastrar Primeiro Produto
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
