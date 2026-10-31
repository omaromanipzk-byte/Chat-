import React, { useState } from 'react';
import { Phenomenon } from '../types';
import { 
  Sparkles, 
  Search, 
  Filter, 
  TreePine, 
  Building2, 
  MapPin, 
  BookOpen, 
  ExternalLink, 
  ShieldCheck, 
  Activity, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Props {
  phenomena: Phenomenon[];
  selectedPhenomenon: Phenomenon | null;
  onSelectPhenomenon: (p: Phenomenon | null) => void;
  onNavigateToMap: (p: Phenomenon) => void;
}

export const PhenomenaExplorer: React.FC<Props> = ({
  phenomena,
  selectedPhenomenon,
  onSelectPhenomenon,
  onNavigateToMap,
}) => {
  const [filter, setFilter] = useState<'all' | 'natural' | 'human'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = phenomena.filter((p) => {
    const matchesFilter = filter === 'all' || p.category === filter;
    const matchesSearch =
      p.title.includes(searchQuery) ||
      p.summary.includes(searchQuery) ||
      p.locationName.includes(searchQuery) ||
      p.subCategory.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">رصد وتحديد الظواهر الطبيعية والبشرية</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                توثيق معتمد بالمصادر
              </span>
            </div>
            <p className="text-xs text-slate-400">
              تحليل فوري دقيق للأعاصير، خريف ظفار، أفيوليت سمائل، موانئ الدقم وصلالة، ومنظومة الأفلاج باليونسكو
            </p>
          </div>
        </div>

        {/* Search & Category Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن ظاهرة أو موقع جغرافي..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              كافة الظواهر ({phenomena.length})
            </button>
            <button
              onClick={() => setFilter('natural')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === 'natural' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TreePine className="w-3.5 h-3.5 text-emerald-400" />
              <span>طبيعية</span>
            </button>
            <button
              onClick={() => setFilter('human')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === 'human' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>بشرية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filtered.map((item) => {
          const isNatural = item.category === 'natural';
          return (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-emerald-500/40 hover:bg-slate-900 transition-all duration-300 shadow-lg hover:shadow-emerald-950/20"
            >
              <div>
                {/* Top Badge & Category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        isNatural
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {isNatural ? <TreePine className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                      <span>{isNatural ? 'ظاهرة طبيعية' : 'ظاهرة بشرية'}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{item.subCategory}</span>
                  </div>

                  {item.historicalDates && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{item.historicalDates}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>

                {/* Location pin */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{item.locationName}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.lat.toFixed(4)}°N, {item.lng.toFixed(4)}°E
                  </span>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                  {item.summary}
                </p>

                {/* Key Facts Pill Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                  {item.keyFacts.slice(0, 2).map((fact, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-medium">{fact.label}</span>
                      <span className="text-xs font-bold text-emerald-300 truncate">{fact.value}</span>
                    </div>
                  ))}
                </div>

                {/* Official Sources Citation Strip */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 mb-4">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    المصادر المعتمدة:
                  </span>
                  {item.officialSources.map((src, i) => (
                    <span key={i} className="bg-slate-800/70 px-2 py-0.5 rounded-md text-slate-300 text-[10px] border border-slate-700/60">
                      {src.name} {src.year ? `(${src.year})` : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => onSelectPhenomenon(item)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>قراءة التحليل العلمي الكامل</span>
                </button>

                <button
                  onClick={() => onNavigateToMap(item)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all font-medium"
                >
                  <span>عرض على الخريطة</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 rotate-180" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Analysis Modal */}
      {selectedPhenomenon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      selectedPhenomenon.category === 'natural'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {selectedPhenomenon.category === 'natural' ? 'ظاهرة طبيعية موثقة' : 'ظاهرة بشرية واقتصادية'}
                  </span>
                  <span className="text-xs text-slate-400">{selectedPhenomenon.subCategory}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{selectedPhenomenon.title}</h3>
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedPhenomenon.locationName}</span>
                </p>
              </div>

              <button
                onClick={() => onSelectPhenomenon(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Analysis Text */}
            <div className="space-y-4 text-xs md:text-sm leading-relaxed text-slate-300">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white mb-2 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  التحليل العلمي والجغرافي المفصل:
                </h4>
                <p className="leading-relaxed">{selectedPhenomenon.fullAnalysis}</p>
              </div>

              {/* Key Facts Detailed List */}
              <div>
                <h4 className="font-bold text-white mb-2 text-xs">المؤشرات والبيانات الرقمية:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedPhenomenon.keyFacts.map((fact, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400">{fact.label}</div>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">{fact.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Satellite Bands Recommendation */}
              {selectedPhenomenon.satelliteBandsRecommendation && (
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                  <h4 className="text-xs font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    توصية الاستشعار عن بعد والأقمار الصناعية:
                  </h4>
                  <p className="text-xs text-indigo-200/90 leading-relaxed">
                    {selectedPhenomenon.satelliteBandsRecommendation}
                  </p>
                </div>
              )}

              {/* Official Verified Sources */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  المراجع والمصادر الرسمية المعتمدة:
                </h4>
                <ul className="space-y-1.5">
                  {selectedPhenomenon.officialSources.map((source, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-200 font-medium">{source.name}</span>
                      {source.year && <span className="text-slate-500">[{source.year}]</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  onNavigateToMap(selectedPhenomenon);
                  onSelectPhenomenon(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
              >
                تحديد الموقع على خريطة السلطنة
              </button>
              <button
                onClick={() => onSelectPhenomenon(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
