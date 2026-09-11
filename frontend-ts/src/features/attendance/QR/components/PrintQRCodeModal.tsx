import React, { useState, useRef } from 'react';
import {
  Printer,
  X,
  QrCode,
  Utensils,
  CheckCircle2,
  Info,
  ShieldCheck,
  Smartphone,
  Building2,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import QRCodeSVG from './QRCodeSVG';

interface PrintQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrPayload: string;
  hostelName: string;
  hostelId: string;
  currentMealName?: string;
}

type PosterLayout = 'a4_poster' | 'table_stand' | 'compact_sticker';

export default function PrintQRCodeModal({
  isOpen,
  onClose,
  qrPayload,
  hostelName,
  hostelId,
  currentMealName = 'All Active Meals',
}: PrintQRCodeModalProps) {
  const [layout, setLayout] = useState<PosterLayout>('a4_poster');
  const [counterTitle, setCounterTitle] = useState('Main Dining Counter');
  const [customNotice, setCustomNotice] = useState(
    'Please ensure your meal is pre-selected for today. Keep screen brightness high for instant scanning.'
  );
  const [showInstructions, setShowInstructions] = useState(true);
  const [showRules, setShowRules] = useState(true);
  const [showSignature, setShowSignature] = useState(true);

  const printAreaRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const displayHostelName = hostelName?.trim() || 'Hostel Dining Hall';
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // ── Isolated Iframe Print Engine (Eliminates Blank Paper Bugs) ───────────
  const handlePrint = () => {
    const printNode = printAreaRef.current;
    if (!printNode) {
      window.print();
      return;
    }

    // Create an invisible iframe to isolate the printable document from modal / app dark mode styles
    const iframe = document.createElement('iframe');
    iframe.setAttribute(
      'style',
      'position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;'
    );
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all stylesheets and style rules from current page
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((tag) => tag.outerHTML)
      .join('\n');

    const htmlContent = printNode.outerHTML;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>${displayHostelName} - Dining Hall QR Placard</title>
          ${styles}
          <style>
            @page {
              size: ${layout === 'table_stand' ? 'A5 landscape' : layout === 'compact_sticker' ? 'A5 portrait' : 'A4 portrait'};
              margin: 8mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            }
            body {
              display: flex !important;
              justify-content: center !important;
              align-items: flex-start !important;
              padding: 8mm 0 !important;
            }
            #printable-qr-sheet {
              width: 100% !important;
              max-width: ${layout === 'compact_sticker' ? '420px' : layout === 'table_stand' ? '680px' : '620px'} !important;
              margin: 0 auto !important;
              padding: ${layout === 'compact_sticker' ? '20px' : '32px'} !important;
              background: #ffffff !important;
              color: #000000 !important;
              border: 2px solid #000000 !important;
              border-radius: 16px !important;
              box-shadow: none !important;
            }
            /* High contrast text guarantees for thermal / laser printer paper */
            h1, h2, h3, h4, p, span, div, strong {
              color: #000000 !important;
            }
            .text-zinc-600, .text-zinc-700, .text-zinc-500, .text-muted-foreground {
              color: #27272a !important;
            }
            .border-zinc-200, .border-zinc-300, .border-zinc-400 {
              border-color: #a1a1aa !important;
            }
            .bg-zinc-50, .bg-zinc-100 {
              background-color: #f4f4f5 !important;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);
    doc.close();

    // Small delay ensures fonts, stylesheets, and SVG images are rasterized before opening print dialog
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print iframe error, fallback to window.print:', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }
    }, 250);
  };

  return (
    <>
      {/* ── Modal Backdrop & Dialog Shell ─────────────────────────────────── */}
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-card text-card-foreground border border-border w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
          
          {/* Modal Topbar */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3 bg-muted/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground leading-tight">
                  Print Counter QR Code for Paper
                </h3>
                <p className="text-xs text-muted-foreground">
                  Generate high-contrast, ready-to-print dining hall posters, counter stands, or stickers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Paper</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Main Body: Sidebar Settings + Interactive Paper Preview */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            
            {/* Left Column: Layout & Customization Controls */}
            <div className="lg:col-span-4 p-5 border-b lg:border-b-0 lg:border-r border-border bg-muted/15 overflow-y-auto space-y-5">
              
              {/* Layout Format Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
                  Paper Layout & Format
                </label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setLayout('a4_poster')}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                      layout === 'a4_poster'
                        ? 'bg-card border-emerald-500/80 shadow-xs ring-1 ring-emerald-500/40'
                        : 'bg-card/50 border-border/70 hover:bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">A4 Wall Poster</div>
                      <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                        Full-page notice with step-by-step instructions. Ideal for walls & doors.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayout('table_stand')}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                      layout === 'table_stand'
                        ? 'bg-card border-emerald-500/80 shadow-xs ring-1 ring-emerald-500/40'
                        : 'bg-card/50 border-border/70 hover:bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Table Stand / Tent Card</div>
                      <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                        Compact landscape layout for acrylic tabletop stands or folded counter cards.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayout('compact_sticker')}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                      layout === 'compact_sticker'
                        ? 'bg-card border-emerald-500/80 shadow-xs ring-1 ring-emerald-500/40'
                        : 'bg-card/50 border-border/70 hover:bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mt-0.5">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Compact Sticker / Placard</div>
                      <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                        High-density QR with essential label. Perfect for cash counters & tray lines.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Editable Counter & Notice Settings */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Counter / Station Name
                  </label>
                  <input
                    type="text"
                    value={counterTitle}
                    onChange={(e) => setCounterTitle(e.target.value)}
                    placeholder="e.g. Main Dining Counter, Counter 1"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Custom Dining Notice / Guidelines
                  </label>
                  <textarea
                    rows={2}
                    value={customNotice}
                    onChange={(e) => setCustomNotice(e.target.value)}
                    placeholder="Notice to display below the QR code..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 resize-none"
                  />
                </div>
              </div>

              {/* Toggle Sections */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Include Sections
                </span>

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showInstructions}
                    onChange={(e) => setShowInstructions(e.target.checked)}
                    className="rounded border-border text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                  />
                  <span>3-Step Scanning Guide</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showRules}
                    onChange={(e) => setShowRules(e.target.checked)}
                    className="rounded border-border text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                  />
                  <span>Dining Hall Guidelines Box</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showSignature}
                    onChange={(e) => setShowSignature(e.target.checked)}
                    className="rounded border-border text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                  />
                  <span>Warden / Supervisor Sign-off Line</span>
                </label>
              </div>

              {/* Print & PDF Export Tip */}
              <div className="pt-3 border-t border-border/60">
                <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-muted-foreground space-y-1.5">
                  <div className="font-bold text-foreground flex items-center gap-1.5 text-[11px]">
                    <Printer className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Direct Paper &amp; PDF Export</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Click <strong>Print Paper</strong> to send directly to your printer. To save a high-res digital copy for WhatsApp or email, choose <em>&quot;Save as PDF&quot;</em> in your browser&apos;s print dialog.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Paper Sheet Preview & Printable Area */}
            <div className="lg:col-span-8 p-4 sm:p-8 bg-zinc-200/60 dark:bg-zinc-950 flex flex-col items-center justify-start overflow-y-auto">
              
              {/* Paper Preview Header Badge */}
              <div className="mb-4 flex items-center justify-between w-full max-w-[620px] text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  Paper Print Preview ({layout === 'table_stand' ? 'A5 Landscape' : layout === 'compact_sticker' ? 'Compact' : 'A4 Portrait'})
                </span>
                <span className="text-[11px] font-mono bg-background/80 border border-border px-2 py-0.5 rounded-md">
                  Black &amp; White High-Contrast
                </span>
              </div>

              {/* ─────────────────────────────────────────────────────────────── */}
              {/* THE PRINTABLE SHEET DOCUMENT (Visible to print engine & preview) */}
              {/* ─────────────────────────────────────────────────────────────── */}
              <div
                ref={printAreaRef}
                id="printable-qr-sheet"
                className={`w-full max-w-[620px] bg-white text-black rounded-xl shadow-xl border-2 border-zinc-300 p-8 sm:p-10 font-sans transition-all ${
                  layout === 'compact_sticker' ? 'max-w-[440px] p-6' : ''
                }`}
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              >
                {/* Printable Header */}
                <div className="text-center space-y-2 border-b-2 border-black pb-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 border border-black rounded-full text-[11px] font-bold tracking-widest uppercase mb-1">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Mess &amp; Dining Hall Check-In</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-none">
                    {displayHostelName}
                  </h1>

                  <div className="flex items-center justify-center gap-3 text-xs font-semibold text-zinc-700">
                    <span className="px-2.5 py-0.5 bg-zinc-100 border border-zinc-400 rounded-md font-mono text-[11px]">
                      {counterTitle || 'Main Dining Counter'}
                    </span>
                    <span>&bull;</span>
                    <span>{currentMealName}</span>
                  </div>
                </div>

                {/* Central QR Code Hero Display */}
                <div className="py-6 sm:py-8 text-center space-y-4">
                  <div className="inline-block p-4 sm:p-5 bg-white border-4 border-black rounded-2xl shadow-none">
                    {qrPayload ? (
                      <QRCodeSVG
                        value={qrPayload}
                        size={layout === 'compact_sticker' ? 220 : 270}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        includeMargin={false}
                        className="mx-auto"
                      />
                    ) : (
                      <div className="w-56 h-56 flex items-center justify-center text-xs font-mono text-zinc-500">
                        No QR Data Available
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-base sm:text-lg font-black tracking-wide uppercase">
                      Scan with MessPro App
                    </div>
                    <p className="text-xs text-zinc-600 font-medium max-w-sm mx-auto">
                      Open your camera or go to <span className="font-mono font-bold">/app/meals/qr</span> on your phone to register your meal.
                    </p>
                  </div>
                </div>

                {/* 3-Step Scanning Guide */}
                {showInstructions && layout !== 'compact_sticker' && (
                  <div className="border-t-2 border-b-2 border-zinc-200 py-4 my-2">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-200">
                        <div className="w-5 h-5 rounded-full bg-black text-white font-bold flex items-center justify-center mx-auto mb-1 text-[11px]">
                          1
                        </div>
                        <span className="font-bold block text-[11px]">Open App</span>
                        <span className="text-[10px] text-zinc-500 leading-tight block mt-0.5">
                          Log in to MessPro &amp; open Meal Scanner
                        </span>
                      </div>

                      <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-200">
                        <div className="w-5 h-5 rounded-full bg-black text-white font-bold flex items-center justify-center mx-auto mb-1 text-[11px]">
                          2
                        </div>
                        <span className="font-bold block text-[11px]">Scan Counter QR</span>
                        <span className="text-[10px] text-zinc-500 leading-tight block mt-0.5">
                          Aim your camera at this poster
                        </span>
                      </div>

                      <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-200">
                        <div className="w-5 h-5 rounded-full bg-black text-white font-bold flex items-center justify-center mx-auto mb-1 text-[11px]">
                          3
                        </div>
                        <span className="font-bold block text-[11px]">Collect Meal</span>
                        <span className="text-[10px] text-zinc-500 leading-tight block mt-0.5">
                          Confirmation beep sounds on approval
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dining Hall Guidelines / Custom Notice */}
                {showRules && (
                  <div className="mt-4 p-3 bg-zinc-50 border border-zinc-300 rounded-lg text-left text-[11px] space-y-1">
                    <div className="font-bold uppercase tracking-wider text-[10px] text-zinc-700 flex items-center gap-1">
                      <Info className="w-3 h-3 text-black" />
                      <span>Important Dining Notice:</span>
                    </div>
                    <p className="text-zinc-700 leading-relaxed">
                      {customNotice ||
                        'Pre-selection is required for meal attendance. External guests must seek manager approval before dining.'}
                    </p>
                  </div>
                )}

                {/* Sign-off Line for Warden / Mess Supervisor */}
                {showSignature && layout === 'a4_poster' && (
                  <div className="pt-8 grid grid-cols-2 gap-8 text-[11px] text-zinc-600">
                    <div className="border-t border-zinc-400 pt-1.5">
                      <span className="block font-semibold">Mess Supervisor / Incharge</span>
                      <span className="text-[10px] text-zinc-400">Signature &amp; Stamp</span>
                    </div>
                    <div className="border-t border-zinc-400 pt-1.5 text-right">
                      <span className="block font-semibold">Hostel Warden Authorization</span>
                      <span className="text-[10px] text-zinc-400">Date Verified</span>
                    </div>
                  </div>
                )}

                {/* Document Security Footer */}
                <div className="mt-6 pt-3 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-black" />
                    <span>OFFICIAL MESSPRO VERIFIED ATTENDANCE TOKEN</span>
                  </div>
                  <div>
                    <span>Hostel: {hostelId?.slice(-6) || 'AUTH'} &bull; {currentDate}</span>
                  </div>
                </div>
              </div>

              {/* Printable sheet paper shadow disclaimer */}
              <div className="mt-4 text-center text-xs text-muted-foreground">
                <span>Tip: For best durability, print on thick cardstock (180–250 GSM) and laminate before mounting.</span>
              </div>

            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Static hostel identifier embedded. This printed code remains valid permanently.</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Paper Poster</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
