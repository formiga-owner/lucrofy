import { Helmet } from 'react-helmet-async';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import PainPointsSection from '@/components/landing/PainPointsSection';
import SolutionSection from '@/components/landing/SolutionSection';
import OfferSection from '@/components/landing/OfferSection';
import FAQSection from '@/components/landing/FAQSection';
import LandingFooter from '@/components/landing/LandingFooter';

const Landing = () => {
  return (
    <>
      <Helmet>
        <title>LucroFy - Saiba Exatamente Quanto Você Lucra em Cada Venda</title>
        <meta
          name="description"
          content="O LucroFy é a ferramenta de inteligência financeira feita para pequenos empresários. Tenha previsibilidade total do seu negócio em minutos. Teste grátis por 30 dias."
        />
        <meta name="keywords" content="lucro, margem, preço de venda, pequeno negócio, controle financeiro, gestão" />
        <link rel="canonical" href="https://lucrofacil.com.br" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <LandingHeader />
        <main>
          <HeroSection />
          <PainPointsSection />
          <SolutionSection />
          <OfferSection />
          <FAQSection />
        </main>
        <LandingFooter />
      </div>
    </>
  );
};

export default Landing;
