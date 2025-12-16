import { useState } from 'react';
import { History, ArrowDownCircle, ArrowUpCircle, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StockMovement, MovementType, MovementReason } from '@/lib/inventory';
import { Product } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface MovementHistoryProps {
  movements: StockMovement[];
  products: Product[];
}

const reasonLabels: Record<MovementReason, string> = {
  compra: 'Compra',
  venda: 'Venda',
  perda: 'Perda',
  ajuste: 'Ajuste',
};

export const MovementHistory = ({ movements, products }: MovementHistoryProps) => {
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Produto removido';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredMovements = movements
    .filter(m => filterProduct === 'all' || m.productId === filterProduct)
    .filter(m => filterType === 'all' || m.type === filterType)
    .filter(m => !filterStartDate || m.date >= filterStartDate)
    .filter(m => !filterEndDate || m.date <= filterEndDate)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Histórico de Movimentações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Produto
            </Label>
            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data inicial</Label>
            <Input
              type="date"
              className="h-9"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data final</Label>
            <Input
              type="date"
              className="h-9"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Movements List */}
        {filteredMovements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Nenhuma movimentação encontrada</p>
            <p className="text-sm mt-1">Ajuste os filtros ou registre novas movimentações</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredMovements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-3">
                  {movement.type === 'entrada' ? (
                    <div className="p-2 rounded-full bg-success/10">
                      <ArrowDownCircle className="w-4 h-4 text-success" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-full bg-destructive/10">
                      <ArrowUpCircle className="w-4 h-4 text-destructive" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{getProductName(movement.productId)}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {reasonLabels[movement.reason]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(movement.date)} às {formatTime(movement.createdAt)}
                      </span>
                    </div>
                    {movement.observation && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        "{movement.observation}"
                      </p>
                    )}
                  </div>
                </div>
                <div className={cn(
                  "font-bold text-lg",
                  movement.type === 'entrada' ? "text-success" : "text-destructive"
                )}>
                  {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredMovements.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {filteredMovements.length} movimentação(ões) encontrada(s)
          </p>
        )}
      </CardContent>
    </Card>
  );
};
