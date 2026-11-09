import type { CharacterStyle } from '../types';

/**
 * High-performance algorithmic avatar stylizer and caricature engine.
 * Converts user photos into fictional game-style textures:
 * - Cartoon 3D
 * - Funny Caricature
 * - Pixel Art
 * - Comic Book Style
 * - Low-Poly
 */

export interface StylizeOptions {
  style: CharacterStyle;
  brightness: number; // -50 to 50
  contrast: number;   // -50 to 50
  saturation: number; // -50 to 50
  rotation: number;   // 0, 90, 180, 270
}

export function stylizeImageCanvas(
  img: HTMLImageElement,
  options: StylizeOptions
): string {
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return img.src;

  // 1. Draw with rotation and crop-to-center
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((options.rotation * Math.PI) / 180);

  // Compute cover crop
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

  // 2. Apply Brightness, Contrast & Saturation
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  const bFactor = options.brightness;
  const cFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
  const sFactor = (options.saturation + 100) / 100;

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

  // 3. Apply Style-Specific Algorithmic Shaders
  switch (options.style) {
    case 'cartoon-3d':
      applyCartoon3DStyle(ctx, size);
      break;
    case 'caricature':
      applyCaricatureDistortion(ctx, size);
      break;
    case 'comic':
      applyComicBookStyle(ctx, size);
      break;
    case 'low-poly':
      applyLowPolyStyle(ctx, size);
      break;
  }

  // 4. Overlay stylized fictional avatar border ring to make it explicitly a game token
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#a855f7';
  ctx.strokeRect(0, 0, size, size);

  return canvas.toDataURL('image/png');
}

/**
 * Cartoon 3D: Posterization, warm highlights, smooth skin blending
 */
function applyCartoon3DStyle(ctx: CanvasRenderingContext2D, size: number) {
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // Posterize colors into soft stepped cartoon tones
  const levels = 8;
  const step = 255 / levels;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / step) * step;
    data[i + 1] = Math.round(data[i + 1] / step) * step;
    data[i + 2] = Math.round(data[i + 2] / step) * step;

    // Warm vibrant cartoon tint
    data[i] = Math.min(255, data[i] * 1.05 + 8);
    data[i + 1] = Math.min(255, data[i + 1] * 1.02 + 4);
  }
  ctx.putImageData(imgData, 0, 0);

  // Soft cartoon radial glow
  const grad = ctx.createRadialGradient(size / 2, size / 2, 50, size / 2, size / 2, size / 1.4);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  grad.addColorStop(1, 'rgba(168, 85, 247, 0.2)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
}

/**
 * Funny Caricature: Center bulge magnification + exaggerated grin/features
 */
function applyCaricatureDistortion(ctx: CanvasRenderingContext2D, size: number) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = size;
  tempCanvas.height = size;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.drawImage(ctx.canvas, 0, 0);

  const srcData = tempCtx.getImageData(0, 0, size, size);
  const dstData = ctx.createImageData(size, size);
  const src = srcData.data;
  const dst = dstData.data;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.45;
  const strength = 1.6; // Bulge factor

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let u = x;
      let v = y;

      if (dist < radius) {
        const factor = Math.pow(dist / radius, strength);
        u = cx + dx * factor;
        v = cy + dy * factor;
      }

      const iu = Math.max(0, Math.min(size - 1, Math.floor(u)));
      const iv = Math.max(0, Math.min(size - 1, Math.floor(v)));
      const srcIdx = (iv * size + iu) * 4;
      const dstIdx = (y * size + x) * 4;

      dst[dstIdx] = src[srcIdx];
      dst[dstIdx + 1] = src[srcIdx + 1];
      dst[dstIdx + 2] = src[srcIdx + 2];
      dst[dstIdx + 3] = src[srcIdx + 3];
    }
  }

  ctx.putImageData(dstData, 0, 0);

  // Exaggerated comic blush and outlines
  ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
  ctx.beginPath();
  ctx.arc(cx - 100, cy + 50, 45, 0, Math.PI * 2);
  ctx.arc(cx + 100, cy + 50, 45, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Comic Book Style: High-contrast ink edges & Ben-Day pop dots
 */
function applyComicBookStyle(ctx: CanvasRenderingContext2D, size: number) {
  const imgData = ctx.getImageData(0, 0, size, size);
  const d = imgData.data;

  // High contrast posterization
  for (let i = 0; i < d.length; i += 4) {
    const luma = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (luma < 70) {
      d[i] = 20;
      d[i + 1] = 20;
      d[i + 2] = 40;
    } else if (luma < 140) {
      d[i] = Math.min(255, d[i] * 1.2);
      d[i + 1] = Math.max(0, d[i + 1] * 0.8);
      d[i + 2] = Math.max(0, d[i + 2] * 0.8);
    } else {
      d[i] = 255;
      d[i + 1] = 245;
      d[i + 2] = 210;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Ben-Day comic dots overlay
  ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
  const dotSpacing = 14;
  for (let y = 0; y < size; y += dotSpacing) {
    for (let x = 0; x < size; x += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Comic caption accent "ENEMY!"
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.font = '900 24px system-ui';
  ctx.strokeText('AVATAR', 24, size - 24);
  ctx.fillText('AVATAR', 24, size - 24);
}

/**
 * Low-Poly Style: Triangular mesh mosaic facet effect
 */
function applyLowPolyStyle(ctx: CanvasRenderingContext2D, size: number) {
  const step = 28;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = size;
  tempCanvas.height = size;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.drawImage(ctx.canvas, 0, 0);
  const src = tempCtx.getImageData(0, 0, size, size).data;

  ctx.clearRect(0, 0, size, size);

  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const midX = Math.min(size - 1, x + step / 2);
      const midY = Math.min(size - 1, y + step / 2);
      const idx = (Math.floor(midY) * size + Math.floor(midX)) * 4;

      const r = src[idx];
      const g = src[idx + 1];
      const b = src[idx + 2];

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;

      // Draw two interlocking triangles per cell
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + step, y);
      ctx.lineTo(x, y + step);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + step, y);
      ctx.lineTo(x + step, y + step);
      ctx.lineTo(x, y + step);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }
}
