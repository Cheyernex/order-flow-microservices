'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { fetchNotifications, NotificationItem } from 'src/api/microservices';

const Messages = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [prevCount, setPrevCount] = useState<number>(0);

  const loadNotifs = async () => {
    try {
      const data = await fetchNotifications();
      if (Array.isArray(data)) {
        if (data.length > prevCount && prevCount > 0) {
          const diff = data.length - prevCount;
          setUnreadCount((c) => c + diff);
        }
        setNotifications(data);
        setPrevCount(data.length);
      }
    } catch {
      // Silent error on background poll
    }
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 4000);
    return () => clearInterval(interval);
  }, [prevCount]);

  const handleOpenDropdown = () => {
    setUnreadCount(0);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PRODUCT':
        return 'solar:box-minimalistic-bold-duotone';
      case 'ORDER':
        return 'solar:cart-large-4-bold-duotone';
      case 'PAYMENT':
        return 'solar:card-recive-bold-duotone';
      default:
        return 'solar:bell-bing-bold-duotone';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'PRODUCT':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'ORDER':
        return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'PAYMENT':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      default:
        return 'text-primary bg-lightprimary';
    }
  };

  return (
    <div className="relative group/menu px-4 sm:px-15 ">
      <DropdownMenu onOpenChange={(open) => open && handleOpenDropdown()}>
        <DropdownMenuTrigger asChild>
          <div className="relative">
            <span className="relative after:absolute after:w-10 after:h-10 after:rounded-full hover:text-primary after:-top-1/2 hover:after:bg-lightprimary text-foreground dark:text-muted-foreground rounded-full flex justify-center items-center cursor-pointer group-hover/menu:after:bg-lightprimary group-hover/menu:!text-primary">
              <Icon icon="tabler:bell-ringing" height={20} />
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full absolute -end-[6px] -top-[5px] text-[10px] font-bold h-4 w-4 bg-red-500 text-white flex justify-center items-center shadow-lg animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-screen sm:w-[360px] py-4 rounded-xl border border-ld bg-background/95 backdrop-blur-md shadow-2xl"
        >
          <div className="flex items-center px-5 justify-between pb-3 border-b border-border/50">
            <div>
              <h3 className="mb-0 text-sm font-semibold text-foreground">Eventos RabbitMQ</h3>
              <p className="text-[11px] text-muted-foreground">Notification Service en vivo</p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
              {notifications.length} eventos
            </Badge>
          </div>

          <SimpleBar className="max-h-80 my-2">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No hay notificaciones recibidas aún.
              </div>
            ) : (
              notifications.map((n) => {
                const timeStr = n.timestamp
                  ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  : '';

                return (
                  <DropdownMenuItem
                    className="px-4 py-3 flex items-start gap-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/30 last:border-0"
                    key={n.id}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${getEventColor(n.type)}`}>
                      <Icon icon={getEventIcon(n.type)} width={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h5 className="text-xs font-semibold text-foreground truncate">{n.title}</h5>
                        <span className="text-[10px] text-muted-foreground shrink-0">{timeStr}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </SimpleBar>

          <div className="pt-2 px-4 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setUnreadCount(0);
                loadNotifs();
              }}
            >
              🔄 Actualizar Eventos
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Messages;
