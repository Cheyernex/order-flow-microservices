import { Link } from 'react-router';
import CardBox from 'src/components/shared/CardBox';
import AuthRegister from '../authforms/AuthRegister';
import FullLogo from 'src/layouts/full/shared/logo/FullLogo';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <CardBox className="max-w-md w-full p-8 rounded-2xl border border-border/80 shadow-2xl bg-card">
        <div className="flex justify-center mb-6">
          <FullLogo />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Crear Nueva Cuenta</h2>
          <p className="text-xs text-muted-foreground mt-1">Regístrate para interactuar con los microservicios</p>
        </div>

        <AuthRegister />

        <div className="flex gap-1.5 text-xs text-muted-foreground mt-6 items-center justify-center">
          <span>¿Ya tienes una cuenta?</span>
          <Link to="/auth/login" className="text-primary font-bold hover:underline">
            Inicia sesión
          </Link>
        </div>
      </CardBox>
    </div>
  );
};

export default Register;
