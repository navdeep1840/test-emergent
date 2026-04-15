# Cafe Bill Generator - PRD

## Original Problem Statement
Make a bill generator software for a cafe. Users should be able to add/subtract items from the menu and it should generate the bill.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Database**: MongoDB (cafe_billing)

## User Personas
- **Cafe Staff/Cashier**: Primary user - creates orders, generates bills
- **Cafe Manager**: Manages menu items, views bill history

## Core Requirements
- Menu display with category filtering
- Add/remove items to order with quantity controls
- Real-time bill calculation (subtotal, tax, discount, total)
- Bill generation with unique bill numbers (CAFE-XXXX)
- Bill history with detail view
- Menu management (CRUD operations)
- Print-friendly bill receipts

## What's Been Implemented (Jan 2026)
- [x] Pre-seeded menu with 18 items across 5 categories (Coffee, Tea, Pastry, Food, Drinks)
- [x] POS Terminal with category filtering and item selection
- [x] Live bill panel with quantity +/-, discount %, tax calculation
- [x] Bill generation with unique bill numbers
- [x] Bill history dashboard with detail view and print support
- [x] Menu Management (Add/Edit/Delete items)
- [x] Responsive sidebar navigation (Terminal, History, Menu)
- [x] Organic & Earthy design theme with Outfit + IBM Plex Sans fonts
- [x] Framer Motion animations for smooth UX
- [x] **PDF export/download** for bills (from success toast, history table, and bill detail view)

## API Endpoints
- GET /api/health - Health check
- GET /api/menu-items - List all menu items
- GET /api/menu-items/categories - List categories
- POST /api/menu-items - Create menu item
- PUT /api/menu-items/{id} - Update menu item
- DELETE /api/menu-items/{id} - Delete menu item
- POST /api/bills - Create a bill
- GET /api/bills - List all bills
- GET /api/bills/{id} - Get bill detail
- GET /api/bills/{id}/pdf - Download bill as PDF

## Backlog
- P1: PDF export/download for bills
- P1: Daily/weekly sales summary dashboard
- P2: Barista/staff login (multi-user support)
- P2: Table number assignment
- P2: Kitchen order display
- P3: Inventory tracking
- P3: Customer loyalty program integration
