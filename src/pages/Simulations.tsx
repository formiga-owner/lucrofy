import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProducts } from '@/hooks/useProducts';
import { 
  getSimulationResults, 
  formatCurrency, 
  formatPercentage, 
  calculateTotalCost,
  calculateBreakEven,
  calculateRequiredRevenue,
  calculateRealMargin
} from '@/lib/calculations';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Package, 
  BarChart3, 
  Sparkles,
  Target,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const Simulations = () => {
  const { products } = useProducts();
  
  // Simulator state
  const [simProductId, setSimProductId] = useState<string>('');
  const [salePrice, setSalePrice] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(10);
  
  // Predictability state
  const [predProductId, setPredProductId] = useState<string>('');
  const [profitGoal, setProfitGoal] = useState<number>(5000);
  const [estimatedQuantity, setEstimatedQuantity] = useState<number>(50);

  // Simulator calculations
  const simProduct = products.find(p => p.id === simProductId);
  const simTotalCost = simProduct 
    ? calculateTotalCost({ purchasePrice: simProduct.purchasePrice, additionalCosts: simProduct.additionalCosts })
    : 50;

  useEffect(() => {
    if (simProduct) {
      setSalePrice(simProduct.salePrice || Math.round(simTotalCost * 1.5));
    }
  }, [simProduct, simTotalCost]);

  const simResults = getSimulationResults(salePrice, simTotalCost, quantity);

  const chartData = [
    { name: 'Faturamento', value: simResults.totalRevenue, color: 'hsl(var(--chart-2))' },
    { name: 'Custo Total', value: simTotalCost * quantity, color: 'hsl(var(--chart-5))' },
    { name: 'Lucro', value: simResults.expectedProfit, color: 'hsl(var(--chart-1))' },
  ];

  const maxSalePrice = Math.max(simTotalCost * 3, 500);
  const maxQuantity = 100;

  // Predictability calculations
  const predProduct = products.find(p => p.id === predProductId);
  const predTotalCost = predProduct 
    ? calculateTotalCost({ purchasePrice: predProduct.purchasePrice, additionalCosts: predProduct.additionalCosts })
    : 0;
  const predSalePrice = predProduct?.salePrice || 0;
  const profitPerUnit = predSalePrice - predTotalCost;
  const realMargin = predSalePrice > 0 ? calculateRealMargin(predSalePrice, predTotalCost) : 0;

  const breakEven = profitGoal > 0 && profitPerUnit > 0 
    ? calculateBreakEven(profitGoal, predSalePrice, predTotalCost) 
    : 0;
  
  const requiredRevenue = profitGoal > 0 
    ? calculateRequiredRevenue(profitGoal, estimatedQuantity, predTotalCost) 
    : 0;

  const estimatedProfit = profitPerUnit * estimatedQuantity;
  const goalAchievable = estimatedProfit >= profitGoal;
  const isLowMargin = realMargin < 15;

  const EmptyState = ({ message, action }: { message: string; action: string }) => (
    <Card className="shadow-soft">
      <CardContent className="py-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{message}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Cadastre produtos para usar as simulações.
        </p>
        <Link to="/products/new">
          <Button className="gap-2">{action}</Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <Calculator className="w-8 h-8 text-primary" />
          Simulações
        </h1>
        <p className="text-muted-foreground mt-1">
          Teste cenários antes de decidir
        </p>
      </div>

      <Tabs defaultValue="simulator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="simulator" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Simulador
          </TabsTrigger>
          <TabsTrigger value="predictability" className="gap-2">
            <Target className="w-4 h-4" />
            Metas
          </TabsTrigger>
        </TabsList>

        {/* Simulator Tab */}
        <TabsContent value="simulator">
          {products.length === 0 ? (
            <EmptyState message="Nenhum produto cadastrado" action="Cadastrar Produto" />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Controls */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Parâmetros
                  </CardTitle>
                  <CardDescription>Ajuste os valores para simular cenários</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-3">
                    <Label>Produto</Label>
                    <Select value={simProductId} onValueChange={setSimProductId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - Custo: {formatCurrency(product.totalCost)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Preço de Venda</Label>
                      <span className="text-lg font-bold text-primary">{formatCurrency(salePrice)}</span>
                    </div>
                    <Slider
                      value={[salePrice]}
                      onValueChange={(values) => setSalePrice(values[0])}
                      min={simTotalCost}
                      max={maxSalePrice}
                      step={1}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(simTotalCost)}</span>
                      <span>{formatCurrency(maxSalePrice)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Quantidade Vendida</Label>
                      <span className="text-lg font-bold text-primary">{quantity} un.</span>
                    </div>
                    <Slider
                      value={[quantity]}
                      onValueChange={(values) => setQuantity(values[0])}
                      min={1}
                      max={maxQuantity}
                      step={1}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 un.</span>
                      <span>{maxQuantity} un.</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Custo unitário</span>
                      <span className="font-semibold">{formatCurrency(simTotalCost)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <div className="space-y-6">
                <div className="grid gap-4 grid-cols-2">
                  <Card className="shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-medium">Lucro Total</span>
                      </div>
                      <p className={`text-2xl font-bold ${simResults.expectedProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(simResults.expectedProfit)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium">Margem Real</span>
                      </div>
                      <p className={`text-2xl font-bold ${simResults.realMargin >= 20 ? 'text-success' : simResults.realMargin >= 10 ? 'text-warning' : 'text-destructive'}`}>
                        {formatPercentage(simResults.realMargin)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-xs font-medium">Faturamento</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(simResults.totalRevenue)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Package className="w-4 h-4" />
                        <span className="text-xs font-medium">Lucro/Unidade</span>
                      </div>
                      <p className={`text-2xl font-bold ${simResults.profitPerUnit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(simResults.profitPerUnit)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Visualização</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                          <YAxis type="category" dataKey="name" width={100} />
                          <Tooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Predictability Tab */}
        <TabsContent value="predictability">
          {products.length === 0 ? (
            <EmptyState message="Nenhum produto cadastrado" action="Cadastrar Produto" />
          ) : products.filter(p => p.salePrice).length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-warning/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-warning" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Produtos sem preço de venda</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Adicione o preço de venda aos seus produtos para calcular metas.
                </p>
                <Link to="/products">
                  <Button className="gap-2">Editar Produtos</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Configurar Meta
                  </CardTitle>
                  <CardDescription>Defina sua meta e quantidade estimada</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Produto</Label>
                    <Select value={predProductId} onValueChange={setPredProductId}>
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

                  {predProduct && (
                    <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Custo unitário</span>
                        <span className="font-medium">{formatCurrency(predTotalCost)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Preço de venda</span>
                        <span className="font-medium">{formatCurrency(predSalePrice)}</span>
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

              <div className="space-y-4">
                {predProduct ? (
                  <>
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
                          <p className="text-xs text-muted-foreground mt-1">Mínimo para atingir meta</p>
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
                          <p className="text-xs text-muted-foreground mt-1">Sobre preço de venda</p>
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
                          <p className="text-xs text-muted-foreground mt-1">Com {estimatedQuantity} vendas</p>
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
                          <p className="text-xs text-muted-foreground mt-1">Para atingir meta</p>
                        </CardContent>
                      </Card>
                    </div>

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
                            <span className="font-medium">{formatCurrency(breakEven * predSalePrice)}</span>
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
                        Escolha um produto para calcular metas de lucro.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Simulations;
