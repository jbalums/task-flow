import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { CheckSquare, ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const navigate = useNavigate();
  const { enterDemo, user, authLoading } = useApp();

  // Redirect authenticated users to app
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/app', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleExploreDemo = () => {
    enterDemo();
    navigate('/app');
  };

  return (
    <div className="flex min-h-screen flex-col bg-card">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <CheckSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </div>
        <Button variant="ghost" onClick={() => navigate('/auth')}>Sign In</Button>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="animate-fade-in max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Built for modern teams
          </div>
          <h1 className="mb-4 text-5xl font-extrabold leading-tight tracking-tight lg:text-6xl">
            Manage projects<br />
            <span className="text-primary">with clarity</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground max-w-lg mx-auto">
            TaskFlow brings your tasks, projects, and team together in one beautiful workspace. Track progress, hit deadlines, ship faster.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2 px-8 text-base" onClick={handleExploreDemo}>
              Explore Demo <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 px-8 text-base" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-20 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: FolderIcon, title: 'Projects & Boards', desc: 'Kanban boards, lists, and timelines' },
            { icon: Shield, title: 'Secure by Default', desc: 'Role-based access & data isolation' },
            { icon: BarChart3, title: 'Smart Reports', desc: 'Track velocity and team workload' },
          ].map((f, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 text-left transition-shadow hover:shadow-md">
              <f.icon className="mb-3 h-5 w-5 text-primary" />
              <h3 className="mb-1 text-sm font-semibold">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        Built as a SaaS demo for portfolio &middot; TaskFlow
      </footer>
    </div>
  );
}

function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
    </svg>
  );
}
