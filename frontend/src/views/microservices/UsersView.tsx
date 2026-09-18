import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useAuth, User } from 'src/context/AuthContext';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Badge } from 'src/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog';

const UsersView = () => {
  const { users, currentUser, addUser, updateUser, deleteUser } = useAuth();
  const [search, setSearch] = useState('');
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createDept, setCreateDept] = useState('Tecnología / DevOps');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<'ADMIN' | 'OPERATOR' | 'DEVELOPER' | 'MANAGER'>('OPERATOR');
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editRole, setEditRole] = useState<'ADMIN' | 'OPERATOR' | 'DEVELOPER' | 'MANAGER'>('OPERATOR');
  const [editActive, setEditActive] = useState(true);
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditDept(user.department || '');
    setEditRole(user.role);
    setEditActive(user.active ?? true);
    setEditPassword('');
    setEditError(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUsername.trim() || !createName.trim() || !createEmail.trim() || !createPassword) {
      setCreateError('Por favor completa todos los campos.');
      return;
    }

    setIsSubmitting(true);
    const res = await addUser({
      username: createUsername.trim(),
      name: createName.trim(),
      email: createEmail.trim(),
      department: createDept.trim(),
      password: createPassword,
      role: createRole,
    });
    setIsSubmitting(false);

    if (!res.success) {
      setCreateError(res.error || 'Error al registrar usuario.');
      return;
    }

    // Reset & Close
    setCreateUsername('');
    setCreateName('');
    setCreateEmail('');
    setCreateDept('Tecnología / DevOps');
    setCreatePassword('');
    setCreateRole('OPERATOR');
    setCreateError(null);
    setIsCreateModalOpen(false);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim() || !editEmail.trim()) {
      setEditError('El nombre y correo son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    const res = await updateUser(editingUser.username, {
      name: editName.trim(),
      email: editEmail.trim(),
      department: editDept.trim(),
      role: editRole,
      active: editActive,
      password: editPassword.trim() ? editPassword.trim() : undefined,
    });
    setIsSubmitting(false);

    if (!res.success) {
      setEditError(res.error || 'Error al actualizar usuario.');
      return;
    }

    setEditingUser(null);
  };

  const handleDeleteUser = async (userToDel: string) => {
    if (confirm(`¿Estás seguro de eliminar al usuario @${userToDel}? Esta acción no se puede deshacer.`)) {
      await deleteUser(userToDel);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()))
  );

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'ADMIN':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'OPERATOR':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'DEVELOPER':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'MANAGER':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground">Administra cuentas, perfiles, roles y accesos al sistema OrderFlow</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Input
            placeholder="Buscar por usuario, nombre, rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-56 text-xs"
          />
          <Button
            variant="outline"
            asChild
            className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 text-xs shadow-sm"
          >
            <a href="http://localhost:8088/admin" target="_blank" rel="noreferrer">
              <Icon icon="solar:shield-keyhole-bold-duotone" className="mr-1.5" width={16} /> Keycloak IAM ↗
            </a>
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-lg shadow-primary/25 text-xs">
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
                <th className="py-3 px-4">Departamento</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
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
                      <td className="py-3.5 px-4 text-muted-foreground font-mono">{u.email}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{u.department || 'General'}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={getRoleBadge(u.role)}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${u.active !== false ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.active !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {u.active !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary hover:text-primary hover:bg-primary/10 h-7 px-2"
                            onClick={() => handleOpenEdit(u)}
                          >
                            <Icon icon="solar:pen-bold" width={14} className="mr-1" /> Editar
                          </Button>
                          {!isSelf && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 h-7 px-2"
                              onClick={() => handleDeleteUser(u.username)}
                            >
                              <Icon icon="solar:trash-bin-trash-bold" width={14} className="mr-1" /> Eliminar
                            </Button>
                          )}
                        </div>
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
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
              <Icon icon="solar:user-plus-bold-duotone" className="text-primary" width={22} /> Registrar Nuevo Usuario
            </DialogTitle>
          </DialogHeader>

          {createError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
              <Icon icon="solar:danger-triangle-bold" width={18} />
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Nombre Completo</label>
              <Input
                placeholder="Ej. Cheyernex Manzanillo"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Usuario (Username)</label>
                <Input
                  placeholder="cheyernex"
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Rol</label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-card text-foreground px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="ADMIN" className="bg-slate-900 text-slate-100 py-1.5">ADMIN</option>
                  <option value="OPERATOR" className="bg-slate-900 text-slate-100 py-1.5">OPERATOR</option>
                  <option value="DEVELOPER" className="bg-slate-900 text-slate-100 py-1.5">DEVELOPER</option>
                  <option value="MANAGER" className="bg-slate-900 text-slate-100 py-1.5">MANAGER</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Correo Electrónico</label>
              <Input
                type="email"
                placeholder="cheyernex@gmail.com"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Departamento</label>
              <Input
                placeholder="Ej. Tecnología / DevOps"
                value={createDept}
                onChange={(e) => setCreateDept(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="shadow-lg shadow-primary/25 font-semibold" disabled={isSubmitting}>
                {isSubmitting ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Usuario */}
      <Dialog open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
              <Icon icon="solar:pen-bold-duotone" className="text-primary" width={22} />
              Editar Usuario: <span className="text-primary">@{editingUser?.username}</span>
            </DialogTitle>
          </DialogHeader>

          {editError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
              <Icon icon="solar:danger-triangle-bold" width={18} />
              <span>{editError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateUser} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Nombre Completo</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Rol</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-card text-foreground px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="ADMIN" className="bg-slate-900 text-slate-100 py-1.5">ADMIN</option>
                  <option value="OPERATOR" className="bg-slate-900 text-slate-100 py-1.5">OPERATOR</option>
                  <option value="DEVELOPER" className="bg-slate-900 text-slate-100 py-1.5">DEVELOPER</option>
                  <option value="MANAGER" className="bg-slate-900 text-slate-100 py-1.5">MANAGER</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Estado de la Cuenta</label>
                <select
                  value={editActive ? 'true' : 'false'}
                  onChange={(e) => setEditActive(e.target.value === 'true')}
                  className="w-full h-9 rounded-md border border-input bg-card text-foreground px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="true" className="bg-slate-900 text-slate-100 py-1.5">Activo</option>
                  <option value="false" className="bg-slate-900 text-slate-100 py-1.5">Inactivo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Correo Electrónico</label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Departamento</label>
              <Input
                value={editDept}
                onChange={(e) => setEditDept(e.target.value)}
                placeholder="Ej. Finanzas, Tecnología, Logística..."
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Nueva Contraseña <span className="text-[10px] text-muted-foreground font-normal">(opcional)</span>
              </label>
              <Input
                type="password"
                placeholder="Dejar en blanco para mantener la actual"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button type="submit" className="shadow-lg shadow-primary/25 font-semibold" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersView;
