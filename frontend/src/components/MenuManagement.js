import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../api';

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', category: '', image: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const data = await getMenuItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openAddForm = () => {
    setEditingItem(null);
    setForm({ name: '', price: '', category: '', image: '' });
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setForm({ name: item.name, price: String(item.price), category: item.category, image: item.image || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      price: parseFloat(form.price),
      category: form.category,
      image: form.image,
    };
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, data);
      } else {
        await createMenuItem(data);
      }
      setShowForm(false);
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to save item:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id);
      setDeleteConfirm(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const categories = [...new Set(items.map(i => i.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="menu-mgmt-loading">
        <div className="w-8 h-8 border-2 border-cafe-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="menu-management">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading font-medium text-3xl text-cafe-text tracking-tight">
            Menu Management
          </h1>
          <p className="text-cafe-text-muted text-sm mt-1 font-body">
            {items.length} items across {categories.length} categories
          </p>
        </div>
        <button
          onClick={openAddForm}
          data-testid="add-menu-item-btn"
          className="px-5 py-2.5 bg-cafe-primary text-white rounded-xl font-heading font-medium text-sm hover:bg-cafe-primary-hover transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Item
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
            data-testid="menu-form-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-cafe-surface rounded-3xl p-6 sm:p-8 w-full max-w-md border border-cafe-border shadow-xl"
              data-testid="menu-item-form"
            >
              <h3 className="font-heading font-medium text-xl text-cafe-text mb-6">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-cafe-text-muted font-body mb-1.5">Item Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    data-testid="form-item-name"
                    className="w-full px-4 py-3 text-sm font-body border border-cafe-border rounded-xl bg-cafe-bg focus:outline-none focus:ring-2 focus:ring-cafe-primary text-cafe-text placeholder:text-cafe-text-muted/50"
                    placeholder="e.g., Flat White"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-cafe-text-muted font-body mb-1.5">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                      data-testid="form-item-price"
                      className="w-full px-4 py-3 text-sm font-body border border-cafe-border rounded-xl bg-cafe-bg focus:outline-none focus:ring-2 focus:ring-cafe-primary text-cafe-text placeholder:text-cafe-text-muted/50"
                      placeholder="4.50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-cafe-text-muted font-body mb-1.5">Category</label>
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                      data-testid="form-item-category"
                      className="w-full px-4 py-3 text-sm font-body border border-cafe-border rounded-xl bg-cafe-bg focus:outline-none focus:ring-2 focus:ring-cafe-primary text-cafe-text placeholder:text-cafe-text-muted/50"
                      placeholder="Coffee"
                      list="categories-list"
                    />
                    <datalist id="categories-list">
                      {categories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-cafe-text-muted font-body mb-1.5">Image URL (optional)</label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    data-testid="form-item-image"
                    className="w-full px-4 py-3 text-sm font-body border border-cafe-border rounded-xl bg-cafe-bg focus:outline-none focus:ring-2 focus:ring-cafe-primary text-cafe-text placeholder:text-cafe-text-muted/50"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    data-testid="form-cancel-btn"
                    className="flex-1 py-3 rounded-xl font-heading font-medium text-sm border border-cafe-border text-cafe-text-muted hover:bg-cafe-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    data-testid="form-submit-btn"
                    className="flex-1 py-3 rounded-xl font-heading font-medium text-sm bg-cafe-primary text-white hover:bg-cafe-primary-hover transition-colors"
                  >
                    {editingItem ? 'Update' : 'Add Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
            data-testid="delete-confirm-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-cafe-surface rounded-3xl p-6 sm:p-8 w-full max-w-sm border border-cafe-border shadow-xl text-center"
              data-testid="delete-confirm-modal"
            >
              <div className="w-12 h-12 rounded-full bg-cafe-danger/10 mx-auto mb-4 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D9534F" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </div>
              <h3 className="font-heading font-medium text-lg text-cafe-text mb-2">Delete Item?</h3>
              <p className="font-body text-sm text-cafe-text-muted mb-6">
                Remove "{deleteConfirm.name}" from the menu? This can't be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  data-testid="delete-cancel-btn"
                  className="flex-1 py-3 rounded-xl font-heading font-medium text-sm border border-cafe-border text-cafe-text-muted hover:bg-cafe-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  data-testid="delete-confirm-btn"
                  className="flex-1 py-3 rounded-xl font-heading font-medium text-sm bg-cafe-danger text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items grouped by category */}
      <div className="space-y-8" data-testid="menu-items-list">
        {categories.map(category => (
          <div key={category}>
            <h2 className="font-heading font-medium text-lg text-cafe-text mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-cafe-primary rounded-full" />
              {category}
              <span className="text-xs text-cafe-text-muted font-body ml-1">
                ({items.filter(i => i.category === category).length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.filter(i => i.category === category).map(item => (
                <motion.div
                  key={item.id}
                  layout
                  className="bg-cafe-surface rounded-2xl border border-cafe-border p-4 flex items-center gap-4 group hover:border-cafe-primary/30 transition-colors"
                  data-testid={`mgmt-item-${item.id}`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-cafe-surface-alt flex-shrink-0">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1706182834059-e2a4655b2d85?w=200'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-medium text-sm text-cafe-text truncate">{item.name}</p>
                    <p className="font-body text-sm text-cafe-primary font-semibold">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditForm(item)}
                      data-testid={`edit-item-${item.id}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-cafe-text-muted hover:bg-cafe-bg hover:text-cafe-text transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item)}
                      data-testid={`delete-item-${item.id}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-cafe-text-muted hover:bg-cafe-danger/10 hover:text-cafe-danger transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
