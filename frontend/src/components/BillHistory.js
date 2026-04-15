import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBills, getBill, downloadBillPdf } from '../api';

export default function BillHistory() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBills = useCallback(async () => {
    try {
      const data = await getBills();
      setBills(data);
    } catch (err) {
      console.error('Failed to load bills:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const viewBill = async (id) => {
    try {
      const bill = await getBill(id);
      setSelectedBill(bill);
    } catch (err) {
      console.error('Failed to load bill:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="history-loading">
        <div className="w-8 h-8 border-2 border-cafe-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="bill-history">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading font-medium text-3xl text-cafe-text tracking-tight">
            Bill History
          </h1>
          <p className="text-cafe-text-muted text-sm mt-1 font-body">
            {bills.length} bills generated
          </p>
        </div>
        {selectedBill && (
          <button
            onClick={() => setSelectedBill(null)}
            data-testid="back-to-list-btn"
            className="px-4 py-2 text-sm font-heading font-medium text-cafe-text-muted hover:text-cafe-text border border-cafe-border rounded-xl hover:bg-cafe-bg transition-colors"
          >
            Back to list
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selectedBill ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            data-testid="bill-detail"
          >
            <BillDetail bill={selectedBill} onPrint={handlePrint} />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {bills.length === 0 ? (
              <div className="text-center py-16 text-cafe-text-muted" data-testid="no-bills-msg">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-30">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <p className="font-body text-sm">No bills yet</p>
                <p className="font-body text-xs mt-1">Bills will appear here after checkout</p>
              </div>
            ) : (
              <div className="bg-cafe-surface rounded-2xl border border-cafe-border overflow-hidden" data-testid="bills-table">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cafe-border">
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-[0.2em] font-bold text-cafe-secondary font-body">Bill #</th>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-[0.2em] font-bold text-cafe-secondary font-body">Customer</th>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-[0.2em] font-bold text-cafe-secondary font-body">Items</th>
                      <th className="px-5 py-3 text-right text-xs uppercase tracking-[0.2em] font-bold text-cafe-secondary font-body">Total</th>
                      <th className="px-5 py-3 text-right text-xs uppercase tracking-[0.2em] font-bold text-cafe-secondary font-body">Date</th>
                      <th className="px-5 py-3 text-right text-xs uppercase tracking-[0.2em] font-bold text-cafe-secondary font-body">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr
                        key={bill.id}
                        className="border-b border-cafe-border/50 last:border-0 hover:bg-cafe-bg/50 transition-colors"
                        data-testid={`bill-row-${bill.id}`}
                      >
                        <td className="px-5 py-4 font-body font-semibold text-sm text-cafe-text">{bill.bill_number}</td>
                        <td className="px-5 py-4 font-body text-sm text-cafe-text-muted">{bill.customer_name || '—'}</td>
                        <td className="px-5 py-4 font-body text-sm text-cafe-text-muted">{bill.items?.length || 0}</td>
                        <td className="px-5 py-4 font-body font-semibold text-sm text-cafe-text text-right">${bill.total.toFixed(2)}</td>
                        <td className="px-5 py-4 font-body text-xs text-cafe-text-muted text-right">
                          {new Date(bill.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => downloadBillPdf(bill.id)}
                            data-testid={`download-bill-${bill.id}`}
                            className="text-cafe-secondary hover:text-cafe-text text-sm font-body font-medium transition-colors"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => viewBill(bill.id)}
                            data-testid={`view-bill-${bill.id}`}
                            className="text-cafe-primary hover:text-cafe-primary-hover text-sm font-body font-medium transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BillDetail({ bill, onPrint }) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-cafe-surface rounded-3xl border border-cafe-border p-8 shadow-[0_4px_40px_rgba(0,0,0,0.04)]" data-testid="bill-receipt">
        {/* Receipt Header */}
        <div className="text-center mb-6 pb-6 border-b border-dashed border-cafe-border">
          <div className="w-12 h-12 rounded-2xl bg-cafe-primary mx-auto mb-3 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M2,21H20V19H2M20,8H18V5H20M20,3H4V13A4,4 0 0,0 8,17H14A4,4 0 0,0 18,13V10H20A2,2 0 0,0 22,8V5A2,2 0 0,0 20,3Z"/>
            </svg>
          </div>
          <h3 className="font-heading font-medium text-xl text-cafe-text">Cafe POS</h3>
          <p className="font-body text-xs text-cafe-text-muted mt-1">Thank you for your order!</p>
        </div>

        {/* Bill Info */}
        <div className="flex justify-between mb-4 text-sm font-body">
          <div>
            <p className="text-cafe-text-muted text-xs">Bill Number</p>
            <p className="font-semibold text-cafe-text" data-testid="receipt-bill-number">{bill.bill_number}</p>
          </div>
          <div className="text-right">
            <p className="text-cafe-text-muted text-xs">Date</p>
            <p className="font-semibold text-cafe-text">
              {new Date(bill.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        {bill.customer_name && (
          <p className="text-sm font-body text-cafe-text-muted mb-4">Customer: <span className="text-cafe-text font-medium">{bill.customer_name}</span></p>
        )}

        {/* Items */}
        <div className="border-t border-dashed border-cafe-border pt-4 mb-4 space-y-2">
          {bill.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm font-body" data-testid={`receipt-item-${i}`}>
              <div className="flex-1">
                <span className="text-cafe-text">{item.name}</span>
                <span className="text-cafe-text-muted ml-2">x{item.quantity}</span>
              </div>
              <span className="text-cafe-text font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-dashed border-cafe-border pt-4 space-y-2 text-sm font-body">
          <div className="flex justify-between text-cafe-text-muted">
            <span>Subtotal</span>
            <span>${bill.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-cafe-text-muted">
            <span>Tax ({bill.tax_rate}%)</span>
            <span>+${bill.tax_amount.toFixed(2)}</span>
          </div>
          {bill.discount_percent > 0 && (
            <div className="flex justify-between text-cafe-success">
              <span>Discount ({bill.discount_percent}%)</span>
              <span>-${bill.discount_amount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-cafe-text font-bold text-xl pt-3 border-t border-cafe-border">
            <span>Total</span>
            <span data-testid="receipt-total">${bill.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 no-print">
          <button
            onClick={() => downloadBillPdf(bill.id)}
            data-testid="download-pdf-btn"
            className="flex-1 py-3 rounded-2xl font-heading font-medium text-sm border border-cafe-border text-cafe-text hover:bg-cafe-bg transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF
          </button>
          <button
            onClick={onPrint}
            data-testid="print-bill-btn"
            className="flex-1 py-3 rounded-2xl font-heading font-medium text-sm bg-cafe-primary text-white hover:bg-cafe-primary-hover transition-colors"
          >
            Print Bill
          </button>
        </div>
      </div>
    </div>
  );
}
