import React, { useState } from 'react';
import { CustomField, AdminUser, Governorate, Phenomenon } from '../types';
import { 
  Crown, 
  Plus, 
  Trash2, 
  Edit3, 
  Users, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  RefreshCw, 
  ShieldAlert, 
  Database, 
  FileText, 
  Settings,
  Sparkles,
  UserPlus,
  Lock,
  Unlock,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface Props {
  customFields: CustomField[];
  userCount: number;
  users: AdminUser[];
  governorates: Governorate[];
  phenomena: Phenomenon[];
  onUpdateUserCount: (count: number) => Promise<void>;
  onAddCustomField: (field: Omit<CustomField, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteCustomField: (id: string) => Promise<void>;
  onAddUser: (user: Omit<AdminUser, 'id' | 'joinedDate'>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onToggleUserStatus: (id: string) => Promise<void>;
  onDeletePhenomenon: (id: string) => void;
  onAddPhenomenon: (p: Phenomenon) => void;
  onResetPlatform: () => Promise<void>;
}

export const AdminDominancePortal: React.FC<Props> = ({
  customFields,
  userCount,
  users,
  governorates,
  phenomena,
  onUpdateUserCount,
  onAddCustomField,
  onDeleteCustomField,
  onAddUser,
  onDeleteUser,
  onToggleUserStatus,
  onDeletePhenomenon,
  onAddPhenomenon,
  onResetPlatform,
}) => {
  const [activeTab, setActiveTab] = useState<'fields' | 'users' | 'phenomena' | 'dominance'>('fields');
  const [editingUserCount, setEditingUserCount] = useState<number>(userCount);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // New Custom Field modal/state
  const [newFieldTitle, setNewFieldTitle] = useState('');
  const [newFieldCategory, setNewFieldCategory] = useState<'natural' | 'human' | 'satellite' | 'general'>('general');
  const [newFieldType, setNewFieldType] = useState<'stats' | 'text' | 'alert' | 'link'>('text');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [newFieldSource, setNewFieldSource] = useState('المرصد الجغرافي العُماني');
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);

  // New User modal/state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<AdminUser['role']>('محلل جيومكاني');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New Phenomenon modal/state
  const [showAddPhenomenonModal, setShowAddPhenomenonModal] = useState(false);
  const [newPhenomTitle, setNewPhenomTitle] = useState('');
  const [newPhenomCategory, setNewPhenomCategory] = useState<'natural' | 'human'>('natural');
  const [newPhenomSubCategory, setNewPhenomSubCategory] = useState('');
  const [newPhenomSummary, setNewPhenomSummary] = useState('');
  const [newPhenomLocation, setNewPhenomLocation] = useState('');
  const [newPhenomLat, setNewPhenomLat] = useState(23.5);
  const [newPhenomLng, setNewPhenomLng] = useState(58.4);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSaveUserCount = async () => {
    setLoading(true);
    try {
      await onUpdateUserCount(Number(editingUserCount));
      showToast('تم بنجاح تحديث وتثبيت عدد المستخدمين في المنصة!');
    } catch (err: any) {
      showToast('خطأ: ' + (err.message || 'تعذر حفظ عدد المستخدمين'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldTitle.trim() || !newFieldValue.trim()) return;

    setLoading(true);
    try {
      await onAddCustomField({
        title: newFieldTitle,
        category: newFieldCategory,
        fieldType: newFieldType,
        value: newFieldValue,
        source: newFieldSource,
      });
      setNewFieldTitle('');
      setNewFieldValue('');
      setShowAddFieldModal(false);
      showToast('تمت إضافة الخانة المخصصة بنجاح وظهورها بالمنصة فوراً!');
    } catch (err: any) {
      showToast('خطأ أثناء إضافة الخانة');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setLoading(true);
    try {
      await onAddUser({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        status: 'نشط',
      });
      setNewUserName('');
      setNewUserEmail('');
      setShowAddUserModal(false);
      showToast('تمت إضافة المستخدم بنجاح إلى سجل المنصة!');
    } catch (err: any) {
      showToast('خطأ أثناء إضافة المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePhenomenon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhenomTitle.trim()) return;

    const newP: Phenomenon = {
      id: 'phenom-custom-' + Date.now(),
      title: newPhenomTitle,
      category: newPhenomCategory,
      subCategory: newPhenomSubCategory || 'ظاهرة مخصصة',
      summary: newPhenomSummary,
      fullAnalysis: newPhenomSummary,
      lat: Number(newPhenomLat),
      lng: Number(newPhenomLng),
      locationName: newPhenomLocation || 'سلطنة عُمان',
      governorateId: 'muscat',
      officialSources: [{ name: 'إدارة المرصد الجغرافي - اعتماد المدير الأعلى' }],
      keyFacts: [{ label: 'الاعتماد', value: 'موثق ومعتمد من الإدارة' }],
      accentColor: newPhenomCategory === 'natural' ? '#10b981' : '#06b6d4',
    };

    onAddPhenomenon(newP);
    setShowAddPhenomenonModal(false);
    setNewPhenomTitle('');
    setNewPhenomSummary('');
    showToast('تمت إضافة الظاهرة الجديدة إلى قاعدة البيانات المعتمدة والخريطة!');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Toast Alert */}
      {statusMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-emerald-950/95 border border-emerald-500/80 text-emerald-200 text-sm font-bold flex items-center gap-2.5 shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Dominance Header Banner */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/60 border border-amber-500/40 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-950/50">
              <Crown className="w-8 h-8 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-wide">
                  بوابة المدير العليا - صلاحيات الهيمنة الكاملة
                </h1>
                <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  وضع الهيمنة المطلقة مفعّل
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                تحكم كامل غير مقيد: إضافة وتعديل وحذف الخانات المخصصة، تعديل عدد المستخدمين، إدارة وتجميد الحسابات، وتعديل أو حذف أي محتوى وظواهر في المنصة دون قيود.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من استعادة الإعدادات الأصلية المعتمدة للمنصة؟')) {
                  onResetPlatform();
                  showToast('تمت استعادة الإعدادات الأصلية للمنصة بنجاح!');
                }
              }}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-950 hover:bg-red-950/50 text-slate-300 hover:text-red-400 border border-slate-800 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>استعادة الإعدادات الأصلية</span>
            </button>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('fields')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'fields'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>إدارة وإضافة الخانات ({customFields.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>تعديل عدد وسجل المستخدمين ({userCount.toLocaleString('ar-OM')})</span>
          </button>

          <button
            onClick={() => setActiveTab('phenomena')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'phenomena'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>تعديل وحذف الظواهر والمحتوى ({phenomena.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dominance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dominance'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>سجل الهيمنة والنسخ الاحتياطي</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Custom Fields Engine (إضافة الخانات) */}
      {activeTab === 'fields' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>محرك الخانات المخصصة (إضافة وحذف وتعديل)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                يمكن للمدير إضافة أي خانة أو قسم أو تنبيه أو بطاقة بيانات تظهر فوراً في واجهة المستخدم
              </p>
            </div>

            <button
              onClick={() => setShowAddFieldModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة خانة جديدة</span>
            </button>
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customFields.map((field) => (
              <div
                key={field.id}
                className="flex flex-col justify-between p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {field.category === 'natural'
                        ? 'خانة طبيعية'
                        : field.category === 'human'
                        ? 'خانة بشرية'
                        : field.category === 'satellite'
                        ? 'خانة استشعار'
                        : 'خانة عامة'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(field.createdAt).toLocaleDateString('ar-OM')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2">{field.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                    {field.value}
                  </p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="text-slate-500">المصدر:</span>
                    <span className="text-emerald-400 font-medium">{field.source}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80 mt-4">
                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف الخانة "${field.title}"؟`)) {
                        onDeleteCustomField(field.id);
                        showToast('تم حذف الخانة بنجاح');
                      }
                    }}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الخانة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: User Count & Roster Domination (تعديل عدد وسجل المستخدمين) */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-6">
          {/* User Count Control Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>التحكم المباشر في عدد المستخدمين المعروض</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  يمكن للمدير إدخال وتعديل أي رقم لعدد المستخدمين النشطين في المنصة وتثبيته فورياً
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative">
                  <input
                    type="number"
                    value={editingUserCount}
                    onChange={(e) => setEditingUserCount(parseInt(e.target.value) || 0)}
                    className="w-48 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-lg focus:outline-none focus:border-amber-500 text-center"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">مستخدم</span>
                </div>

                <button
                  onClick={handleSaveUserCount}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>تثبيت عدد المستخدمين</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Roster Table */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">سجل وصلاحيات المستخدمين والباحثين</h3>
                <p className="text-xs text-slate-400">إضافة، حذف، أو تجميد أي مستخدم في النظام</p>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>إضافة مستخدم جديد</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-3">الاسم والصفة</th>
                    <th className="py-3 px-3">البريد الإلكتروني</th>
                    <th className="py-3 px-3">الدور والصلاحية</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-3">تاريخ الانضمام</th>
                    <th className="py-3 px-3 text-left">إجراءات المدير</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 font-mono">{u.email}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'نشط'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">{u.joinedDate}</td>
                      <td className="py-3.5 px-3 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              onToggleUserStatus(u.id);
                              showToast(`تم تغيير حالة المستخدم ${u.name}`);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title={u.status === 'نشط' ? 'تجميد الحساب' : 'تنشيط الحساب'}
                          >
                            {u.status === 'نشط' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف المستخدم ${u.name}؟`)) {
                                onDeleteUser(u.id);
                                showToast('تم حذف المستخدم بنجاح');
                              }
                            }}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300"
                            title="حذف المستخدم نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Modify & Delete Phenomena & Content (تعديل وحذف أي شيء) */}
      {activeTab === 'phenomena' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                <span>التحكم في قاعدة بيانات الظواهر والمحتوى</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                صلاحية مطلقة لإضافة أو تعديل أو حذف أي ظاهرة طبيعية أو بشرية
              </p>
            </div>

            <button
              onClick={() => setShowAddPhenomenonModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة ظاهرة جغرافية جديدة</span>
            </button>
          </div>

          {/* List of phenomena with delete actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phenomena.map((p) => (
              <div
                key={p.id}
                className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.category === 'natural'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      {p.category === 'natural' ? 'ظاهرة طبيعية' : 'ظاهرة بشرية'}
                    </span>
                    <span className="text-xs font-bold text-white">{p.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.summary}</p>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من حذف الظاهرة "${p.title}"؟`)) {
                      onDeletePhenomenon(p.id);
                      showToast('تم حذف الظاهرة بنجاح من قاعدة البيانات والخريطة');
                    }
                  }}
                  className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 transition-colors shrink-0"
                  title="حذف الظاهرة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Dominance Log & Backup */}
      {activeTab === 'dominance' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>ميثاق الهيمنة العليا وسجل العمليات</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              جميع التعديلات والإضافات التي يجريها المدير تُحفظ مباشرة في قاعدة البيانات الدائمة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400">حالة السيادة الإدارية:</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">هيمنة كاملة (Full Hegemony)</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400">إجمالي الخانات المخصصة:</div>
              <div className="text-sm font-bold text-amber-400 mt-1">{customFields.length} خانة نشطة</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400">عدد المستخدمين المسجل:</div>
              <div className="text-sm font-bold text-cyan-400 mt-1">{userCount.toLocaleString('ar-OM')} مستخدم</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Custom Field (إضافة خانة جديدة) */}
      {showAddFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-2xl p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>إضافة خانة مخصصة جديدة للمنصة</span>
              </h3>
              <button
                onClick={() => setShowAddFieldModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateField} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">عنوان الخانة:</label>
                <input
                  type="text"
                  value={newFieldTitle}
                  onChange={(e) => setNewFieldTitle(e.target.value)}
                  placeholder="مثال: مؤشر استثمارات الطاقة المتجددة بمحافظة الوسطى"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">التصنيف:</label>
                  <select
                    value={newFieldCategory}
                    onChange={(e: any) => setNewFieldCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="general">عام</option>
                    <option value="natural">ظواهر طبيعية</option>
                    <option value="human">ظواهر بشرية</option>
                    <option value="satellite">استشعار وصور جوية</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">نوع الخانة:</label>
                  <select
                    value={newFieldType}
                    onChange={(e: any) => setNewFieldType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="text">نص تحليلي</option>
                    <option value="stats">بطاقة إحصائية</option>
                    <option value="alert">تنبيه عاجل</option>
                    <option value="link">رابط وزاري</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">محتوى وبيانات الخانة:</label>
                <textarea
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  placeholder="اكتب تفاصيل ومحتوى هذه الخانة..."
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">المصدر الرسمي المعتمد:</label>
                <input
                  type="text"
                  value={newFieldSource}
                  onChange={(e) => setNewFieldSource(e.target.value)}
                  placeholder="مثال: المركز الوطني للإحصاء والمعلومات NCSI"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFieldModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  إضافة الخانة فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add User (إضافة مستخدم جديد) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-2xl p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>إضافة مستخدم أو باحث جديد</span>
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">اسم المستخدم الكامل:</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="مثال: م. سالم الرواحي"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">البريد الإلكتروني:</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="salem.r@oman-spatial.gov.om"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">الدور والصلاحية:</label>
                <select
                  value={newUserRole}
                  onChange={(e: any) => setNewUserRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="محلل جيومكاني">محلل جيومكاني</option>
                  <option value="باحث استشعار عن بعد">باحث استشعار عن بعد</option>
                  <option value="مستخدم معتمد">مستخدم معتمد</option>
                  <option value="مدير أعلى (سوبر أدمن)">مدير أعلى (سوبر أدمن)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  إضافة المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Phenomenon */}
      {showAddPhenomenonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-2xl p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>إضافة ظاهرة جغرافية جديدة</span>
              </h3>
              <button onClick={() => setShowAddPhenomenonModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePhenomenon} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">اسم الظاهرة:</label>
                <input
                  type="text"
                  value={newPhenomTitle}
                  onChange={(e) => setNewPhenomTitle(e.target.value)}
                  placeholder="مثال: ظاهرة التمعدن الكربوني في أفيوليت وادي سمائل"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">النوع:</label>
                  <select
                    value={newPhenomCategory}
                    onChange={(e: any) => setNewPhenomCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="natural">ظاهرة طبيعية</option>
                    <option value="human">ظاهرة بشرية</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">الموقع الجغرافي:</label>
                  <input
                    type="text"
                    value={newPhenomLocation}
                    onChange={(e) => setNewPhenomLocation(e.target.value)}
                    placeholder="سمائل، محافظة الداخلية"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">الملخص والتحليل العلمي:</label>
                <textarea
                  value={newPhenomSummary}
                  onChange={(e) => setNewPhenomSummary(e.target.value)}
                  placeholder="اكتب ملخص الظاهرة والتحليل الجغرافي..."
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPhenomenonModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  إضافة واعتماد الظاهرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
