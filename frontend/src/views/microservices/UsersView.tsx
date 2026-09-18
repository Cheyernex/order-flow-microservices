import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from 'src/context/AuthContext';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Badge } from 'src/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog';

const UsersView = () => {
  const { users, currentUser, addUser, deleteUser } = useAuth();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR' | 'DEVELOPER'>('OPERATOR');
  const [error, setError] = useState<string | null>(null);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim() || !email.trim() || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    const res = addUser({
      username: username.trim(),
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    });

    if (!res.success) {
      setError(res.error || 'Error al registrar usuario.');
      return;
    }

    // Reset & Close
    setUsername('');
    setName('');
    setEmail('');
    setPassword('');
    setRole('OPERATOR');
    setError(null);
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'ADMIN':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'OPERATOR':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'DEVELOPER':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground">Administra cuentas, roles y accesos al sistema OrderFlow</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input
            placeholder="Buscar por usuario, nombre, rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 text-xs"
          />
          <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary/25 text-xs">
            <Icon icon="solar:user-plus-bold" className="mr-1.5" /> + Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground font-semibold">
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">Fecha de Registro</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No se encontraron usuarios coincidentes.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = currentUser?.username === u.username;
                  return (
                    <tr key={u.username} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                          <span>@{u.username}</span>
                          {isSelf && (
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                              Tú
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">{u.name}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={getRoleBadge(u.role)}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Original'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isSelf ? (
                          <span className="text-[11px] text-muted-foreground italic">Sesión activa</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => deleteUser(u.username)}
                          >
                            <Icon icon="solar:trash-bin-trash-bold" width={14} className="mr-1" /> Eliminar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Usuario */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Icon icon="solar:user-plus-bold-duotone" className="text-primary" /> Registrar Nuevo Usuario
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
              <Icon icon="solar:danger-triangle-bold" width={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Nombre Completo</label>
              <Input
                placeholder="Ej. Cheyernex Manzanillo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Usuario (Username)</label>
                <Input
                  placeholder="cmanzanillo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Rol</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="OPERATOR">OPERATOR</option>
                  <option value="DEVELOPER">DEVELOPER</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Correo Electrónico</label>
              <Input
                type="email"
                placeholder="usuario@dominicana.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="shadow-lg shadow-primary/25">
                Crear Usuario
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersView;
