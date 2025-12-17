import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Eu não entendo nada de finanças, vou conseguir usar?',
    answer: 'Sim! O LucroFácil foi desenhado para ser intuitivo, sem termos técnicos difíceis. É como ter um assistente financeiro que fala a sua língua.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Sim. Utilizamos criptografia para garantir que só você tenha acesso aos números do seu negócio. Seus dados nunca são compartilhados.',
  },
  {
    question: 'O que acontece após os 30 dias?',
    answer: 'Você escolhe se quer continuar com a gente. Se não, sua conta será pausada sem cobranças automáticas. Simples assim.',
  },
  {
    question: 'Posso usar no celular?',
    answer: 'Sim! O LucroFácil funciona perfeitamente em qualquer dispositivo - computador, tablet ou celular.',
  },
];

const FAQSection = () => {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
          Dúvidas frequentes
        </h2>
        <p className="text-muted-foreground text-center mb-12">
          Respostas rápidas para as perguntas mais comuns.
        </p>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`} 
              className="bg-card border border-border/50 rounded-xl px-6 shadow-soft"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
