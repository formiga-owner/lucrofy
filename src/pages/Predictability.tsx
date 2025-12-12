import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { 
  calculateBreakEven, 
  calculateRequiredRevenue, 
  calculateRealMargin,
  calculateTotalCost,
  formatCurrency, 
  formatPercentage 
} from '@/lib/calculations';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Package,
  Calculator,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Predictability = () => {
  const { products } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [profitGoal, setProfitGoal] = useState<number>(5000);
  const [estimatedQuantity, setEstimatedQuantity] = useState<number>(50);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  const totalCost = selectedProduct 
    ? calculateTotalCost({ purchasePrice: selectedProduct.purchasePrice, additionalCosts: selectedProduct.additionalCosts })
    : 0;
  
  const salePrice = selectedProduct?.salePrice || 0;
  const profitPerUnit = salePrice - totalCost;
  const realMargin = salePrice > 0 ? calculateRealMargin(salePrice, totalCost) : 0;

  const breakEven = profitGoal > 0 && profitPerUnit > 0 
    ? calculateBreakEven(profitGoal, salePrice, totalCost) 
    : 0;
  
  const requiredRevenue = profitGoal > 0 
    ? calculateRequiredRevenue(profitGoal, estimatedQuantity, totalCost) 
    : 0;

  const estimatedProfit = profitPerUnit * estimatedQuantity;
  const goalAchievable = estimatedProfit >= profitGoal;
  const isLowMargin = realMargin < 15;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Previsibilidade
          </h1>
          <p className="text-muted-foreground mt-1">
            Calcule metas e descubra o que precisa para atingi-las
          </p>
        </div>

        {products.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Cadastre produtos com preço de venda para usar a previsibilidade.
              </p>
              <Link to="/products/new">
                <Button className="gap-2">
                  Cadastrar Produto
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : products.filter(p => p.salePrice).length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-warning/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Produtos sem preço de venda</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Adicione o preço de venda aos seus produtos para calcular previsibilidade.
              </p>
              <Link to="/products">
                <Button className="gap-2">
                  Editar Produtos
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Inputs */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Configurar Meta
                </CardTitle>
                <CardDescription>Defina sua meta e quantidade estimada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Selector */}
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.filter(p => p.salePrice).map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - Venda: {formatCurrency(product.salePrice!)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Profit Goal */}
                <div className="space-y-2">
                  <Label htmlFor="profitGoal">Meta de Lucro Mensal</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                    <Input
                      id="profitGoal"
                      type="number"
                      min="0"
                      step="100"
                      className="pl-9"
                      value={profitGoal || ''}
                      onChange={(e) => setProfitGoal(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Estimated Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="estimatedQuantity">Quantidade Estimada de Vendas</Label>
                  <Input
                    id="estimatedQuantity"
                    type="number"
                    min="1"
                    value={estimatedQuantity || ''}
                    onChange={(e) => setEstimatedQuantity(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">Vendas previstas no mês</p>
                </div>

                {/* Product Info */}
                {selectedProduct && (
                  <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Custo unitário</span>
                      <span className="font-medium">{formatCurrency(totalCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Preço de venda</span>
                      <span className="font-medium">{formatCurrency(salePrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lucro por unidade</span>
                      <span className={`font-medium ${profitPerUnit > 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(profitPerUnit)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4">
              {selectedProduct ? (
                <>
                  {/* Alerts */}
                  {isLowMargin && (
                    <Alert variant="destructive" className="border-warning bg-warning/10">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <AlertTitle className="text-warning">Margem Baixa</AlertTitle>
                      <AlertDescription className="text-warning/80">
                        Sua margem atual é de {formatPercentage(realMargin)}. 
                        Considere aumentar o preço de venda ou reduzir custos.
                      </AlertDescription>
                    </Alert>
                  )}

                  {goalAchievable ? (
                    <Alert className="border-success bg-success/10">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <AlertTitle className="text-success">Meta Alcançável!</AlertTitle>
                      <AlertDescription className="text-success/80">
                        Com {estimatedQuantity} vendas você terá {formatCurrency(estimatedProfit)} de lucro.
                      </AlertDescription>
                    </Alert>
                  ) : profitGoal > 0 && estimatedQuantity > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Meta Não Alcançável</AlertTitle>
                      <AlertDescription>
                        Com {estimatedQuantity} vendas você terá apenas {formatCurrency(estimatedProfit)}. 
                        Você precisa vender {breakEven} unidades.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Results Cards */}
                  <div className="grid gap-4 grid-cols-2">
                    <Card className="shadow-soft">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Target className="w-4 h-4" />
                          <span className="text-xs font-medium">Break-even</span>
                        </div>
                        <p className="text-2xl font-bold text-primary">
                          {breakEven === Infinity ? '∞' : `${breakEven} un.`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Mínimo para atingir meta
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-soft">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs font-medium">Margem Real</span>
                        </div>
                        <p className={`text-2xl font-bold ${realMargin >= 20 ? 'text-success' : realMargin >= 10 ? 'text-warning' : 'text-destructive'}`}>
                          {formatPercentage(realMargin)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sobre preço de venda
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-soft">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-xs font-medium">Lucro Estimado</span>
                        </div>
                        <p className={`text-2xl font-bold ${estimatedProfit >= profitGoal ? 'text-success' : 'text-destructive'}`}>
                          {formatCurrency(estimatedProfit)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Com {estimatedQuantity} vendas
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-soft">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <BarChart3 className="w-4 h-4" />
                          <span className="text-xs font-medium">Faturamento Necessário</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(requiredRevenue)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Para atingir meta
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Summary Card */}
                  <Card className="shadow-soft bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Resumo da Previsibilidade
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Meta de lucro</span>
                          <span className="font-medium">{formatCurrency(profitGoal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vendas necessárias</span>
                          <span className="font-medium">{breakEven === Infinity ? 'Impossível (margem negativa)' : `${breakEven} unidades`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Faturamento necessário</span>
                          <span className="font-medium">{formatCurrency(breakEven * salePrice)}</span>
                        </div>
                        <hr className="border-border" />
                        <div className="flex justify-between text-base">
                          <span className="font-medium">Status</span>
                          <span className={`font-bold ${goalAchievable ? 'text-success' : 'text-destructive'}`}>
                            {goalAchievable ? '✓ Meta alcançável' : '✗ Precisa ajustar'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="shadow-soft">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Selecione um produto</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Escolha um produto para calcular a previsibilidade e metas de lucro.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Predictability;
