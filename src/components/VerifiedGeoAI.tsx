import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  RotateCcw, 
  Bot, 
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Compass
} from 'lucide-react';

export const VerifiedGeoAI: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [sources, setSources] = useState<{ title: string; uri?: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const quickPrompts = [
    'أريد خريطة تفصيلية لسلطنة عمان مع إحداثيات المحافظات الـ 11 والظواهر الطبيعية والبشرية',
    'ما هي أسباب ومسارات أعاصير بحر العرب المدارية (جونو، فيت، ميكونو، شاهين) وتأثيرها على عمان؟',
    'اشرح الآلية الفيزيائية لظاهرة خريف ظفار وصعود التيارات المائية الباردة (Upwelling)',
    'ما هي المشاريع الاقتصادية والبشرية الاستراتيجية في المنطقة الاقتصادية الخاصة بالدقم ورؤية عمان 2040؟',
    'ما هي الخصائص الجيولوجية لأفيوليت سمائل وقدرته على حبس ثاني أكسيد الكربون؟',
  ];

  const handleQuery = async (queryText?: string) => {
    const query = queryText || prompt;
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setSources([]);

    try {
      const res = await fetch('/api/geo/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل في استرجاع الإجابة من محرك الذكاء الاصطناعي');
      }

      setResponse(data.answer);
      if (data.sources && Array.isArray(data.sources)) {
        setSources(data.sources);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ في الاتصال بمحرك التحليل');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-950/40">
              <Bot className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">محرك الذكاء الاصطناعي الجغرافي فائق الدقة</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Google Search Grounding
                </span>
              </div>
              <p className="text-xs text-slate-400">
                يجمع كميات هائلة من البيانات الجغرافية الموثقة من مصادر متعددة رسمية، بدون أي إجابات عشوائية أو &quot;لا أعلم&quot;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
            <span>توثيق رسمي: NCSI • الأرصاد • اليونسكو • وزارة الإسكان</span>
          </div>
        </div>
      </div>

      {/* Query Input Box */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-emerald-400" />
            <span>اطرح أي استفسار عن سلطنة عُمان، خرائطها، ظواهرها الطبيعية أو البشرية:</span>
          </label>
          <span className="text-[11px] text-slate-500">مدعوم بنموذج Gemini 3.8 Flash وخاصية البحث الحي</span>
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleQuery();
              }
            }}
            placeholder="مثال: أريد خريطة مفصلة لسلطنة عُمان توضح إحداثيات المحافظات وأهم الظواهر الطبيعية كالوديان والأعاصير..."
            rows={3}
            className="w-full p-4 pl-12 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-all resize-none"
          />

          <button
            onClick={() => handleQuery()}
            disabled={loading || !prompt.trim()}
            className="absolute left-3 bottom-3 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            title="إرسال الاستفسار والتحليل"
          >
            {loading ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 rotate-180" />
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[11px] font-semibold text-slate-400">استفسارات مقترحة وسريعة:</span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(q);
                handleQuery(q);
              }}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-right"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex flex-col gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800" />
            <div className="h-4 w-48 bg-slate-800 rounded" />
          </div>
          <div className="h-3 w-full bg-slate-800/80 rounded" />
          <div className="h-3 w-5/6 bg-slate-800/80 rounded" />
          <div className="h-3 w-4/6 bg-slate-800/80 rounded" />
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Verified Result Card */}
      {response && (
        <div className="flex flex-col gap-4 p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl backdrop-blur-md">
          {/* Result Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-sm font-bold text-emerald-400">
                التحليل الجغرافي الموثق لسلطنة عُمان
              </h3>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ التقرير'}</span>
            </button>
          </div>

          {/* Formatted Markdown Content */}
          <div className="text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
            {response}
          </div>

          {/* Web & Grounding Sources Strip */}
          {sources.length > 0 && (
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                المصادر التي استند إليها محرك البحث الحي:
              </span>
              <div className="flex flex-wrap gap-2">
                {sources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.uri || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-emerald-400 transition-all"
                  >
                    <span>{s.title}</span>
                    {s.uri && <ExternalLink className="w-3 h-3 opacity-60" />}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
