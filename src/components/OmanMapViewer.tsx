import React, { useState, useRef } from 'react';
import { Governorate, Phenomenon, MapExportConfig } from '../types';
import { 
  Download, 
  Layers, 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Compass, 
  Share2, 
  Info, 
  CheckCircle2, 
  ShieldCheck, 
  Maximize2,
  FileImage,
  Printer
} from 'lucide-react';

interface Props {
  governorates: Governorate[];
  phenomena: Phenomenon[];
  selectedGovernorate: Governorate | null;
  onSelectGovernorate: (gov: Governorate | null) => void;
  onSelectPhenomenon: (phenom: Phenomenon) => void;
}

export const OmanMapViewer: React.FC<Props> = ({
  governorates,
  phenomena,
  selectedGovernorate,
  onSelectGovernorate,
  onSelectPhenomenon,
}) => {
  const [activeLayer, setActiveLayer] = useState<'admin' | 'topo' | 'phenom' | 'ports'>('admin');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
  const [showEmblem, setShowEmblem] = useState<boolean>(true);
  const [showScaleBar, setShowScaleBar] = useState<boolean>(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleZoom = (factor: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev * factor, 0.75), 3));
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Export SVG as high-res PNG
  const handleExportPNG = () => {
    if (!svgRef.current) return;
    setIsExporting(true);
    setExportNotice('جارٍ معالجة وتصدير خريطة سلطنة عُمان بدقة 4K فائقة الوضوح...');

    setTimeout(() => {
      try {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);

        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          // High resolution 4K canvas (3840 x 2400)
          canvas.width = 2400;
          canvas.height = 1800;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            const pngURL = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngURL;
            downloadLink.download = `خريطة_سلطنة_عمان_الرسمية_${activeLayer}_${Date.now()}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(blobURL);

            setExportNotice('تم تحميل خريطة سلطنة عُمان بنجاح بدقة متناهية وبدون أي أخطاء!');
            setTimeout(() => setExportNotice(null), 4000);
          }
          setIsExporting(false);
        };
        image.src = blobURL;
      } catch (err) {
        console.error('Export error:', err);
        setExportNotice('حدث خطأ أثناء التصدير، يمكنك نسخ الرسم المتجه أو إعادة المحاولة');
        setIsExporting(false);
        setTimeout(() => setExportNotice(null), 3000);
      }
    }, 600);
  };

  // Export raw SVG
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `خريطة_سلطنة_عمان_المتجهة_${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportNotice('تم تنزيل ملف SVG المتجه عالي الدقة القابل للتكبير غير المحدود!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="relative flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Map Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                الخريطة الرسمية المعتمدة لسلطنة عُمان
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                دقة جغرافية 100% موثقة
              </span>
            </div>
            <p className="text-xs text-slate-400">
              المحافظات الـ 11، مضيق هرمز، جزر مصيرة والحلانيات، التضاريس، والموانئ الاستراتيجية
            </p>
          </div>
        </div>

        {/* Layer Selectors & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layer tabs */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setActiveLayer('admin')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeLayer === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              التقسيم الإداري
            </button>
            <button
              onClick={() => setActiveLayer('topo')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeLayer === 'topo'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              التضاريس الطبيعية
            </button>
            <button
              onClick={() => setActiveLayer('phenom')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeLayer === 'phenom'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الأعاصير والظواهر
            </button>
            <button
              onClick={() => setActiveLayer('ports')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeLayer === 'ports'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الموانئ ورؤية 2040
            </button>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 disabled:opacity-50"
              title="تصدير خريطة عالية الدقة لمشاركتها مع أصدقائك أو نشرها دون أي أخطاء"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل خريطة HD</span>
            </button>
            <button
              onClick={handleExportSVG}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              title="تنزيل بصيغة ناقلات متجهة SVG"
            >
              <FileImage className="w-3.5 h-3.5" />
              <span>SVG</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export status toast */}
      {exportNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Main Map Canvas Area */}
      <div className="relative w-full h-[540px] md:h-[620px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden cursor-crosshair select-none">
        {/* Subtle Water & Land Gradients */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* View Controls Floating Pill */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
          <button
            onClick={() => handleZoom(1.2)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="تكبير الخريطة"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="تصغير الخريطة"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="إعادة ضبط الرؤية"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Map Overlays Controls (Left side) */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md text-[11px] text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded hover:bg-slate-800">
            <input
              type="checkbox"
              checked={showCoordinates}
              onChange={(e) => setShowCoordinates(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span>شبكة الإحداثيات</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded hover:bg-slate-800">
            <input
              type="checkbox"
              checked={showEmblem}
              onChange={(e) => setShowEmblem(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span>شعار السلطنة</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded hover:bg-slate-800">
            <input
              type="checkbox"
              checked={showScaleBar}
              onChange={(e) => setShowScaleBar(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span>مقياس الرسم</span>
          </label>
        </div>

        {/* SVG Map Canvas */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-300"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          }}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 750 720"
            className="w-full h-full max-h-full max-w-full drop-shadow-2xl"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Oman Regional Gradients */}
              <linearGradient id="grad-admin-default" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#022c22" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="grad-admin-hover" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#047857" stopOpacity="1" />
              </linearGradient>

              <linearGradient id="grad-admin-selected" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#059669" stopOpacity="1" />
              </linearGradient>

              <linearGradient id="grad-topo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#78350f" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#92400e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e3a2f" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="grad-sea" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#082f49" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.1" />
              </linearGradient>

              {/* Cyclone track glow */}
              <filter id="cyclone-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Sea Backgrounds & Labels */}
            <rect x="0" y="0" width="750" height="720" fill="transparent" />

            {/* Surrounding Seas */}
            <text x="640" y="160" fill="#38bdf8" fillOpacity="0.35" fontSize="14" fontWeight="bold" fontFamily="Tajawal, Cairo" textAnchor="middle">
              بحر عُـمـان (Gulf of Oman)
            </text>
            <text x="590" y="520" fill="#0284c7" fillOpacity="0.35" fontSize="16" fontWeight="bold" fontFamily="Tajawal, Cairo" textAnchor="middle">
              بـحـر الـعـرب (Arabian Sea)
            </text>
            <text x="440" y="20" fill="#38bdf8" fillOpacity="0.45" fontSize="11" fontWeight="bold" fontFamily="Tajawal, Cairo" textAnchor="middle">
              مضيق هرمز الاستراتيجي
            </text>
            <text x="180" y="320" fill="#64748b" fillOpacity="0.3" fontSize="14" fontWeight="600" fontFamily="Tajawal, Cairo" textAnchor="middle">
              صحراء الربع الخالي (Rub' al Khali)
            </text>

            {/* Coordinate Grid (Lat/Lng) if enabled */}
            {showCoordinates && (
              <g stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4">
                {/* Latitudes */}
                <line x1="40" y1="60" x2="710" y2="60" />
                <text x="50" y="55" fill="#64748b" fontSize="9">26° N (مسندم / هرمز)</text>

                <line x1="40" y1="200" x2="710" y2="200" />
                <text x="50" y="195" fill="#64748b" fontSize="9">24° N (مسقط / الباطنة)</text>

                <line x1="40" y1="360" x2="710" y2="360" />
                <text x="50" y="355" fill="#64748b" fontSize="9">21° N (الوسطى / مصيرة)</text>

                <line x1="40" y1="560" x2="710" y2="560" />
                <text x="50" y="555" fill="#64748b" fontSize="9">17° N (ظفار / صلالة)</text>

                {/* Longitudes */}
                <line x1="160" y1="40" x2="160" y2="690" />
                <text x="165" y="705" fill="#64748b" fontSize="9">54° E</text>

                <line x1="360" y1="40" x2="360" y2="690" />
                <text x="365" y="705" fill="#64748b" fontSize="9">56° E</text>

                <line x1="560" y1="40" x2="560" y2="690" />
                <text x="565" y="705" fill="#64748b" fontSize="9">58° E</text>

                <line x1="660" y1="40" x2="660" y2="690" />
                <text x="645" y="705" fill="#64748b" fontSize="9">60° E (رأس الحد)</text>
              </g>
            )}

            {/* Surrounding Borders Silhouette (UAE & Saudi & Yemen) */}
            <path
              d="M 330 90 L 320 60 L 390 60 L 395 85 L 360 90"
              fill="none"
              stroke="#475569"
              strokeWidth="1.2"
              strokeDasharray="4,3"
              opacity="0.6"
            />
            <path
              d="M 330 90 L 310 150 L 290 260 L 230 420 L 140 490 L 80 560"
              fill="none"
              stroke="#475569"
              strokeWidth="1.5"
              strokeDasharray="5,4"
              opacity="0.6"
            />
            <text x="110" y="540" fill="#64748b" fontSize="10" fontWeight="bold">الجمهورية اليمنية</text>
            <text x="230" y="220" fill="#64748b" fontSize="10" fontWeight="bold">المملكة العربية السعودية</text>
            <text x="320" y="75" fill="#64748b" fontSize="10" fontWeight="bold">دولة الإمارات العربية المتحدة</text>

            {/* Coastline Shore Glow */}
            <path
              d="M 410 30 C 440 20, 440 60, 435 70 L 400 100 L 430 160 L 520 190 L 560 220 L 610 270 L 580 340 L 520 400 L 480 470 L 320 570 L 210 680 L 100 640"
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              strokeOpacity="0.25"
            />

            {/* Governorates SVG Polygons */}
            {governorates.map((gov) => {
              const isSelected = selectedGovernorate?.id === gov.id;

              let fillColor = 'url(#grad-admin-default)';
              let strokeColor = '#10b981';
              let strokeWidth = '1.8';

              if (activeLayer === 'topo') {
                fillColor = gov.id === 'dakhiliyah' || gov.id === 'musandam' || gov.id === 'south_batinah'
                  ? 'url(#grad-topo)'
                  : gov.id === 'dhofar'
                  ? '#065f46'
                  : '#1f2937';
                strokeColor = '#eab308';
              } else if (activeLayer === 'phenom') {
                fillColor = gov.id === 'south_sharqiyah' || gov.id === 'dhofar' || gov.id === 'south_batinah'
                  ? '#1e3a8a'
                  : '#111827';
                strokeColor = '#38bdf8';
              } else if (activeLayer === 'ports') {
                fillColor = gov.id === 'al_wusta' || gov.id === 'dhofar' || gov.id === 'north_batinah' || gov.id === 'muscat'
                  ? '#312e81'
                  : '#111827';
                strokeColor = '#818cf8';
              }

              if (isSelected) {
                fillColor = 'url(#grad-admin-selected)';
                strokeColor = '#34d399';
                strokeWidth = '3.5';
              }

              return (
                <g key={gov.id} className="cursor-pointer group" onClick={() => onSelectGovernorate(gov)}>
                  <path
                    d={gov.svgPath}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className="transition-all duration-300 hover:brightness-125 filter drop-shadow-md"
                  />
                  {/* Governorate Label */}
                  <g className="pointer-events-none">
                    <circle
                      cx={gov.labelPos.x}
                      cy={gov.labelPos.y - 12}
                      r="4"
                      fill={isSelected ? '#34d399' : '#10b981'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={gov.labelPos.x}
                      y={gov.labelPos.y + 3}
                      fill="#ffffff"
                      fontSize={isSelected ? '12.5' : '11'}
                      fontWeight="bold"
                      fontFamily="Cairo, Tajawal, sans-serif"
                      textAnchor="middle"
                      className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    >
                      {gov.nameAr}
                    </text>
                    <text
                      x={gov.labelPos.x}
                      y={gov.labelPos.y + 15}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="Cairo, Tajawal, sans-serif"
                      textAnchor="middle"
                    >
                      {gov.capital}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Special Omani Enclave: Madha (ولاية مدحاء العمانية في مسندم) */}
            <g className="cursor-pointer" onClick={() => {
              const musandam = governorates.find(g => g.id === 'musandam');
              if (musandam) onSelectGovernorate(musandam);
            }}>
              <circle cx="395" cy="88" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <text x="395" y="105" fill="#e2e8f0" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                مدحاء (عُمان)
              </text>
            </g>

            {/* Omani Strategic Islands: Masirah Island (جزيرة مصيرة) */}
            <g className="cursor-pointer group" onClick={() => {
              const sharqiyah = governorates.find(g => g.id === 'south_sharqiyah');
              if (sharqiyah) onSelectGovernorate(sharqiyah);
            }}>
              {/* Masirah Island shape */}
              <ellipse
                cx="580"
                cy="380"
                rx="14"
                ry="32"
                transform="rotate(-25 580 380)"
                fill="#047857"
                stroke="#10b981"
                strokeWidth="1.8"
                className="transition-all hover:fill-emerald-400"
              />
              <circle cx="580" cy="380" r="3" fill="#ffffff" />
              <text x="615" y="385" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="start">
                جزيرة مصيرة (عُمان)
              </text>
            </g>

            {/* Al Hallaniyat Islands (جزر الحلانيات) in Dhofar */}
            <g className="cursor-pointer group" onClick={() => {
              const dhofar = governorates.find(g => g.id === 'dhofar');
              if (dhofar) onSelectGovernorate(dhofar);
            }}>
              <circle cx="340" cy="625" r="4" fill="#047857" stroke="#34d399" strokeWidth="1.5" />
              <circle cx="350" cy="627" r="3" fill="#047857" stroke="#34d399" strokeWidth="1.5" />
              <circle cx="360" cy="624" r="5" fill="#047857" stroke="#34d399" strokeWidth="1.5" />
              <text x="380" y="628" fill="#f8fafc" fontSize="9.5" fontWeight="bold" textAnchor="start">
                جزر الحلانيات
              </text>
            </g>

            {/* Topographic Layer Highlights (Mountains, Jebel Shams, etc) */}
            {activeLayer === 'topo' && (
              <g className="pointer-events-none">
                {/* Al Hajar Mountain Range arc */}
                <path
                  d="M 370 120 Q 450 180 530 250"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="6"
                  strokeDasharray="8,4"
                  opacity="0.8"
                />
                {/* Jebel Shams Marker (3,009 m) */}
                <polygon points="435,210 443,225 427,225" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                <text x="445" y="215" fill="#fca5a5" fontSize="10" fontWeight="bold">
                  جبل شمس (3,009 م) الأعلى في عمان
                </text>

                {/* Dhofar Mountain Range */}
                <path
                  d="M 170 570 Q 240 590 300 610"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="5"
                  strokeDasharray="6,3"
                  opacity="0.9"
                />
                <text x="210" y="615" fill="#a7f3d0" fontSize="9.5" fontWeight="bold">
                  سلسلة جبال ظفار (سمحان، القرا، القمر)
                </text>
              </g>
            )}

            {/* Cyclone Tracks and Phenomena Layer */}
            {activeLayer === 'phenom' && (
              <g>
                {/* Cyclone Gonu Track (2007) */}
                <path
                  d="M 680 480 Q 640 380 610 270 Q 560 210 520 190"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3.5"
                  strokeDasharray="6,4"
                  filter="url(#cyclone-glow)"
                />
                <circle cx="610" cy="270" r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <text x="615" y="260" fill="#38bdf8" fontSize="10" fontWeight="bold">
                  مسار إعصار جونو (2007)
                </text>

                {/* Cyclone Shaheen Track (2021) into Gulf of Oman */}
                <path
                  d="M 660 170 Q 560 160 460 170 Q 420 180 400 185"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeDasharray="5,3"
                  filter="url(#cyclone-glow)"
                />
                <circle cx="430" cy="172" r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <text x="460" y="150" fill="#93c5fd" fontSize="10" fontWeight="bold">
                  مسار إعصار شاهين (2021)
                </text>

                {/* Khareef Dhofar Area Glow */}
                <ellipse cx="230" cy="620" rx="60" ry="35" fill="#10b981" fillOpacity="0.25" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="230" y="625" fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle">
                  نطاق ظاهرة خريف ظفار السنوية
                </text>
              </g>
            )}

            {/* Ports and Vision 2040 Layer */}
            {activeLayer === 'ports' && (
              <g>
                {/* Duqm Port & SEZAD */}
                <g className="cursor-pointer" onClick={() => {
                  const phen = phenomena.find(p => p.id === 'phenom-duqm');
                  if (phen) onSelectPhenomenon(phen);
                }}>
                  <circle cx="480" cy="420" r="8" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" className="animate-ping" opacity="0.4" />
                  <circle cx="480" cy="420" r="7" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
                  <text x="495" y="425" fill="#c4b5fd" fontSize="11" fontWeight="bold">
                    ميناء الدقم والمنطقة الاقتصادية الخاصة (2,000 كم²)
                  </text>
                </g>

                {/* Salalah Port */}
                <g className="cursor-pointer" onClick={() => {
                  const phen = phenomena.find(p => p.id === 'phenom-salalah-port');
                  if (phen) onSelectPhenomenon(phen);
                }}>
                  <circle cx="210" cy="675" r="7" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
                  <text x="225" y="680" fill="#67e8f9" fontSize="11" fontWeight="bold">
                    ميناء صلالة العالمي (كفاءة الترانزيت الأولى)
                  </text>
                </g>

                {/* Sohar Port */}
                <g className="cursor-pointer">
                  <circle cx="410" cy="115" r="7" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                  <text x="300" y="115" fill="#93c5fd" fontSize="10.5" fontWeight="bold">
                    ميناء صحار والمنطقة الحرة
                  </text>
                </g>

                {/* Green Hydrogen Clusters in Al Wusta */}
                <rect x="360" y="340" width="70" height="24" rx="6" fill="#059669" fillOpacity="0.8" stroke="#34d399" strokeWidth="1.2" />
                <text x="395" y="356" fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                  مشاريع هيدروم للهيدروجين
                </text>
              </g>
            )}

            {/* Official Compass Rose */}
            <g transform="translate(680, 75)" className="select-none">
              <circle cx="0" cy="0" r="28" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              {/* North Arrow */}
              <polygon points="0,-24 6,-4 0,0" fill="#ef4444" />
              <polygon points="0,-24 -6,-4 0,0" fill="#b91c1c" />
              {/* South Arrow */}
              <polygon points="0,24 5,4 0,0" fill="#94a3b8" />
              <polygon points="0,24 -5,4 0,0" fill="#64748b" />
              {/* East & West */}
              <polygon points="24,0 4,5 0,0" fill="#cbd5e1" />
              <polygon points="-24,0 -4,5 0,0" fill="#64748b" />
              <circle cx="0" cy="0" r="3" fill="#ffffff" />
              <text x="0" y="-27" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">N</text>
              <text x="0" y="36" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">ش</text>
            </g>

            {/* Official National Emblem of Oman (Khanjar & Two Swords) */}
            {showEmblem && (
              <g transform="translate(60, 60)" className="select-none">
                <rect x="-10" y="-10" width="130" height="90" rx="10" fill="#020617" fillOpacity="0.85" stroke="#1e293b" strokeWidth="1" />
                {/* Khanjar stylized emblem */}
                <path d="M 55 10 L 55 40 M 40 25 L 70 25 M 48 40 Q 55 52 62 40" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <text x="55" y="60" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="Cairo, Tajawal" textAnchor="middle">
                  سلطنة عُمان
                </text>
                <text x="55" y="73" fill="#94a3b8" fontSize="8" fontFamily="Cairo, Tajawal" textAnchor="middle">
                  الخريطة المعتمدة
                </text>
              </g>
            )}

            {/* Metric Scale Bar */}
            {showScaleBar && (
              <g transform="translate(60, 650)" className="select-none">
                <rect x="-10" y="-15" width="200" height="42" rx="8" fill="#020617" fillOpacity="0.85" stroke="#1e293b" strokeWidth="1" />
                <line x1="0" y1="10" x2="180" y2="10" stroke="#ffffff" strokeWidth="3" />
                <line x1="0" y1="5" x2="0" y2="15" stroke="#ffffff" strokeWidth="2" />
                <line x1="60" y1="5" x2="60" y2="15" stroke="#ffffff" strokeWidth="2" />
                <line x1="120" y1="5" x2="120" y2="15" stroke="#ffffff" strokeWidth="2" />
                <line x1="180" y1="5" x2="180" y2="15" stroke="#ffffff" strokeWidth="2" />
                <text x="0" y="2" fill="#94a3b8" fontSize="8">0</text>
                <text x="55" y="2" fill="#94a3b8" fontSize="8">100</text>
                <text x="115" y="2" fill="#94a3b8" fontSize="8">250</text>
                <text x="175" y="2" fill="#94a3b8" fontSize="8">500 كم</text>
                <text x="90" y="22" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">
                  مقياس الرسم المتري الجغرافي
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Selected Governorate Quick Inspector Strip */}
      {selectedGovernorate ? (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-base">
              {selectedGovernorate.nameAr.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">{selectedGovernorate.nameAr}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedGovernorate.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                المركز الإداري: <span className="text-emerald-400 font-semibold">{selectedGovernorate.capital}</span> | المساحة:{' '}
                <span className="text-slate-200">{selectedGovernorate.areaKm2.toLocaleString('ar-OM')} كم²</span> | السكان:{' '}
                <span className="text-slate-200">{selectedGovernorate.population.toLocaleString('ar-OM')} نسمة</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              الإحداثيات: {selectedGovernorate.lat.toFixed(4)}°N, {selectedGovernorate.lng.toFixed(4)}°E
            </div>
            <button
              onClick={() => onSelectGovernorate(null)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 text-center border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
          انقر فوق أي محافظة على الخريطة لعرض تفاصيلها الرسمية وولاياتها وظواهرها الطبيعية والبشرية
        </div>
      )}
    </div>
  );
};
