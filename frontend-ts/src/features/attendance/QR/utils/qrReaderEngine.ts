/**
 * High-Performance Universal Cross-Browser QR Code Detection Engine
 * Integrates:
 *  1. Native Hardware-accelerated BarcodeDetector (when supported)
 *  2. Optimized Sub-3ms Pure TypeScript Canvas QR Decoder
 */

import { decodeQRFromImageDataFast } from './pureQrDecoder';

export interface QRScanResult {
  rawValue: string;
}

export class QRReaderEngine {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private barcodeDetector: any = null;
  private isRunning: boolean = false;
  private isBusy: boolean = false;
  private isPaused: boolean = false;
  private rafId: number | null = null;
  private onResultCallback: ((result: string) => void) | null = null;
  private lastScanTime: number = 0;
  private lastScannedText: string = '';
  private scanCooldownMs: number = 2500; // Safe default debounce

  constructor(video: HTMLVideoElement, onResult: (result: string) => void) {
    this.video = video;
    this.onResultCallback = onResult;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        this.barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      } catch {
        this.barcodeDetector = null;
      }
    }
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isBusy = false;
    this.isPaused = false;
    this.lastScanTime = 0;
    this.lastScannedText = '';
    this.loop();
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
    this.lastScanTime = performance.now();
  }

  public stop(): void {
    this.isRunning = false;
    this.isBusy = false;
    this.isPaused = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public setCooldown(ms: number) {
    this.scanCooldownMs = ms;
  }

  public resetCooldown() {
    this.lastScannedText = '';
    this.lastScanTime = 0;
  }

  private loop = async (): Promise<void> => {
    if (!this.isRunning || this.isPaused) return;

    if (this.video.readyState >= 2 && !this.video.paused && !this.video.ended && !this.isBusy) {
      const now = performance.now();
      // Tick scan every 60ms without blocking 60fps video
      if (now - this.lastScanTime >= 60) {
        this.lastScanTime = now;
        this.isBusy = true;
        try {
          await this.detectFrame();
        } finally {
          this.isBusy = false;
        }
      }
    }

    if (this.isRunning) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  };

  private async detectFrame(): Promise<void> {
    if (!this.video || this.video.videoWidth === 0 || this.video.videoHeight === 0) return;

    // 1. Try Native BarcodeDetector (Fastest & hardware-accelerated when supported)
    if (this.barcodeDetector) {
      try {
        const barcodes = await this.barcodeDetector.detect(this.video);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          const raw = barcodes[0].rawValue.trim();
          if (raw) {
            this.handleDetected(raw);
            return;
          }
        }
      } catch {
        // Fall back to canvas processing
      }
    }

    // 2. Center-Cropped Canvas Frame Processing (250x250 for instant sub-3ms decoding)
    if (!this.ctx) return;

    const vw = this.video.videoWidth;
    const vh = this.video.videoHeight;
    const cropSize = Math.min(vw, vh);
    const sx = (vw - cropSize) >> 1;
    const sy = (vh - cropSize) >> 1;

    const targetDim = 260; // Optimal matrix resolution for standard QR codes
    if (this.canvas.width !== targetDim || this.canvas.height !== targetDim) {
      this.canvas.width = targetDim;
      this.canvas.height = targetDim;
    }

    // Draw center of video stream
    this.ctx.drawImage(this.video, sx, sy, cropSize, cropSize, 0, 0, targetDim, targetDim);

    // Try canvas with BarcodeDetector
    if (this.barcodeDetector) {
      try {
        const barcodes = await this.barcodeDetector.detect(this.canvas);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          const raw = barcodes[0].rawValue.trim();
          if (raw) {
            this.handleDetected(raw);
            return;
          }
        }
      } catch {
        // Fall back to pure QR decoder
      }
    }

    // 3. Ultra-Fast Pure TypeScript In-Browser QR Decoder (< 3ms)
    try {
      const imgData = this.ctx.getImageData(0, 0, targetDim, targetDim);
      const decoded = decodeQRFromImageDataFast(imgData.data, targetDim, targetDim);
      if (decoded && decoded.trim()) {
        this.handleDetected(decoded.trim());
      }
    } catch {
      // Frame scan pass
    }
  }

  private handleDetected(text: string) {
    if (!text) return;
    const now = performance.now();

    if (text === this.lastScannedText && now - this.lastScanTime < this.scanCooldownMs) {
      return;
    }

    this.lastScannedText = text;
    if (this.onResultCallback) {
      this.onResultCallback(text);
    }
  }
}
