/**
 * Standalone mock for signature detection.
 * In production, this would call a computer vision model endpoint.
 */

import type { SignatureDetectionResult } from '../types/ocr';

export interface SignatureDetectionOptions {
  simulateAbsent?: boolean;
  forcedScore?: number; // Optional: override random score for testing
}

export function mockSignatureDetection(
  options: SignatureDetectionOptions = {},
): SignatureDetectionResult {
  const { simulateAbsent = false, forcedScore } = options;

  if (simulateAbsent) {
    return {
      signaturePresent: false,
      signatureZoneScore: 0.11,
      signaturePosition: null,
    };
  }

  const score = forcedScore ?? (0.72 + Math.random() * 0.23);
  return {
    signaturePresent: score > 0.6,
    signatureZoneScore: Number.parseFloat(score.toFixed(3)),
    signaturePosition: {
      x: 0.58 + (Math.random() - 0.5) * 0.04,
      y: 0.72 + (Math.random() - 0.5) * 0.03,
      w: 0.28,
      h: 0.13,
    },
  };
}
