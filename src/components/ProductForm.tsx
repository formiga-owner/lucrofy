import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calculateTotalCost, calculateRealMargin, calculateIdealPrice, formatCurrency, formatPercentage } from '@/lib/calculations';
import { Package, Calculator, Sparkles } from 'lucide-react';

interface ProductFormData {
  name: string;
  purchasePrice: number;
  salePrice?: number;
  desiredMargin?: number;
  additionalCosts: number;
}

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ProductForm = ({ initialData, onSubmit, onCancel, isLoading }: ProductFormProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    purchasePrice: initialData?.purchasePrice || 0,
    salePrice: initialData?.salePrice,
    desiredMargin: initialData?.desiredMargin,
    additionalCosts: initialData?.additionalCosts || 0,
  });

  const totalCost = calculateTotalCost({
    purchasePrice: formData.purchasePrice,
    additionalCosts: formData.additionalCosts,
  });

  const realMargin = formData.salePrice ? calculateRealMargin(formData.salePrice, totalCost) : null;
  const idealPrice = formData.desiredMargin ? calculateIdealPrice(totalCost, formData.desiredMargin) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof ProductFormData, value: string) => {
    const numericFields = ['purchasePrice', 'salePrice', 'desiredMargin', 'additionalCosts'];
    setFormData(prev => ({
      ...prev,
      [field]: numericFields.includes(field) ? (value === '' ? undefined : parseFloat(value) || 0) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {initialData ? 'Editar Produto' : 'Novo Produto'}
          </CardTitle>
          <CardDescription>
            Preencha os dados do produto para calcular margens e preços ideais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              placeholder="Ex: Camiseta Premium"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          {/* Costs Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Preço de Compra (Custo) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="pl-9"
                  value={formData.purchasePrice || ''}
                  onChange={(e) => handleChange('purchasePrice', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalCosts">Custos Adicionais</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <Input
                  id="additionalCosts"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="pl-9"
                  value={formData.additionalCosts || ''}
                  onChange={(e) => handleChange('additionalCosts', e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">Frete, impostos, comissões, etc.</p>
            </div>
          </div>

          {/* Total Cost Display */}
          <div className="p-4 rounded-xl bg-secondary/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Custo Total</span>
              <span className="text-lg font-bold text-foreground">{formatCurrency(totalCost)}</span>
            </div>
          </div>

          {/* Price/Margin Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salePrice">Preço de Venda</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="pl-9"
                  value={formData.salePrice || ''}
                  onChange={(e) => handleChange('salePrice', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desiredMargin">Margem Desejada</Label>
              <div className="relative">
                <Input
                  id="desiredMargin"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="30"
                  className="pr-8"
                  value={formData.desiredMargin || ''}
                  onChange={(e) => handleChange('desiredMargin', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
          </div>

          {/* Real-time Calculations */}
          {(realMargin !== null || idealPrice !== null) && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3 animate-scale-in">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">Cálculos em Tempo Real</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {realMargin !== null && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card">
                    <span className="text-sm text-muted-foreground">Margem Real</span>
                    <span className={`font-bold ${realMargin >= 20 ? 'text-success' : realMargin >= 10 ? 'text-warning' : 'text-destructive'}`}>
                      {formatPercentage(realMargin)}
                    </span>
                  </div>
                )}
                {idealPrice !== null && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card">
                    <span className="text-sm text-muted-foreground">Preço Ideal</span>
                    <span className="font-bold text-primary">{formatCurrency(idealPrice)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isLoading || !formData.name || !formData.purchasePrice} className="flex-1 gap-2">
              <Calculator className="w-4 h-4" />
              {initialData ? 'Atualizar Produto' : 'Cadastrar Produto'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
