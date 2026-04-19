import { simulateDelay } from '../utils/delay';
import type { DocumentType } from '../types/document';

export interface ClassificationResult {
  predictedType: DocumentType;
  confidence: number;
}

export async function mockClassify(documentType: DocumentType): Promise<ClassificationResult> {
  await simulateDelay(200, 400);
  return {
    predictedType: documentType,
    confidence: Number.parseFloat((0.92 + Math.random() * 0.07).toFixed(3)),
  };
}
