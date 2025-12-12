import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/useProducts';
import { getSimulationResults, formatCurrency, formatPercentage, calculateTotalCost } from '@/lib/calculations';
import { Calculator, TrendingUp, DollarSign, Package, BarChart3, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Simulator = () => {
  const { products } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [salePrice, setSalePrice] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(10);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  const totalCost = selectedProduct 
    ? calculateTotalCost({ purchasePrice: selectedProduct.purchasePrice, additionalCosts: selectedProduct.additionalCosts })
    : 50;

  useEffect(() => {
    if (selectedProduct) {
      setSalePrice(selectedProduct.salePrice || Math.round(totalCost * 1.5));
    }
  }, [selectedProduct, totalCost]);

  const results = getSimulationResults(salePrice, totalCost, quantity);

  const chartData = [
    { name: 'Faturamento', value: results.totalRevenue, color: 'hsl(var(--chart-2))' },
    { name: 'Custo Total', value: totalCost * quantity, color: 'hsl(var(--chart-5))' },
    { name: 'Lucro', value: results.expectedProfit, color: 'hsl(var(--chart-1))' },
  ];

  const maxSalePrice = Math.max(totalCost * 3, 500);
  const maxQuantity = 100;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calculator className="w-8 h-8 text-primary" />
            Simulador de Lucro
          </h1>
          <p className="text-muted-foreground mt-1">
            Ajuste os valores e veja os resultados em tempo real
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
                Cadastre produtos para usar o simulador com dados reais.
              </p>
              <Link to="/products/new">
                <Button className="gap-2">
                  Cadastrar Produto
                </Button>
              </Link>
            </CardContent>
          </Card>
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
                {/* Product Selector */}
                <div className="space-y-3">
                  <Label>Produto</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
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

                {/* Sale Price Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Preço de Venda</Label>
                    <span className="text-lg font-bold text-primary">{formatCurrency(salePrice)}</span>
                  </div>
                  <Slider
                    value={[salePrice]}
                    onValueChange={(values) => setSalePrice(values[0])}
                    min={totalCost}
                    max={maxSalePrice}
                    step={1}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(totalCost)}</span>
                    <span>{formatCurrency(maxSalePrice)}</span>
                  </div>
                </div>

                {/* Quantity Slider */}
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

                {/* Cost Info */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Custo unitário</span>
                    <span className="font-semibold">{formatCurrency(totalCost)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid gap-4 grid-cols-2">
                <Card className="shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-xs font-medium">Lucro Total</span>
                    </div>
                    <p className={`text-2xl font-bold ${results.expectedProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(results.expectedProfit)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">Margem Real</span>
                    </div>
                    <p className={`text-2xl font-bold ${results.realMargin >= 20 ? 'text-success' : results.realMargin >= 10 ? 'text-warning' : 'text-destructive'}`}>
                      {formatPercentage(results.realMargin)}
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
                      {formatCurrency(results.totalRevenue)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Package className="w-4 h-4" />
                      <span className="text-xs font-medium">Lucro/Unidade</span>
                    </div>
                    <p className={`text-2xl font-bold ${results.profitPerUnit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(results.profitPerUnit)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
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
      </div>
    </Layout>
  );
};

export default Simulator;
