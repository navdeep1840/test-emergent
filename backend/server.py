import os
import io
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId
from fpdf import FPDF

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

SEED_MENU = [
    {"name": "Espresso", "price": 3.50, "category": "Coffee", "image": "https://images.unsplash.com/photo-1706182834059-e2a4655b2d85?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwzfHxjb2ZmZWUlMjBsYXR0ZSUyMGFydHxlbnwwfHx8fDE3NzYyMjY0MDF8MA&ixlib=rb-4.1.0&q=85"},
    {"name": "Cappuccino", "price": 4.50, "category": "Coffee", "image": "https://images.unsplash.com/photo-1629909216781-12218b57d1a6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHw0fHxjb2ZmZWUlMjBsYXR0ZSUyMGFydHxlbnwwfHx8fDE3NzYyMjY0MDF8MA&ixlib=rb-4.1.0&q=85"},
    {"name": "Latte", "price": 5.00, "category": "Coffee", "image": "https://images.unsplash.com/photo-1706182834059-e2a4655b2d85?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwzfHxjb2ZmZWUlMjBsYXR0ZSUyMGFydHxlbnwwfHx8fDE3NzYyMjY0MDF8MA&ixlib=rb-4.1.0&q=85"},
    {"name": "Americano", "price": 3.00, "category": "Coffee", "image": "https://images.unsplash.com/photo-1629909216781-12218b57d1a6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHw0fHxjb2ZmZWUlMjBsYXR0ZSUyMGFydHxlbnwwfHx8fDE3NzYyMjY0MDF8MA&ixlib=rb-4.1.0&q=85"},
    {"name": "Mocha", "price": 5.50, "category": "Coffee", "image": "https://images.unsplash.com/photo-1706182834059-e2a4655b2d85?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwzfHxjb2ZmZWUlMjBsYXR0ZSUyMGFydHxlbnwwfHx8fDE3NzYyMjY0MDF8MA&ixlib=rb-4.1.0&q=85"},
    {"name": "Croissant", "price": 3.50, "category": "Pastry", "image": "https://images.unsplash.com/photo-1703016402680-d12e7dc746d9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwzfHxjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MHx8fHwxNzc2MjI2NDAyfDA&ixlib=rb-4.1.0&q=85"},
    {"name": "Blueberry Muffin", "price": 4.00, "category": "Pastry", "image": "https://images.pexels.com/photos/4828339/pexels-photo-4828339.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"name": "Chocolate Cake", "price": 6.00, "category": "Pastry", "image": "https://images.unsplash.com/photo-1703016402680-d12e7dc746d9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwzfHxjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MHx8fHwxNzc2MjI2NDAyfDA&ixlib=rb-4.1.0&q=85"},
    {"name": "Cinnamon Roll", "price": 4.50, "category": "Pastry", "image": "https://images.pexels.com/photos/4828339/pexels-photo-4828339.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"name": "Green Tea", "price": 3.00, "category": "Tea", "image": "https://images.unsplash.com/photo-1629909216781-12218b57d1a6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHw0fHxjb2ZmZWUlMjBsYXR0ZSUyMGFydHxlbnwwfHx8fDE3NzYyMjY0MDF8MA&ixlib=rb-4.1.0&q=85"},
    {"name": "Chai Latte", "price": 4.50, "category": "Tea", "image": "https://images.unsplash.com/photo-1706182834059-e2a4655b2d85?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwzfHxjb2ZmZWUlMjBsYXR0ZSUyMGFydHxlbnwwfHx8fDE3NzYyMjY0MDF8MA&ixlib=rb-4.1.0&q=85"},
    {"name": "Earl Grey", "price": 3.50, "category": "Tea", "image": "https://images.unsplash.com/photo-1629909216781-12218b57d1a6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHw0fHxjb2ZmZWUlMjBsYXR0ZSUyMGFydHxlbnwwfHx8fDE3NzYyMjY0MDF8MA&ixlib=rb-4.1.0&q=85"},
    {"name": "Club Sandwich", "price": 8.00, "category": "Food", "image": "https://images.pexels.com/photos/4828339/pexels-photo-4828339.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"name": "Caesar Salad", "price": 7.50, "category": "Food", "image": "https://images.unsplash.com/photo-1703016402680-d12e7dc746d9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwzfHxjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MHx8fHwxNzc2MjI2NDAyfDA&ixlib=rb-4.1.0&q=85"},
    {"name": "Avocado Toast", "price": 7.00, "category": "Food", "image": "https://images.pexels.com/photos/4828339/pexels-photo-4828339.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"name": "Orange Juice", "price": 4.00, "category": "Drinks", "image": "https://images.unsplash.com/photo-1706182834059-e2a4655b2d85?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwzfHxjb2ZmZWUlMjBsYXR0ZSUyMGFydHxlbnwwfHx8fDE3NzYyMjY0MDF8MA&ixlib=rb-4.1.0&q=85"},
    {"name": "Smoothie Bowl", "price": 6.50, "category": "Drinks", "image": "https://images.unsplash.com/photo-1629909216781-12218b57d1a6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHw0fHxjb2ZmZWUlMjBsYXR0ZSUyMGFydHxlbnwwfHx8fDE3NzYyMjY0MDF8MA&ixlib=rb-4.1.0&q=85"},
    {"name": "Iced Tea", "price": 3.50, "category": "Drinks", "image": "https://images.unsplash.com/photo-1706182834059-e2a4655b2d85?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwzfHxjb2ZmZWUlMjBsYXR0ZSUyMGFydHxlbnwwfHx8fDE3NzYyMjY0MDF8MA&ixlib=rb-4.1.0&q=85"},
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.mongodb_client = AsyncIOMotorClient(MONGO_URL)
    app.db = app.mongodb_client[DB_NAME]
    # Seed menu if empty
    count = await app.db.menu_items.count_documents({})
    if count == 0:
        await app.db.menu_items.insert_many(SEED_MENU)
    # Create counter for bill numbers
    counter = await app.db.counters.find_one({"_id": "bill_number"})
    if not counter:
        await app.db.counters.insert_one({"_id": "bill_number", "seq": 1000})
    yield
    app.mongodb_client.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serialize_doc(doc):
    doc["id"] = str(doc.pop("_id"))
    return doc


# --- Models ---
class MenuItemCreate(BaseModel):
    name: str
    price: float
    category: str
    image: Optional[str] = ""

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None

class BillItemModel(BaseModel):
    menu_item_id: str
    name: str
    price: float
    quantity: int

class BillCreate(BaseModel):
    items: list[BillItemModel]
    subtotal: float
    tax_rate: float
    tax_amount: float
    discount_percent: float
    discount_amount: float
    total: float
    customer_name: Optional[str] = ""


# --- Health Check ---
@app.get("/api/health")
async def health():
    return {"status": "ok"}


# --- Menu Items ---
@app.get("/api/menu-items")
async def get_menu_items():
    items = await app.db.menu_items.find().to_list(length=None)
    return [serialize_doc(item) for item in items]

@app.get("/api/menu-items/categories")
async def get_categories():
    categories = await app.db.menu_items.distinct("category")
    return categories

@app.post("/api/menu-items")
async def create_menu_item(item: MenuItemCreate):
    doc = item.model_dump()
    result = await app.db.menu_items.insert_one(doc)
    created = await app.db.menu_items.find_one({"_id": result.inserted_id})
    return serialize_doc(created)

@app.put("/api/menu-items/{item_id}")
async def update_menu_item(item_id: str, item: MenuItemUpdate):
    update_data = {k: v for k, v in item.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await app.db.menu_items.update_one(
        {"_id": ObjectId(item_id)}, {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    updated = await app.db.menu_items.find_one({"_id": ObjectId(item_id)})
    return serialize_doc(updated)

@app.delete("/api/menu-items/{item_id}")
async def delete_menu_item(item_id: str):
    result = await app.db.menu_items.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"deleted": True}


# --- Bills ---
@app.post("/api/bills")
async def create_bill(bill: BillCreate):
    counter = await app.db.counters.find_one_and_update(
        {"_id": "bill_number"}, {"$inc": {"seq": 1}}, return_document=True
    )
    bill_number = f"CAFE-{counter['seq']}"
    doc = bill.model_dump()
    doc["bill_number"] = bill_number
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await app.db.bills.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc

@app.get("/api/bills")
async def get_bills():
    bills = await app.db.bills.find({}, {"_id": 1, "bill_number": 1, "total": 1, "created_at": 1, "customer_name": 1, "items": 1}).sort("created_at", -1).to_list(length=100)
    return [serialize_doc(b) for b in bills]

@app.get("/api/bills/{bill_id}")
async def get_bill(bill_id: str):
    bill = await app.db.bills.find_one({"_id": ObjectId(bill_id)})
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return serialize_doc(bill)


@app.get("/api/bills/{bill_id}/pdf")
async def get_bill_pdf(bill_id: str):
    bill = await app.db.bills.find_one({"_id": ObjectId(bill_id)})
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    w = pdf.w - 20  # usable width (margins 10 each side)

    # --- Header ---
    pdf.set_font("Helvetica", "B", 22)
    pdf.cell(w, 12, "Cafe POS", ln=True, align="C")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(w, 6, "Thank you for your order!", ln=True, align="C")
    pdf.set_text_color(0, 0, 0)
    pdf.ln(6)

    # --- Divider ---
    pdf.set_draw_color(200, 200, 200)
    pdf.line(10, pdf.get_y(), 10 + w, pdf.get_y())
    pdf.ln(6)

    # --- Bill Info ---
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(w / 2, 5, "Bill Number", align="L")
    pdf.cell(w / 2, 5, "Date", align="R", ln=True)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(0, 0, 0)
    bill_number = bill.get("bill_number", "N/A")
    created_at = bill.get("created_at", "")
    date_str = ""
    if created_at:
        try:
            dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            date_str = dt.strftime("%b %d, %Y %I:%M %p")
        except Exception:
            date_str = created_at
    pdf.cell(w / 2, 6, bill_number, align="L")
    pdf.cell(w / 2, 6, date_str, align="R", ln=True)

    customer = bill.get("customer_name", "")
    if customer:
        pdf.ln(2)
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(120, 120, 120)
        pdf.cell(15, 5, "Customer:")
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 5, customer, ln=True)

    pdf.ln(4)
    pdf.set_draw_color(200, 200, 200)
    pdf.dashed_line(10, pdf.get_y(), 10 + w, pdf.get_y(), 2, 2)
    pdf.ln(4)

    # --- Column Headers ---
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(120, 120, 120)
    col_item = w * 0.45
    col_qty = w * 0.15
    col_price = w * 0.2
    col_total = w * 0.2
    pdf.cell(col_item, 6, "ITEM", align="L")
    pdf.cell(col_qty, 6, "QTY", align="C")
    pdf.cell(col_price, 6, "PRICE", align="R")
    pdf.cell(col_total, 6, "TOTAL", align="R", ln=True)
    pdf.ln(2)
    pdf.set_draw_color(220, 220, 220)
    pdf.line(10, pdf.get_y(), 10 + w, pdf.get_y())
    pdf.ln(3)

    # --- Items ---
    pdf.set_text_color(40, 40, 40)
    for item in bill.get("items", []):
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(col_item, 7, item["name"][:28], align="L")
        pdf.cell(col_qty, 7, str(item["quantity"]), align="C")
        pdf.cell(col_price, 7, f"${item['price']:.2f}", align="R")
        pdf.cell(col_total, 7, f"${item['price'] * item['quantity']:.2f}", align="R", ln=True)

    pdf.ln(3)
    pdf.set_draw_color(200, 200, 200)
    pdf.dashed_line(10, pdf.get_y(), 10 + w, pdf.get_y(), 2, 2)
    pdf.ln(4)

    # --- Totals ---
    totals_x = w * 0.55
    totals_w = w * 0.45
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(totals_x, 6, "", align="L")
    pdf.cell(totals_w / 2, 6, "Subtotal", align="L")
    pdf.cell(totals_w / 2, 6, f"${bill.get('subtotal', 0):.2f}", align="R", ln=True)

    pdf.cell(totals_x, 6, "", align="L")
    pdf.cell(totals_w / 2, 6, f"Tax ({bill.get('tax_rate', 0)}%)", align="L")
    pdf.cell(totals_w / 2, 6, f"+${bill.get('tax_amount', 0):.2f}", align="R", ln=True)

    if bill.get("discount_percent", 0) > 0:
        pdf.set_text_color(80, 140, 80)
        pdf.cell(totals_x, 6, "", align="L")
        pdf.cell(totals_w / 2, 6, f"Discount ({bill['discount_percent']}%)", align="L")
        pdf.cell(totals_w / 2, 6, f"-${bill.get('discount_amount', 0):.2f}", align="R", ln=True)

    pdf.ln(2)
    pdf.set_draw_color(40, 40, 40)
    y_line = pdf.get_y()
    pdf.line(10 + totals_x, y_line, 10 + w, y_line)
    pdf.ln(3)

    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(totals_x, 8, "", align="L")
    pdf.cell(totals_w / 2, 8, "Total", align="L")
    pdf.cell(totals_w / 2, 8, f"${bill.get('total', 0):.2f}", align="R", ln=True)

    # --- Footer ---
    pdf.ln(12)
    pdf.set_draw_color(200, 200, 200)
    pdf.dashed_line(10, pdf.get_y(), 10 + w, pdf.get_y(), 2, 2)
    pdf.ln(6)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(w, 5, "Generated by Cafe POS Bill Generator", ln=True, align="C")

    # Output
    pdf_bytes = pdf.output()
    buffer = io.BytesIO(pdf_bytes)
    filename = f"{bill_number}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
