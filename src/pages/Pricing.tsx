import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutDialog } from "@/components/checkout/CheckoutDialog";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  slug: string;
  name: string;
  priceInCents: number;
  priceDisplay: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const plans: Plan[] = [
  {
    slug: "essencial",
    name: "Essencial",
    priceInCents: 1200,
    priceDisplay: "R$ 12",
    description: "Para quem quer organizar os produtos e entender o lucro real.",
    features: [
      "Até 30 produtos",
      "Controle de estoque básico",
      "Simulador de lucro",
      "Dashboard financeiro",
    ],
  },
  {
    slug: "pro",
    name: "Pro",
    priceInCents: 2600,
    priceDisplay: "R$ 26",
    description: "Para quem quer tomar decisões com dados e aumentar a margem de lucro.",
    features: [
      "Produtos ilimitados",
      "Insights inteligentes",
      "Relatórios por período",
      "Alertas de margem e estoque",
      "Simulações avançadas",
    ],
    isPopular: true,
  },
];

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("payment_status");

    if (status === "success" || paymentStatus === "success") {
      toast({
        title: "Pagamento confirmado!",
        description: "Redirecionando para o dashboard...",
      });

      // Redirecionar após mostrar o toast
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);
    }
  }, [searchParams, navigate, toast]);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Planos simples, que cabem no seu bolso
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para ter previsibilidade de lucro e controle do seu negócio, sem planilhas e sem complicação.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.slug}
              className={
                plan.isPopular
                  ? "relative border-primary shadow-glow md:-mt-8 transform transition-transform duration-300 bg-card"
                  : "border-border/50 shadow-soft hover:shadow-lg transition-all duration-300"
              }
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-1 px-4 uppercase tracking-wide">
                    Mais escolhido
                  </Badge>
                </div>
              )}
              <CardHeader className="space-y-2">
                <CardTitle className={`text-2xl font-bold ${plan.isPopular ? "text-primary" : ""}`}>
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.priceDisplay}</span>
                  <span className="text-muted-foreground">/ mês</span>
                </div>
                <CardDescription className="text-base pt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      {plan.isPopular ? (
                        <div className="bg-primary/10 rounded-full p-1">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        </div>
                      ) : (
                        <Check className="h-5 w-5 text-primary shrink-0" />
                      )}
                      <span className={plan.isPopular ? "font-medium" : ""}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.isPopular ? "default" : "outline"}
                  className={`w-full text-lg h-12 ${plan.isPopular ? "shadow-md hover:shadow-lg transition-all" : ""}`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.isPopular ? `Quero o plano ${plan.name}` : `Começar com ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trust Signals */}
        <div className="text-center space-y-8 pt-8">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 text-muted-foreground">
            {["Teste grátis por 30 dias", "Sem cartão de crédito", "Cancele quando quiser"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        plan={selectedPlan}
      />
    </div>
  );
};

export default Pricing;
