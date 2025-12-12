import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProductForm } from '@/components/ProductForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts, ProductWithCalculations } from '@/hooks/useProducts';
import { formatCurrency, formatPercentage } from '@/lib/calculations';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Package, 
  Pencil, 
  Trash2, 
  ArrowLeft,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Products = () => {
  const navigate = useNavigate();
  const { products, addProduct, editProduct, removeProduct, isLoading } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithCalculations | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductWithCalculations | null>(null);

  const handleSubmit = (data: any) => {
    if (editingProduct) {
      const updated = editProduct(editingProduct.id, data);
      if (updated) {
        toast({
          title: "Produto atualizado!",
          description: `${data.name} foi atualizado com sucesso.`,
        });
        setEditingProduct(null);
      }
    } else {
      const newProduct = addProduct(data);
      if (newProduct) {
        toast({
          title: "Produto cadastrado!",
          description: `${data.name} foi adicionado com sucesso.`,
        });
        setShowForm(false);
      }
    }
  };

  const handleDelete = () => {
    if (deletingProduct) {
      removeProduct(deletingProduct.id);
      toast({
        title: "Produto removido",
        description: `${deletingProduct.name} foi removido.`,
      });
      setDeletingProduct(null);
    }
  };

  const handleEdit = (product: ProductWithCalculations) => {
    setEditingProduct(product);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // Show form for new or editing product
  if (showForm || editingProduct) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="ghost" onClick={handleCancel} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <ProductForm
            initialData={editingProduct || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Produtos</h1>
            <p className="text-muted-foreground mt-1">Gerencie seus produtos e custos</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Produto
          </Button>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="shadow-soft hover:shadow-glow transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription>
                          Custo total: {formatCurrency(product.totalCost)}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    {product.salePrice && (
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="text-xs">Preço Venda</span>
                        </div>
                        <p className="font-semibold">{formatCurrency(product.salePrice)}</p>
                      </div>
                    )}
                    {product.realMargin !== undefined && (
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-xs">Margem Real</span>
                        </div>
                        <p className={`font-semibold ${product.realMargin >= 20 ? 'text-success' : product.realMargin >= 10 ? 'text-warning' : 'text-destructive'}`}>
                          {formatPercentage(product.realMargin)}
                        </p>
                      </div>
                    )}
                    {product.idealPrice && (
                      <div className="p-3 rounded-lg bg-primary/5 col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Preço Ideal ({product.desiredMargin}% margem)</span>
                          <span className="font-semibold text-primary">{formatCurrency(product.idealPrice)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleEdit(product)}
                    >
                      <Pencil className="w-3 h-3" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingProduct(product)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Cadastre seus produtos para calcular margens e simular lucros.
              </p>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Cadastrar Primeiro Produto
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto "{deletingProduct?.name}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Products;
