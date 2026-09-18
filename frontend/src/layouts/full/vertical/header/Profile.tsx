'use client';

import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router';
import profileimg from 'src/assets/images/profile/user-1.jpg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import { useAuth } from 'src/context/AuthContext';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="relative group/menu ps-1 sm:ps-15 shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <img src={profileimg} alt="logo" height="35" width="35" className="rounded-full border border-primary/30" />
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-72 p-4 rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-2xl space-y-3"
        >
          {/* User Info Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <img src={profileimg} alt="user" className="w-10 h-10 rounded-full border border-primary/40" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-foreground truncate">{currentUser?.name || 'Cheyernex Manzanillo'}</h4>
              <p className="text-[11px] text-muted-foreground truncate">{currentUser?.email || 'cheyernex@gmail.com'}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                  {currentUser?.role || 'ADMIN'}
                </Badge>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono font-semibold">
                  OIDC / Keycloak
                </span>
              </div>
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-1">
            <DropdownMenuItem
              asChild
              className="px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-muted/60 cursor-pointer transition-colors"
            >
              <a
                href="https://github.com/Cheyernex"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 w-full"
              >
                <div className="p-1.5 rounded-lg bg-muted text-foreground flex items-center justify-center">
                  <Icon icon="akar-icons:github-fill" width={18} />
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-foreground">GitHub Profile</h5>
                  <span className="text-[10px] text-muted-foreground">@Cheyernex ↗</span>
                </div>
              </a>
            </DropdownMenuItem>

            <DropdownMenuItem
              asChild
              className="px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-muted/60 cursor-pointer transition-colors"
            >
              <a
                href="http://localhost:8088/admin/orderflow-realm/console"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 w-full"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Icon icon="solar:shield-keyhole-bold-duotone" width={18} />
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-foreground">Keycloak IAM Console</h5>
                  <span className="text-[10px] text-muted-foreground">Port 8088 / Realm ↗</span>
                </div>
              </a>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator className="my-2" />

          {/* Botón Logout */}
          <div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold text-red-500 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40"
              onClick={handleLogout}
            >
              <Icon icon="solar:logout-2-bold-duotone" className="mr-2" width={16} />
              Cerrar Sesión (Logout)
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Profile;
