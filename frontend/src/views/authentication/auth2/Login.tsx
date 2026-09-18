import { Link } from 'react-router';
import CardBox from 'src/components/shared/CardBox';
import AuthLogin from '../authforms/AuthLogin';
import FullLogo from 'src/layouts/full/shared/logo/FullLogo';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <CardBox className="max-w-md w-full p-8 rounded-2xl border border-border/80 shadow-2xl bg-card">
        <div className="flex justify-center mb-6">
          <FullLogo />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Iniciar Sesión</h2>
          <p className="text-xs text-muted-foreground mt-1">Acceso a la plataforma OrderFlow Microservices</p>
        </div>

        <AuthLogin />

        <div className="flex gap-1.5 text-xs text-muted-foreground mt-6 items-center justify-center">
          <span>¿No tienes una cuenta?</span>
          <Link to="/auth/register" className="text-primary font-bold hover:underline">
            Crear cuenta
          </Link>
        </div>
      </CardBox>
    </div>
  );
};

export default Login;
