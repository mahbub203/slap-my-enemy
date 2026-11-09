import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCw, FlipHorizontal, Sun, Contrast, Sliders, Check, RotateCcw } from 'lucide-react';

interface ImageEditorModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onApply: (editedDataUrl: string) => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onApply
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      renderPreview();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    renderPreview();
  }, [rotation, flipH, brightness, contrast, saturation]);

  const renderPreview = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Save and transform
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) ctx.scale(-1, 1);

    // Cover crop
    const aspect = img.width / img.height;
    let sWidth = img.width;
    let sHeight = img.height;
    if (aspect > 1) {
      sWidth = img.height;
    } else {
      sHeight = img.width;
    }
    const sx = (img.width - sWidth) / 2;
    const sy = (img.height - sHeight) / 2;

    ctx.drawImage(img, sx, sy, sWidth, sHeight, -size / 2, -size / 2, size, size);
    ctx.restore();

    // Color adjustments
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    const bFactor = brightness;
    const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const sFactor = (saturation + 100) / 100;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness
      r += bFactor;
      g += bFactor;
      b += bFactor;

      // Contrast
      r = cFactor * (r - 128) + 128;
      g = cFactor * (g - 128) + 128;
      b = cFactor * (b - 128) + 128;

      // Saturation
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * sFactor;
      g = gray + (g - gray) * sFactor;
      b = gray + (b - gray) * sFactor;

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
    ctx.putImageData(imgData, 0, 0);

    // Circular crop guide overlay
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.stroke();
  };

  const handleApply = () => {
    if (!canvasRef.current) return;
    const editedUrl = canvasRef.current.toDataURL('image/png');
    onApply(editedUrl);
    onClose();
  };

  const handleReset = () => {
    setRotation(0);
    setFlipH(false);
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-6 border border-purple-500/40 shadow-2xl flex flex-col gap-5 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-black text-white">Adjust & Crop Image</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Canvas */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950/70 rounded-2xl border border-white/5">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-xl shadow-purple-950/40 relative">
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Avatar will be cropped to square / circular frame for the 3D model
          </p>
        </div>

        {/* Quick Transform Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-white/5 transition-all"
          >
            <RotateCw className="w-3.5 h-3.5 text-purple-400" />
            <span>Rotate 90°</span>
          </button>
          <button
            onClick={() => setFlipH((f) => !f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-white/5 transition-all"
          >
            <FlipHorizontal className="w-3.5 h-3.5 text-pink-400" />
            <span>Flip H</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-400 hover:text-slate-200 border border-white/5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-3 px-2">
          {/* Brightness */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-yellow-400" /> Brightness
              </span>
              <span>{brightness}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg accent-yellow-400 cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Contrast className="w-3.5 h-3.5 text-cyan-400" /> Contrast
              </span>
              <span>{contrast}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={contrast}
              onChange={(e) => setContrast(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-pink-400" /> Saturation
              </span>
              <span>{saturation}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={saturation}
              onChange={(e) => setSaturation(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg accent-pink-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-950/50 transition-all hover:scale-105"
          >
            <Check className="w-4 h-4" />
            <span>Apply Adjustments</span>
          </button>
        </div>
      </div>
    </div>
  );
};
