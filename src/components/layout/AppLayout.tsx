import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useApp } from '@/contexts/AppContext';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Calendar, BarChart3, Settings,
  Search, Bell, ChevronLeft, Menu, LogOut, RotateCcw, User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { title: 'Dashboard', url: '/app', icon: LayoutDashboard },
  { title: 'Projects', url: '/app/projects', icon: FolderKanban },
  { title: 'Tasks', url: '/app/tasks', icon: CheckSquare },
  { title: 'Calendar', url: '/app/calendar', icon: Calendar },
  { title: 'Reports', url: '/app/reports', icon: BarChart3 },
  { title: 'Settings', url: '/app/settings', icon: Settings },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDemo, user, authLoading, resetDemo, exitDemo, signOut } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to landing if not demo and not authenticated
  useEffect(() => {
    if (!authLoading && !isDemo && !user) {
      navigate('/', { replace: true });
    }
  }, [authLoading, isDemo, user, navigate]);

  if (authLoading && !isDemo) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!isDemo && !user) return null;

  const handleSignOut = async () => {
    if (isDemo) {
      exitDemo();
      navigate('/');
    } else {
      await signOut();
      navigate('/');
    }
  };

  const userInitial = isDemo ? 'D' : (user?.email?.[0]?.toUpperCase() ?? 'U');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out
        lg:relative lg:z-auto
        ${sidebarOpen ? 'w-64' : 'w-16'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className={`flex h-16 items-center border-b border-sidebar-border px-4 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <CheckSquare className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">TaskFlow</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:flex"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(item => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === '/app'}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground ${!sidebarOpen ? 'justify-center px-0' : ''}`}
              activeClassName="bg-sidebar-accent text-sidebar-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Demo badge */}
        {isDemo && sidebarOpen && (
          <div className="border-t border-sidebar-border p-3 space-y-2">
            <Badge variant="secondary" className="w-full justify-center bg-sidebar-accent text-sidebar-foreground text-xs">
              Demo Mode
            </Badge>
            <Button size="sm" variant="ghost" className="w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs" onClick={resetDemo}>
              <RotateCcw className="mr-2 h-3 w-3" /> Reset Demo
            </Button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-md p-2 hover:bg-muted lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="w-64 pl-9 bg-muted/50 border-0 focus-visible:ring-1" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDemo && (
              <Badge variant="outline" className="border-primary/30 text-primary text-xs mr-2 hidden sm:flex">
                Demo Mode
              </Badge>
            )}
            <button className="relative rounded-md p-2 hover:bg-muted">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {userInitial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/settings')}><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                {isDemo && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={resetDemo}><RotateCcw className="mr-2 h-4 w-4" /> Reset Demo</DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /> {isDemo ? 'Exit Demo' : 'Sign Out'}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
