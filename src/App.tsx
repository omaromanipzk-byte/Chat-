import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Crown, 
  Users, 
  ShieldCheck, 
  MessageSquare, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { CustomField, AdminUser, Governorate, Phenomenon } from './types';
import { OMAN_GOVERNORATES, OMAN_PHENOMENA } from './data/omanData';
import { SmartAIChat } from './components/SmartAIChat';
import { AdminDominancePortal } from './components/AdminDominancePortal';

export default function App() {
  const [view, setView] = useState<'chat' | 'admin'>('chat');
  const [userCount, setUserCount] = useState<number>(18450);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>(OMAN_GOVERNORATES);
  const [phenomena, setPhenomena] = useState<Phenomenon[]>(OMAN_PHENOMENA);

  // Load platform state from server on mount
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/admin/state');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setUserCount(data.data.userCount);
            setUsers(data.data.users || []);
            setCustomFields(data.data.customFields || []);
          }
        }
      } catch (err) {
        console.error('Error fetching admin state:', err);
      }
    };
    fetchState();
  }, []);

  // Admin dominance actions
  const handleUpdateUserCount = async (newCount: number) => {
    setUserCount(newCount);
    await fetch('/api/admin/user-count', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userCount: newCount }),
    });
  };

  const handleAddCustomField = async (field: Omit<CustomField, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/admin/custom-fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', field }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.fields) setCustomFields(data.fields);
    }
  };

  const handleDeleteCustomField = async (fieldId: string) => {
    const res = await fetch('/api/admin/custom-fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', fieldId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.fields) setCustomFields(data.fields);
    }
  };

  const handleAddUser = async (user: Omit<AdminUser, 'id' | 'joinedDate'>) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', user }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.users) setUsers(data.users);
      if (typeof data.userCount === 'number') setUserCount(data.userCount);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', userId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.users) setUsers(data.users);
      if (typeof data.userCount === 'number') setUserCount(data.userCount);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const userToToggle = users.find((u) => u.id === userId);
    if (!userToToggle) return;
    const updatedUser = {
      ...userToToggle,
      status: userToToggle.status === 'نشط' ? ('مجمد' as const) : ('نشط' as const),
    };
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', user: updatedUser }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.users) setUsers(data.users);
    }
  };

  const handleDeletePhenomenon = (id: string) => {
    setPhenomena((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddPhenomenon = (p: Phenomenon) => {
    setPhenomena((prev) => [p, ...prev]);
  };

  const handleResetPlatform = async () => {
    await fetch('/api/admin/reset', { method: 'POST' });
    const res = await fetch('/api/admin/state');
    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        setUserCount(data.data.userCount);
        setUsers(data.data.users || []);
        setCustomFields(data.data.customFields || []);
      }
    }
    setGovernorates(OMAN_GOVERNORATES);
    setPhenomena(OMAN_PHENOMENA);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              className="flex items-center gap-3.5 cursor-pointer"
              onClick={() => setView('chat')}
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-950/50 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                  <Bot className="w-6 h-6" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white tracking-wide">
                    الذكاء الاصطناعي المدقق والموثق
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    دقة 100%
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  جمع كميات ضخمة من البيانات الموثقة بالمصادر • لا نقول &quot;لا أعلم&quot;
                </span>
              </div>
            </div>

            {/* Right Controls: Live User Count & Admin Link */}
            <div className="flex items-center gap-3">
              {/* Active Users Pill (Admin Controlled) */}
              <div
                onClick={() => setView('admin')}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs cursor-pointer hover:border-amber-500/50 transition-colors"
                title="عدد المستخدمين النشطين (يمكن تعديله من رابط المدير)"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">المستخدمين:</span>
                <span className="font-bold font-mono text-emerald-400">
                  {userCount.toLocaleString('ar-OM')}
                </span>
              </div>

              {/* Chat View Button */}
              {view === 'admin' ? (
                <button
                  onClick={() => setView('chat')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>العودة للمحادثة</span>
                </button>
              ) : (
                /* Direct Admin Link Button as explicitly requested by user */
                <button
                  onClick={() => setView('admin')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 transition-all shadow-lg shadow-amber-950/40 active:scale-95 ring-1 ring-amber-400/40"
                  title="رابط المدير: إضافة الخانات، تعديل أي شيء، وعدد المستخدمين"
                >
                  <Crown className="w-4 h-4" />
                  <span>رابط المدير (الهيمنة)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {view === 'chat' ? (
          <SmartAIChat
            customFields={customFields}
            userCount={userCount}
            onOpenAdmin={() => setView('admin')}
          />
        ) : (
          <AdminDominancePortal
            customFields={customFields}
            userCount={userCount}
            users={users}
            governorates={governorates}
            phenomena={phenomena}
            onUpdateUserCount={handleUpdateUserCount}
            onAddCustomField={handleAddCustomField}
            onDeleteCustomField={handleDeleteCustomField}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            onToggleUserStatus={handleToggleUserStatus}
            onDeletePhenomenon={handleDeletePhenomenon}
            onAddPhenomenon={handleAddPhenomenon}
            onResetPlatform={handleResetPlatform}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">نظام الذكاء الاصطناعي المدقق والموثق</span>
            <span className="text-slate-600">•</span>
            <span>توثيق البيانات من المصادر الرسمية والمتعددة</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              دقة معتمدة بنسبة 100%
            </span>
            <button
              onClick={() => setView('admin')}
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors text-[11px]"
            >
              لوحة تحكم المدير
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
