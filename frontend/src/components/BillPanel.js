import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BillPanel({
  billItems,
  updateQuantity,
  subtotal,
  taxRate,
  taxAmount,
  discount,
  setDiscount,
  discountAmount,
  total,
  customerName,
  setCustomerName,
  onCharge,
  onClear,
}) {
  return (
    <div
      className="bg-cafe-surface rounded-3xl border border-cafe-border shadow-[0_4px_40px_rgba(0,0,0,0.04)] flex flex-col h-full max-h-[calc(100vh-4rem)]"
      data-testid="bill-panel"
    >
      {/* Header */}
      <div className="p-5 border-b border-cafe-border flex items-center justify-between">
        <div>
          <h2 className="font-heading font-medium text-lg text-cafe-text">Current Order</h2>
          <p className="text-xs text-cafe-text-muted font-body">
            {billItems.length} {billItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        {billItems.length > 0 && (
          <button
            onClick={onClear}
            data-testid="clear-bill-btn"
            className="text-xs text-cafe-danger font-body font-medium hover:underline transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Customer Name */}
      <div className="px-5 pt-4">
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer name (optional)"
          data-testid="customer-name-input"
          className="w-full px-3 py-2 text-sm font-body border border-cafe-border rounded-xl bg-cafe-bg focus:outline-none focus:ring-2 focus:ring-cafe-primary focus:ring-offset-2 focus:ring-offset-cafe-surface placeholder:text-cafe-text-muted/50 text-cafe-text"
        />
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0" data-testid="bill-items-list">
        <AnimatePresence mode="popLayout">
          {billItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-cafe-text-muted"
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-30">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p className="text-sm font-body">No items yet</p>
              <p className="text-xs mt-1 font-body">Tap menu items to add</p>
            </motion.div>
          ) : (
            billItems.map((item) => (
              <motion.div
                key={item.menu_item_id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-cafe-bg/50"
                data-testid={`bill-item-${item.menu_item_id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-medium text-sm text-cafe-text truncate">{item.name}</p>
                  <p className="font-body text-xs text-cafe-text-muted">${item.price.toFixed(2)} each</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.menu_item_id, -1); }}
                    data-testid={`bill-decrease-qty-${item.menu_item_id}`}
                    className="w-8 h-8 rounded-full border border-cafe-border bg-cafe-bg flex items-center justify-center text-cafe-text hover:border-cafe-primary hover:text-cafe-primary transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span className="w-6 text-center font-body font-semibold text-sm text-cafe-text" data-testid={`bill-qty-${item.menu_item_id}`}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.menu_item_id, 1); }}
                    data-testid={`bill-increase-qty-${item.menu_item_id}`}
                    className="w-8 h-8 rounded-full border border-cafe-border bg-cafe-bg flex items-center justify-center text-cafe-text hover:border-cafe-primary hover:text-cafe-primary transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>

                <span className="font-body font-semibold text-sm text-cafe-text w-16 text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Totals & Charge */}
      <div className="border-t border-cafe-border p-5 space-y-3">
        {/* Discount Input */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-cafe-text-muted font-body whitespace-nowrap">Discount %</label>
          <input
            type="number"
            min="0"
            max="100"
            value={discount}
            onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
            data-testid="discount-input"
            className="w-20 px-2 py-1.5 text-sm font-body border border-cafe-border rounded-lg bg-cafe-bg text-cafe-text text-center focus:outline-none focus:ring-2 focus:ring-cafe-primary"
          />
        </div>

        <div className="space-y-2 text-sm font-body">
          <div className="flex justify-between text-cafe-text-muted">
            <span>Subtotal</span>
            <span data-testid="bill-subtotal">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-cafe-text-muted">
            <span>Tax ({taxRate}%)</span>
            <span data-testid="bill-tax">+${taxAmount.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-cafe-success">
              <span>Discount ({discount}%)</span>
              <span data-testid="bill-discount">-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-cafe-text font-bold text-lg pt-2 border-t border-cafe-border">
            <span>Total</span>
            <span data-testid="bill-total">${total.toFixed(2)}</span>
          </div>
        </div>

        <motion.button
          onClick={onCharge}
          disabled={billItems.length === 0}
          data-testid="charge-btn"
          className={`w-full py-4 rounded-2xl font-heading font-medium text-lg tracking-wide transition-all duration-200
            ${billItems.length > 0
              ? 'bg-cafe-primary text-white hover:bg-cafe-primary-hover shadow-sm active:scale-[0.98]'
              : 'bg-cafe-border text-cafe-text-muted cursor-not-allowed'
            }`}
          whileTap={billItems.length > 0 ? { scale: 0.97 } : {}}
        >
          {billItems.length > 0 ? `Charge $${total.toFixed(2)}` : 'Add items to order'}
        </motion.button>
      </div>
    </div>
  );
}
