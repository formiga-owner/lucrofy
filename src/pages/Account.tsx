
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, CreditCard, Calendar, Shield, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Account = () => {
    const { user } = useAuth();

    // Mock subscription data since we don't have a real subscription table yet
    // In a real app, this would come from a database query
    const subscription = {
        plan: "Free",
        status: "active",
        nextBilling: null,
        price: "R$ 0,00",
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie suas informações pessoais e detalhes da assinatura.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Profile Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            <CardTitle>Perfil do Usuário</CardTitle>
                        </div>
                        <CardDescription>Suas informações pessoais de cadastro</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-lg">{user?.name}</p>
                                <p className="text-sm text-muted-foreground">Membro desde {new Date(user?.createdAt || Date.now()).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                    <span>Email</span>
                                </div>
                                <span className="font-medium">{user?.email}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Shield className="w-4 h-4" />
                                    <span>ID do Usuário</span>
                                </div>
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{user?.id}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Plan Section */}
                <Card className="border-primary/20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <CreditCard className="w-48 h-48" />
                    </div>

                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <CardTitle>Plano Atual</CardTitle>
                        </div>
                        <CardDescription>Detalhes da sua assinatura e faturamento</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-gradient-to-br from-secondary/50 to-background">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">Plano {subscription.plan}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                                            {subscription.status}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">{subscription.price}/mês</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <a href="/pricing">Mudar Plano</a>
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Status da conta</span>
                                <span className="font-medium text-green-500 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-current" />
                                    Ativa
                                </span>
                            </div>

                            {subscription.nextBilling && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Próxima cobrança
                                    </span>
                                    <span>{subscription.nextBilling}</span>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground leading-relaxed">
                            <p>
                                Os recursos do seu plano atual incluem acesso básico ao dashboard,
                                gerenciamento de produtos e estoque. Para desbloquear simulações avançadas
                                e insights de IA, considere fazer um upgrade.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Account;
