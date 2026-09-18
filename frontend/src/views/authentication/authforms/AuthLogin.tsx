import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/AuthContext';
import { Icon } from '@iconify/react';

const AuthLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    setError(null);

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Credenciales inválidas.');
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
          <Icon icon="solar:danger-triangle-bold" width={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Quick demo credentials chips */}
      <div className="mb-4 p-3 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground block">⚡ Acceso Rápido Demo:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('admin', 'admin')}
            className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-medium transition-colors"
          >
            👤 Admin (admin / admin)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('operator', 'operator')}
            className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-[11px] font-medium transition-colors"
          >
            📦 Operador (operator / operator)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="mb-1 block">
            <Label htmlFor="username" className="text-xs font-medium">Usuario / Username</Label>
          </div>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            required
          />
        </div>

        <div>
          <div className="mb-1 block">
            <Label htmlFor="userpwd" className="text-xs font-medium">Contraseña</Label>
          </div>
          <Input
            id="userpwd"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" className="w-full shadow-lg shadow-primary/25" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>
    </div>
  );
};

export default AuthLogin;
