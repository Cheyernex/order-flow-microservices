import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/AuthContext';
import { Icon } from '@iconify/react';

const AuthRegister = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR' | 'DEVELOPER'>('OPERATOR');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim() || !password) return;

    setLoading(true);
    setError(null);

    const res = await register({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
      role,
    });
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'No se pudo crear la cuenta.');
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
          <Icon icon="solar:danger-triangle-bold" width={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="reg-name" className="text-xs font-medium block mb-1">Nombre Completo</Label>
          <Input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Cheyernex Manzanillo"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="reg-user" className="text-xs font-medium block mb-1">Usuario</Label>
            <Input
              id="reg-user"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="cheyernex"
              required
            />
          </div>
          <div>
            <Label htmlFor="reg-role" className="text-xs font-medium block mb-1">Rol</Label>
            <select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full h-9 rounded-md border border-input bg-card text-foreground px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary [&>option]:bg-slate-900 [&>option]:text-slate-100"
            >
              <option value="ADMIN" className="bg-slate-900 text-slate-100 py-1.5">ADMIN</option>
              <option value="OPERATOR" className="bg-slate-900 text-slate-100 py-1.5">OPERATOR</option>
              <option value="DEVELOPER" className="bg-slate-900 text-slate-100 py-1.5">DEVELOPER</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="reg-email" className="text-xs font-medium block mb-1">Correo Electrónico</Label>
          <Input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cheyernex@gmail.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="reg-pass" className="text-xs font-medium block mb-1">Contraseña</Label>
          <Input
            id="reg-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" className="w-full shadow-lg shadow-primary/25 mt-2" disabled={loading}>
          {loading ? 'Registrando...' : 'Crear Cuenta y Entrar'}
        </Button>
      </form>
    </div>
  );
};

export default AuthRegister;
