import type { ImageQualityResult } from '../types/ocr';

export function assessImageQuality(file: File | null): ImageQualityResult {
  const sizeKB = file ? file.size / 1024 : 500;
  const baseScore = sizeKB < 100 ? 0.45 : sizeKB < 500 ? 0.72 : 0.88;
  const variance = (Math.random() - 0.5) * 0.1;
  const overall = Math.max(0.1, Math.min(1.0, baseScore + variance));

  return {
    overallScore: Number.parseFloat(overall.toFixed(3)),
    lighting: Number.parseFloat(
      Math.max(0.1, Math.min(1.0, overall + (Math.random() - 0.5) * 0.08)).toFixed(3),
    ),
    blur: Number.parseFloat(Math.max(0, Math.min(1.0, 1 - overall + Math.random() * 0.1)).toFixed(3)),
    skew: Number.parseFloat((Math.random() * 3.5).toFixed(2)),
  };
}
