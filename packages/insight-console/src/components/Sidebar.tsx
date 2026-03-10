import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Settings,
  Sparkles,
  Shield,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Funnel', href: '/funnel', icon: TrendingUp },
  { name: 'Candidates', href: '/candidates', icon: Users },
  { name: 'Skills', href: '/skills', icon: Sparkles },
  { name: 'Compatibility', href: '/compatibility', icon: Shield },
  { name: 'Avatar', href: '/avatar', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'w-64 bg-card border-r'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Sparkles className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg">OpenClaw Evolution</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">Version 0.1.0 (Alpha)</p>
        </div>
      </div>
    </div>
  );
}
