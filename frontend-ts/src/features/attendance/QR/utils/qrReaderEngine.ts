/**
 * High-Performance Universal Cross-Browser QR Code Detection Engine
 * Integrates:
 *  1. Native Hardware-accelerated BarcodeDetector (Chrome Android/Mac/Edge)
 *  2. jsQR — battle-tested, full-spec QR decoder (all mask patterns, error correction)
 */

import jsQR from 'jsqr';

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

    // ── 1. Native BarcodeDetector (fastest, hardware-accelerated when supported) ──
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
        // Fall through to canvas-based decoding
      }
    }

    // ── 2. Canvas-based decoding via jsQR ──────────────────────────────────────
    // Draw the full video frame (not center-cropped) so the QR can be anywhere in frame.
    if (!this.ctx) return;

    const vw = this.video.videoWidth;
    const vh = this.video.videoHeight;

    if (this.canvas.width !== vw || this.canvas.height !== vh) {
      this.canvas.width = vw;
      this.canvas.height = vh;
    }

    this.ctx.drawImage(this.video, 0, 0, vw, vh);
    const imgData = this.ctx.getImageData(0, 0, vw, vh);

    // jsQR handles all 8 mask patterns, error correction, and orientation
    const result = jsQR(imgData.data, vw, vh, {
      inversionAttempts: 'dontInvert',
    });

    if (result && result.data && result.data.trim()) {
      this.handleDetected(result.data.trim());
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
