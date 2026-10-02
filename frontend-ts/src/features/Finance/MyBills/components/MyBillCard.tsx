import React from 'react'
import {
  Receipt,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  User,
  Calendar,
  Hash,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import type { Bill } from '@/hooks/queries/useBillingQueries'
import { Button } from '@/components/ui/button'

interface MyBillCardProps {
  bill: Bill
}

export function printBillReceipt(
  bill: Bill,
  hostelName: string,
  studentName: string,
  rollNumber: string
) {
  const isPaid = bill.status === 'Paid'
  const isAdjusted = bill.status === 'Adjusted in Balance'
  const statusColor = isPaid ? '#059669' : isAdjusted ? '#475569' : '#d97706'
  const statusBg = isPaid ? '#ecfdf5' : isAdjusted ? '#f1f5f9' : '#fffbeb'

  const formattedDate = bill.createdAt
    ? new Date(bill.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    : new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

  const printIframe = document.createElement('iframe')
  printIframe.style.position = 'fixed'
  printIframe.style.right = '0'
  printIframe.style.bottom = '0'
  printIframe.style.width = '0'
  printIframe.style.height = '0'
  printIframe.style.border = '0'
  document.body.appendChild(printIframe)

  const doc = printIframe.contentWindow?.document
  if (!doc) return

  const customChargesHtml = (bill.customCharges || [])
    .map(
      (c) => `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">
          <strong>${c.name}</strong>
          <div style="font-size: 11px; color: #64748b;">${c.chargeType === 'addition'
          ? 'Fixed addition'
          : c.chargeType === 'multiplier'
            ? 'Per-portion fee'
            : 'Surcharge'
        }</div>
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-family: monospace; font-weight: 600; color: #0f172a;">
          Rs. ${(c.calculatedAmount || 0).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('')

  const arrearsHtml =
    bill.previousUnpaidArrears > 0
      ? `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #b45309;">
          <strong>Previous Unpaid Arrears</strong>
          <div style="font-size: 11px; color: #92400e;">Outstanding balance from prior billing cycle</div>
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-family: monospace; font-weight: 700; color: #b45309;">
          Rs. ${bill.previousUnpaidArrears.toLocaleString()}
        </td>
      </tr>
    `
      : ''

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Fee Receipt - ${bill._id}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          body {
            color: #0f172a;
            background: #ffffff;
            padding: 20px;
          }
          .receipt-container {
            max-width: 720px;
            margin: 0 auto;
            border: 2px solid #cbd5e1;
            border-radius: 12px;
            padding: 28px;
            position: relative;
          }
          .header-table {
            width: 100%;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 18px;
            margin-bottom: 20px;
          }
          .hostel-title {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: -0.5px;
            text-transform: uppercase;
            color: #0f172a;
          }
          .invoice-subtitle {
            font-size: 12px;
            font-weight: 700;
            color: #7c3aed;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-top: 2px;
          }
          .status-stamp {
            display: inline-block;
            padding: 6px 14px;
            border: 2px solid ${statusColor};
            border-radius: 6px;
            color: ${statusColor};
            background-color: ${statusBg};
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: center;
          }
          .info-grid {
            display: table;
            width: 100%;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px;
            margin-bottom: 20px;
          }
          .info-col {
            display: table-cell;
            width: 50%;
            vertical-align: top;
          }
          .info-col-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            text-align: right;
          }
          .field-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            font-weight: 700;
          }
          .field-value {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 2px;
          }
          .field-sub {
            font-size: 12px;
            color: #475569;
            font-family: monospace;
            margin-top: 2px;
          }
          .line-items-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 20px;
          }
          .line-items-table th {
            background-color: #f1f5f9;
            color: #475569;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 10px 14px;
            border-bottom: 1px solid #cbd5e1;
            text-align: left;
          }
          .line-items-table th:last-child {
            text-align: right;
          }
          .totals-table {
            width: 280px;
            margin-left: auto;
            border-collapse: collapse;
            margin-bottom: 28px;
          }
          .totals-table td {
            padding: 6px 0;
            font-size: 13px;
          }
          .totals-table .total-row {
            border-top: 2px solid #0f172a;
            padding-top: 8px;
            font-size: 16px;
            font-weight: 900;
          }
          .sig-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #475569;
          }
          .footer-note {
            margin-top: 25px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <table class="header-table">
            <tr>
              <td>
                <div class="invoice-subtitle">Official Student Mess Statement</div>
                <div class="hostel-title">${hostelName || 'HOSTEL RESIDENCE'}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 3px;">
                  Invoice Ref ID: <span style="font-family: monospace; font-weight: 700; color: #0f172a;">${bill._id}</span>
                </div>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <div class="status-stamp">${bill.status}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
                  Issue Date: <strong style="color: #0f172a;">${formattedDate}</strong>
                </div>
              </td>
            </tr>
          </table>

          <div class="info-grid">
            <div class="info-col">
              <div class="field-label">Billed Resident</div>
              <div class="field-value">${studentName}</div>
              <div class="field-sub">Roll Number: ${rollNumber}</div>
            </div>
            <div class="info-col-right">
              <div class="field-label">Billing Cycle</div>
              <div class="field-value" style="font-family: monospace;">${bill.billingPeriod?.startDate} &rarr; ${bill.billingPeriod?.endDate}</div>
              <div class="field-sub">${bill.isGuest ? 'Dining Guest' : 'Hostel Resident Student'}</div>
            </div>
          </div>

          <table class="line-items-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Amount (PKR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a;">
                  <strong>Base Mess Bill</strong>
                  <div style="font-size: 11px; color: #64748b;">Dining hall meals & verified meal attendance</div>
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">
                  Rs. ${(bill.baseMessBill || 0).toLocaleString()}
                </td>
              </tr>
              ${arrearsHtml}
              ${customChargesHtml}
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td style="color: #64748b; font-weight: 600;">Total Invoiced:</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">
                Rs. ${(bill.total || 0).toLocaleString()}
              </td>
            </tr>
            <tr>
              <td style="color: #059669; font-weight: 600;">Amount Paid:</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700; color: #059669;">
                - Rs. ${(bill.paidBill || 0).toLocaleString()}
              </td>
            </tr>
            <tr class="total-row">
              <td style="color: ${bill.remainingBill > 0 ? '#b45309' : '#059669'};">Balance Due:</td>
              <td style="text-align: right; font-family: monospace; color: ${bill.remainingBill > 0 ? '#b45309' : '#059669'
    };">
                Rs. ${(bill.remainingBill || 0).toLocaleString()}
              </td>
            </tr>
          </table>

          <div style="display: flex; justify-content: space-between; margin-top: 35px;">
            <div style="width: 200px; text-align: center;">
              <div style="border-top: 1px solid #475569; margin-bottom: 4px;"></div>
              <span class="sig-label">Resident Signature</span>
            </div>
            <div style="width: 200px; text-align: center;">
              <div style="border-top: 1px solid #475569; margin-bottom: 4px;"></div>
              <span class="sig-label">Authorized Stamp</span>
            </div>
          </div>

          <div class="footer-note">
            This is an official computer-generated receipt from MessPro Hostel Management System. Verified by Hostel Administration.
          </div>
        </div>
      </body>
    </html>
  `

  doc.open()
  doc.write(html)
  doc.close()

  printIframe.contentWindow?.focus()
  setTimeout(() => {
    printIframe.contentWindow?.print()
    setTimeout(() => {
      document.body.removeChild(printIframe)
    }, 1500)
  }, 250)
}

export default function MyBillCard({ bill }: MyBillCardProps) {
  const { currentHostel } = useSelector((state: RootState) => state.hostel)
  const { user: authUser } = useSelector((state: RootState) => state.auth)

  const isPaid = bill.status === 'Paid'
  const isAdjusted = bill.status === 'Adjusted in Balance'

  const hostelName =
    (typeof bill.hostelId === 'object' && (bill.hostelId as any)?.name) ||
    currentHostel?.name ||
    'Hostel Residence'

  const studentName =
    bill.studentId?.name || authUser?.name || (bill.isGuest ? 'Dining Guest' : 'Resident Student')
  const rollNumber = bill.rollNumber || bill.studentId?.id || (authUser as any)?.rollNumber || 'N/A'

  const formattedDate = bill.createdAt
    ? new Date(bill.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const handlePrint = () => {
    printBillReceipt(bill, hostelName, studentName, rollNumber)
  }

  return (
    <div className="bg-card border border-border/80 rounded-2xl shadow-xs hover:border-purple-500/40 transition-all overflow-hidden flex flex-col">
      {/* ── 1. Top Section: Invoice Header, Hostel Name, Ref ID & Issue Date ── */}
      <div className="p-5 sm:p-6 border-b border-border/60 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">

            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-500 shrink-0" />
              <span>{hostelName}</span>
            </h3>

            <p className="text-xs text-muted-foreground">
              Official statement for mess dues & hostel charges
            </p>
          </div>

          <div className="flex sm:flex-col sm:items-end justify-between items-center gap-2">
            {/* Status Stamp */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs ${isPaid
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : isAdjusted
                    ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}
            >
              {isPaid ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : isAdjusted ? (
                <Clock className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              <span>{bill.status}</span>
            </span>

            <span className="text-xs text-muted-foreground font-medium">
              Issue Date: <span className="font-semibold text-foreground">{formattedDate}</span>
            </span>
          </div>
        </div>

        {/* ── 2. Billed Resident & Billed Cycle Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4 p-3.5 rounded-xl bg-background border border-border/70 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Billed Resident
            </span>
            <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span>{studentName}</span>
            </div>
            <div className="text-muted-foreground font-mono text-[11px]">
              Roll Number: <span className="text-foreground font-semibold">{rollNumber}</span>
            </div>
          </div>

          <div className="space-y-0.5 sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Billed Cycle
            </span>
            <div className="font-bold font-mono text-foreground text-xs flex sm:justify-end items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span>
                {bill.billingPeriod?.startDate} &rarr; {bill.billingPeriod?.endDate}
              </span>
            </div>
            <div className="text-muted-foreground text-[11px]">
              Category: {bill.isGuest ? 'Dining Guest' : 'Hostel Resident'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Amounts Table: Starting from Base Meal Bill and so on ── */}
      <div className="p-5 sm:p-6 space-y-4 flex-1">
        <div className="border border-border/80 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border/70">
              <tr>
                <th className="py-2.5 px-4 text-[11px]">Charge Description</th>
                <th className="py-2.5 px-4 text-right text-[11px]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {/* Base Mess Bill */}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-foreground">Base Meal Bill</p>
                  <p className="text-[11px] text-muted-foreground">
                    Confirmed dining hall attendance & meal portions
                  </p>
                </td>
                <td className="py-3 px-4 text-right font-bold font-mono text-foreground">
                  Rs. {(bill.baseMessBill || 0).toLocaleString()}
                </td>
              </tr>

              {/* Previous Arrears */}
              {bill.previousUnpaidArrears > 0 && (
                <tr className="hover:bg-muted/20 transition-colors bg-amber-500/5">
                  <td className="py-3 px-4">
                    <p className="font-bold text-amber-600 dark:text-amber-400">
                      Previous Unpaid Arrears
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Carried forward rollover from prior billing cycle
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right font-bold font-mono text-amber-600 dark:text-amber-400">
                    Rs. {bill.previousUnpaidArrears.toLocaleString()}
                  </td>
                </tr>
              )}

              {/* Itemized Custom Charges */}
              {(bill.customCharges || []).map((charge, idx) => (
                <tr key={idx} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-foreground">{charge.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {charge.chargeType === 'addition'
                        ? 'Standard institutional charge'
                        : charge.chargeType === 'multiplier'
                          ? 'Per-portion consumption factor'
                          : 'Percentage surcharge'}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right font-bold font-mono text-foreground">
                    Rs. {(charge.calculatedAmount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── 4. Totals Breakdown: Total Invoiced, Paid & Balance Due ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/30 border border-border/70">
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 flex-1">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Total Invoiced
              </span>
              <span className="text-base font-bold text-foreground font-mono">
                Rs. {(bill.total || 0).toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Amount Paid
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                Rs. {(bill.paidBill || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border-t sm:border-t-0 sm:border-l border-border/80 pt-3 sm:pt-0 sm:pl-5 text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              Balance Due
            </span>
            <span
              className={`text-xl sm:text-2xl font-black font-mono ${bill.remainingBill > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
                }`}
            >
              Rs. {(bill.remainingBill || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ── 5. Slip Footer: Legitimate Print Receipt Button ── */}
      <div className="px-5 py-3.5 bg-muted/40 border-t border-border/60 flex items-center justify-between gap-3">
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Official computer-generated voucher &bull; Instant print ready
        </span>

        <Button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-auto h-9 px-4 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Receipt</span>
        </Button>
      </div>
    </div>
  )
}
