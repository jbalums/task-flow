import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { isDemo, user, resetDemo } = useApp();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [defaultView, setDefaultView] = useState<string>('board');
  const [weekMonday, setWeekMonday] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load profile from DB for authenticated users
  useEffect(() => {
    if (isDemo) {
      setName('Demo User');
      return;
    }
    if (!user) return;
    const loadProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setName(data.name ?? '');
        setDefaultView(data.default_view ?? 'board');
        setWeekMonday(data.week_starts_monday ?? false);
      }
    };
    loadProfile();
  }, [isDemo, user]);

  const handleSave = async () => {
    if (isDemo || !user) {
      toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      name,
      default_view: defaultView,
      week_starts_monday: weekMonday,
    }).eq('user_id', user.id);
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
              {name ? name[0].toUpperCase() : <User className="h-6 w-6" />}
            </div>
            <div className="space-y-2 flex-1">
              <Label>Display Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              {!isDemo && user && (
                <p className="text-xs text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Default View</p>
              <p className="text-xs text-muted-foreground">Choose how tasks are displayed by default</p>
            </div>
            <Select value={defaultView} onValueChange={setDefaultView}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="board">Board</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Week starts on Monday</p>
              <p className="text-xs text-muted-foreground">Change the first day of the calendar week</p>
            </div>
            <Switch checked={weekMonday} onCheckedChange={setWeekMonday} />
          </div>
        </CardContent>
      </Card>

      {/* Demo */}
      {isDemo && (
        <Card className="border-0 shadow-sm border-l-4 border-l-primary">
          <CardHeader><CardTitle className="text-base">Demo Mode</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              You're currently exploring in demo mode. All changes are temporary and stored in memory.
            </p>
            <Button variant="outline" className="gap-2" onClick={() => { resetDemo(); toast({ title: 'Demo reset', description: 'All data has been restored to defaults.' }); }}>
              <RotateCcw className="h-4 w-4" /> Reset Demo Data
            </Button>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
