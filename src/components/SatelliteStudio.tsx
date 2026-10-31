import React, { useState, useRef, useEffect } from 'react';
import { SATELLITE_PRESETS } from '../data/omanData';
import { 
  Sparkles, 
  Upload, 
  Download, 
  Sliders, 
  Eye, 
  Layers, 
  Maximize2, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Compass,
  Cpu,
  Contrast,
  SunMedium,
  Crosshair
} from 'lucide-react';

export const SatelliteStudio: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState(SATELLITE_PRESETS[0]);
  const [activeFilter, setActiveFilter] = useState<'normal' | 'super-res' | 'ndvi' | 'thermal' | 'water' | 'edge'>('super-res');
  const [sharpness, setSharpness] = useState<number>(75);
  const [contrast, setContrast] = useState<number>(125);
  const [brightness, setBrightness] = useState<number>(105);
  const [splitPosition, setSplitPosition] = useState<number>(50); // 0 to 100%
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [customImageURL, setCustomImageURL] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active image source
  const currentImageSrc = customImageURL || selectedPreset.thumbnail;

  // Render enhanced image on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImageSrc;

    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;

      // Draw original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Get pixel data for multi-spectral / enhancement processing
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const len = data.length;

      // Brightness and contrast multiplier
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      const brightVal = brightness - 100;

      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Apply brightness
        r += brightVal;
        g += brightVal;
        b += brightVal;

        // Apply contrast
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;

        // Multi-spectral simulation modes
        if (activeFilter === 'ndvi') {
          // NDVI Simulation: isolate healthy green/NIR spectrum
          const ndviVal = (g - r) / (g + r + 0.001);
          if (ndviVal > 0.05) {
            // Lush vegetation (Khareef, farms)
            r = 10;
            g = Math.min(255, 140 + ndviVal * 280);
            b = 40;
          } else {
            // Arid / rocky land
            r = 160 + (r * 0.3);
            g = 130 + (g * 0.3);
            b = 90;
          }
        } else if (activeFilter === 'thermal') {
          // False color thermal infrared (heat island / moisture detection)
          const heat = (r * 0.5 + g * 0.3 + b * 0.2);
          if (heat > 170) {
            r = 255;
            g = 60;
            b = 0; // high heat/asphalt
          } else if (heat > 110) {
            r = 240;
            g = 210;
            b = 20; // warm rocks
          } else {
            r = 10;
            g = 120;
            b = 230; // cool sea/moisture
          }
        } else if (activeFilter === 'water') {
          // Water index (NDWI): detect ocean, gulf, wadi pools
          const isWater = b > r && b > 100 && r < 140;
          if (isWater) {
            r = 2;
            g = 132;
            b = 199; // Deep aqua
          } else {
            r = r * 0.6;
            g = g * 0.6;
            b = b * 0.6; // Darkened terrain
          }
        } else if (activeFilter === 'super-res') {
          // High-clarity clarity boost & subtle sharpening
          const avg = (r + g + b) / 3;
          r = r + (r - avg) * (sharpness / 100);
          g = g + (g - avg) * (sharpness / 100);
          b = b + (b - avg) * (sharpness / 100);
        } else if (activeFilter === 'edge') {
          // High frequency edge visualization for ports and topography
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray > 120 ? 240 : 20;
          g = gray > 120 ? 255 : 30;
          b = gray > 120 ? 250 : 40;
        }

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }

      ctx.putImageData(imgData, 0, 0);

      // Add Geospatial Header Stamp
      ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
      ctx.fillRect(15, 15, 340, 60);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.strokeRect(15, 15, 340, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Cairo, sans-serif';
      ctx.fillText(`مرصد عمان: ${selectedPreset.name}`, 25, 38);

      ctx.fillStyle = '#34d399';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${selectedPreset.coordinates} | ${selectedPreset.resolution}`, 25, 58);

      setIsProcessing(false);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };
  }, [currentImageSrc, activeFilter, sharpness, contrast, brightness, selectedPreset]);

  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImageURL(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Download Enhanced Image
  const handleDownloadEnhanced = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `عمان_صورة_فضائية_محسنة_${selectedPreset.id}_${activeFilter}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header info */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">استوديو تحسين الصور الجوية والفضائية</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Super-Resolution & Multi-Spectral
              </span>
            </div>
            <p className="text-xs text-slate-400">
              رفع دقة التفاصيل، مؤشر الغطاء النباتي (NDVI)، الطيف الحراري لكشف الرطوبة، وتحليل التوسع العمراني للموانئ
            </p>
          </div>
        </div>

        {/* Upload Custom Imagery Button */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-md active:scale-95"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>رفع صورة جوية خاصة بك</span>
          </button>

          <button
            onClick={handleDownloadEnhanced}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل الصورة المحسّنة</span>
          </button>
        </div>
      </div>

      {/* Preset Location Carousel */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {SATELLITE_PRESETS.map((preset) => {
          const isSelected = selectedPreset.id === preset.id && !customImageURL;
          return (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedPreset(preset);
                setCustomImageURL(null);
              }}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-right transition-all shrink-0 ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <img
                src={preset.thumbnail}
                alt={preset.name}
                className="w-12 h-12 rounded-lg object-cover border border-slate-700"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white line-clamp-1">{preset.name}</span>
                <span className="text-[11px] text-emerald-400">{preset.location}</span>
                <span className="text-[10px] text-slate-400">{preset.resolution}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Sidebar */}
        <div className="flex flex-col gap-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">معالجة الطيف والدقة</h3>
          </div>

          {/* Enhancement Mode Buttons */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300">خوارزمية الاستشعار:</label>

            <button
              onClick={() => setActiveFilter('super-res')}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border text-right transition-all ${
                activeFilter === 'super-res'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>تعزيز الدقة والتفاصيل (Super-Res)</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">HD</span>
            </button>

            <button
              onClick={() => setActiveFilter('ndvi')}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border text-right transition-all ${
                activeFilter === 'ndvi'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-green-400" />
                <span>مؤشر الغطاء النباتي (NDVI)</span>
              </div>
              <span className="text-[10px] bg-green-950 text-green-300 px-1.5 py-0.5 rounded">خريف وزراعة</span>
            </button>

            <button
              onClick={() => setActiveFilter('thermal')}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border text-right transition-all ${
                activeFilter === 'thermal'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <SunMedium className="w-4 h-4 text-amber-400" />
                <span>الطيف الحراري لكشف الرطوبة (Thermal)</span>
              </div>
              <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded">حرارة وأودية</span>
            </button>

            <button
              onClick={() => setActiveFilter('water')}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border text-right transition-all ${
                activeFilter === 'water'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <span>كشف المسطحات المائية والفيوردات</span>
              </div>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded">بحر وأودية</span>
            </button>

            <button
              onClick={() => setActiveFilter('edge')}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border text-right transition-all ${
                activeFilter === 'edge'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Contrast className="w-4 h-4 text-purple-400" />
                <span>تحديد حواف المنشآت والموانئ</span>
              </div>
              <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded">بنية تحتية</span>
            </button>

            <button
              onClick={() => setActiveFilter('normal')}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border text-right transition-all ${
                activeFilter === 'normal'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>الصورة الأصلية الطبيعية (True Color RGB)</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">RGB</span>
            </button>
          </div>

          {/* Fine Tuning Sliders */}
          <div className="flex flex-col gap-4 pt-3 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>درجة الحدة والشحذ:</span>
                <span className="text-emerald-400 font-mono font-bold">{sharpness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                value={sharpness}
                onChange={(e) => setSharpness(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>التباين الطيفي (Contrast):</span>
                <span className="text-emerald-400 font-mono font-bold">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>الإضاءة والتعريض:</span>
                <span className="text-emerald-400 font-mono font-bold">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Quick reset */}
          <button
            onClick={() => {
              setSharpness(75);
              setContrast(125);
              setBrightness(105);
              setActiveFilter('super-res');
            }}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة ضبط المعايير القياسية</span>
          </button>
        </div>

        {/* Canvas Display Viewport */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="relative w-full h-[520px] rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* The Processing Canvas */}
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
            />

            {/* Split Screen Slider Bar for Before/After */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{ left: `${splitPosition}%` }}
            >
              <div className="w-0.5 h-full bg-emerald-400/80 shadow-[0_0_10px_#10b981]" />
            </div>

            {/* Interactive Split Slider Controller at Bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-950/80 border border-slate-700/80 text-xs text-slate-300 flex items-center gap-3 backdrop-blur-md shadow-2xl">
              <span>الأصلية (قبل)</span>
              <input
                type="range"
                min="0"
                max="100"
                value={splitPosition}
                onChange={(e) => setSplitPosition(parseInt(e.target.value))}
                className="w-36 accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-ew-resize"
              />
              <span className="text-emerald-400 font-bold">المعالجة (بعد)</span>
            </div>

            {/* Processing indicator */}
            {isProcessing && (
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-xl backdrop-blur-md">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>معالجة الطيف النقطي...</span>
              </div>
            )}
          </div>

          {/* Image Details Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{selectedPreset.name}</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-mono">{selectedPreset.coordinates}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>المصدر: <span className="text-slate-200">{selectedPreset.source}</span></span>
              <span>الدقة: <span className="text-slate-200">{selectedPreset.resolution}</span></span>
              <span>التاريخ: <span className="text-slate-200">{selectedPreset.date}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
