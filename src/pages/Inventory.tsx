import { useState, useEffect, useCallback } from 'react';
import { Package, Plus } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { getProductsByUser, Product } from '@/lib/storage';
import {
  ProductStock,
  StockMovement,
  MovementType,
  MovementReason,
  getProductStocks,
  getMovementsByUser,
  getDailySummary,
  getTodayDate,
  saveMovement,
  setProductStock,
} from '@/lib/inventory';
import { StockOverview } from '@/components/inventory/StockOverview';
import { MovementForm } from '@/components/inventory/MovementForm';
import { DailySummary } from '@/components/inventory/DailySummary';
import { MovementHistory } from '@/components/inventory/MovementHistory';
import { StockAlerts } from '@/components/inventory/StockAlerts';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Inventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Map<string, ProductStock>>(new Map());
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialProductId, setFormInitialProductId] = useState<string>();
  const [formInitialType, setFormInitialType] = useState<MovementType>('entrada');

  const loadData = useCallback(() => {
    if (!user) return;

    const userProducts = getProductsByUser(user.id);
    setProducts(userProducts);

    const allStocks = getProductStocks();
    const stocksMap = new Map<string, ProductStock>();
    
    // Initialize stocks for all products
    userProducts.forEach(product => {
      const existingStock = allStocks.find(s => s.productId === product.id);
      if (existingStock) {
        stocksMap.set(product.id, existingStock);
      } else {
        // Create default stock for new products
        const newStock = setProductStock(product.id, 0, 5);
        stocksMap.set(product.id, newStock);
      }
    });
    
    setStocks(stocksMap);
    setMovements(getMovementsByUser(user.id));
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegisterEntry = (productId: string) => {
    setFormInitialProductId(productId);
    setFormInitialType('entrada');
    setIsFormOpen(true);
  };

  const handleRegisterExit = (productId: string) => {
    setFormInitialProductId(productId);
    setFormInitialType('saida');
    setIsFormOpen(true);
  };

  const handleOpenForm = () => {
    setFormInitialProductId(undefined);
    setFormInitialType('entrada');
    setIsFormOpen(true);
  };

  const handleSaveMovement = (movement: {
    productId: string;
    type: MovementType;
    quantity: number;
    reason: MovementReason;
    observation?: string;
    date: string;
  }) => {
    if (!user) return;

    saveMovement({
      ...movement,
      userId: user.id,
    });

    toast({
      title: movement.type === 'entrada' ? 'Entrada registrada' : 'Saída registrada',
      description: `${movement.quantity} unidade(s) ${movement.type === 'entrada' ? 'adicionada(s)' : 'removida(s)'} com sucesso.`,
    });

    setIsFormOpen(false);
    loadData();
  };

  const todaySummary = user ? getDailySummary(user.id, getTodayDate()) : null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-primary">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              Controle de Estoque
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie entradas e saídas de produtos diariamente
            </p>
          </div>
          <Button onClick={handleOpenForm} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Movimentação
          </Button>
        </div>

        {/* Alerts */}
        <StockAlerts
          products={products}
          stocks={stocks}
          onRegisterEntry={handleRegisterEntry}
        />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <StockOverview
              products={products}
              stocks={stocks}
              onRegisterEntry={handleRegisterEntry}
              onRegisterExit={handleRegisterExit}
            />
          </TabsContent>

          <TabsContent value="today" className="space-y-4">
            {todaySummary && (
              <DailySummary
                totalEntradas={todaySummary.totalEntradas}
                totalSaidas={todaySummary.totalSaidas}
                saldoDia={todaySummary.saldoDia}
                movimentacoes={todaySummary.movimentacoes}
                products={products}
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <MovementHistory movements={movements} products={products} />
          </TabsContent>
        </Tabs>

        {/* Movement Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="sr-only">Registrar Movimentação</DialogTitle>
            </DialogHeader>
            <MovementForm
              products={products}
              stocks={stocks}
              onSave={handleSaveMovement}
              onCancel={() => setIsFormOpen(false)}
              initialProductId={formInitialProductId}
              initialType={formInitialType}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Inventory;
