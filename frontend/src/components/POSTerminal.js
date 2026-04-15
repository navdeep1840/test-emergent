import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMenuItems, getCategories, createBill } from '../api';
import BillPanel from './BillPanel';

export default function POSTerminal() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [billItems, setBillItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [billSuccess, setBillSuccess] = useState(null);

  const TAX_RATE = 10;

  const fetchData = useCallback(async () => {
    try {
      const [items, cats] = await Promise.all([getMenuItems(), getCategories()]);
      setMenuItems(items);
      setCategories(['All', ...cats]);
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(i => i.category === activeCategory);

  const addToBill = (item) => {
    setBillItems(prev => {
      const existing = prev.find(b => b.menu_item_id === item.id);
      if (existing) {
        return prev.map(b =>
          b.menu_item_id === item.id ? { ...b, quantity: b.quantity + 1 } : b
        );
      }
      return [...prev, { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId, delta) => {
    setBillItems(prev => {
      return prev
        .map(b => b.menu_item_id === menuItemId ? { ...b, quantity: b.quantity + delta } : b)
        .filter(b => b.quantity > 0);
    });
  };

  const subtotal = billItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const taxAmount = subtotal * (TAX_RATE / 100);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal + taxAmount - discountAmount;

  const handleCharge = async () => {
    if (billItems.length === 0) return;
    try {
      const bill = await createBill({
        items: billItems,
        subtotal: Math.round(subtotal * 100) / 100,
        tax_rate: TAX_RATE,
        tax_amount: Math.round(taxAmount * 100) / 100,
        discount_percent: discount,
        discount_amount: Math.round(discountAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
        customer_name: customerName,
      });
      setBillSuccess(bill);
      setBillItems([]);
      setDiscount(0);
      setCustomerName('');
      setTimeout(() => setBillSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to create bill:', err);
    }
  };

  const clearBill = () => {
    setBillItems([]);
    setDiscount(0);
    setCustomerName('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="pos-loading">
        <div className="w-8 h-8 border-2 border-cafe-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="pos-terminal">
      <div className="mb-6">
        <h1 className="font-heading font-medium text-3xl text-cafe-text tracking-tight">
          Terminal
        </h1>
        <p className="text-cafe-text-muted text-sm mt-1 font-body">
          Select items to build the order
        </p>
      </div>

      <AnimatePresence>
        {billSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-cafe-success/10 border border-cafe-success/30 rounded-2xl flex items-center gap-3"
            data-testid="bill-success-toast"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B8E6B" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
            <span className="text-cafe-success font-medium font-body text-sm">
              Bill {billSuccess.bill_number} created — ${billSuccess.total.toFixed(2)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Menu Area */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6" data-testid="menu-area">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2" data-testid="category-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                data-testid={`category-tab-${cat.toLowerCase().replace(/\s/g, '-')}`}
                className={`px-4 py-2 rounded-full text-sm font-heading font-medium transition-all duration-200
                  ${activeCategory === cat
                    ? 'bg-cafe-text text-white shadow-sm'
                    : 'text-cafe-text-muted hover:bg-cafe-border/50'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
            data-testid="menu-items-grid"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map(item => {
                const inBill = billItems.find(b => b.menu_item_id === item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => addToBill(item)}
                    data-testid={`menu-item-${item.id}`}
                    className={`relative bg-cafe-surface border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group
                      ${inBill ? 'border-cafe-primary shadow-[0_4px_20px_rgba(224,122,95,0.15)]' : 'border-cafe-border hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(44,42,41,0.08)] hover:border-cafe-primary'}`}
                  >
                    <div className="h-28 sm:h-32 overflow-hidden bg-cafe-surface-alt">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1706182834059-e2a4655b2d85?w=400'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <p className="font-heading font-medium text-sm text-cafe-text truncate">{item.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-body font-semibold text-cafe-primary text-sm">${item.price.toFixed(2)}</span>
                        <span className="text-xs font-body text-cafe-text-muted uppercase tracking-wider">{item.category}</span>
                      </div>
                    </div>
                    {inBill && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 bg-cafe-primary text-white rounded-full flex items-center justify-center text-xs font-body font-bold"
                        data-testid={`menu-item-badge-${item.id}`}
                      >
                        {inBill.quantity}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bill Panel */}
        <div className="col-span-1 lg:col-span-4 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
          <BillPanel
            billItems={billItems}
            updateQuantity={updateQuantity}
            subtotal={subtotal}
            taxRate={TAX_RATE}
            taxAmount={taxAmount}
            discount={discount}
            setDiscount={setDiscount}
            discountAmount={discountAmount}
            total={total}
            customerName={customerName}
            setCustomerName={setCustomerName}
            onCharge={handleCharge}
            onClear={clearBill}
          />
        </div>
      </div>
    </div>
  );
}
