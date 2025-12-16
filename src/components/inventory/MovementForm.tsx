import { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MovementType, MovementReason, ProductStock, getTodayDate } from '@/lib/inventory';
import { Product } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface MovementFormProps {
  products: Product[];
  stocks: Map<string, ProductStock>;
  onSave: (movement: {
    productId: string;
    type: MovementType;
    quantity: number;
    reason: MovementReason;
    observation?: string;
    date: string;
  }) => void;
  onCancel: () => void;
  initialProductId?: string;
  initialType?: MovementType;
}

export const MovementForm = ({
  products,
  stocks,
  onSave,
  onCancel,
  initialProductId,
  initialType = 'entrada',
}: MovementFormProps) => {
  const { toast } = useToast();
  const [type, setType] = useState<MovementType>(initialType);
  const [productId, setProductId] = useState(initialProductId || '');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<MovementReason>(initialType === 'entrada' ? 'compra' : 'venda');
  const [observation, setObservation] = useState('');
  const [date, setDate] = useState(getTodayDate());

  useEffect(() => {
    setReason(type === 'entrada' ? 'compra' : 'venda');
  }, [type]);

  const getStock = (productId: string): ProductStock => {
    return stocks.get(productId) || { productId, currentStock: 0, minimumStock: 5 };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) {
      toast({ title: 'Selecione um produto', variant: 'destructive' });
      return;
    }

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      toast({ title: 'Quantidade inválida', variant: 'destructive' });
      return;
    }

    const stock = getStock(productId);
    if (type === 'saida' && qty > stock.currentStock) {
      toast({
        title: 'Estoque insuficiente',
        description: `Estoque atual: ${stock.currentStock} unidades`,
        variant: 'destructive',
      });
      return;
    }

    onSave({
      productId,
      type,
      quantity: qty,
      reason,
      observation: observation.trim() || undefined,
      date,
    });
  };

  const entryReasons: { value: MovementReason; label: string }[] = [
    { value: 'compra', label: 'Compra' },
    { value: 'ajuste', label: 'Ajuste de estoque' },
  ];

  const exitReasons: { value: MovementReason; label: string }[] = [
    { value: 'venda', label: 'Venda' },
    { value: 'perda', label: 'Perda' },
    { value: 'ajuste', label: 'Ajuste de estoque' },
  ];

  const reasons = type === 'entrada' ? entryReasons : exitReasons;
  const selectedProduct = products.find(p => p.id === productId);
  const currentStock = selectedProduct ? getStock(selectedProduct.id).currentStock : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'entrada' ? (
            <ArrowDownCircle className="w-5 h-5 text-success" />
          ) : (
            <ArrowUpCircle className="w-5 h-5 text-destructive" />
          )}
          Registrar {type === 'entrada' ? 'Entrada' : 'Saída'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === 'entrada' ? 'default' : 'outline'}
              className={type === 'entrada' ? 'bg-success hover:bg-success/90' : ''}
              onClick={() => setType('entrada')}
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Entrada
            </Button>
            <Button
              type="button"
              variant={type === 'saida' ? 'default' : 'outline'}
              className={type === 'saida' ? 'bg-destructive hover:bg-destructive/90' : ''}
              onClick={() => setType('saida')}
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Saída
            </Button>
          </div>

          {/* Product */}
          <div className="space-y-2">
            <Label htmlFor="product">Produto</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct && type === 'saida' && (
              <p className="text-xs text-muted-foreground">
                Estoque disponível: {currentStock} unidades
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={type === 'saida' ? currentStock : undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={getTodayDate()}
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as MovementReason)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observation */}
          <div className="space-y-2">
            <Label htmlFor="observation">Observação (opcional)</Label>
            <Textarea
              id="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Adicione uma observação..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
