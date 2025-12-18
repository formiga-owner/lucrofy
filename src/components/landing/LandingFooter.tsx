import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingFooter = () => {
  return (
    <footer className="py-12 px-4 bg-card border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LucroFy</span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link to="/termos" className="text-muted-foreground hover:text-foreground transition-colors">
              Termos
            </Link>
            <Link to="/privacidade" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacidade
            </Link>
            <Link to="/contato" className="text-muted-foreground hover:text-foreground transition-colors">
              Contato
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            LucroFy — previsibilidade e controle para pequenos negócios.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © {new Date().getFullYear()} LucroFy. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
