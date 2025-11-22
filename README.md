<div align="center">

# 🌐 **StockMaster**
### **Odoo x SPIT Hackathon 2025**
#### Built by **Team Infiverse**

A next-generation **Inventory Management System** engineered for real-time visibility, operational accuracy, and warehouse intelligence.

⚡ Reliable • 🏭 Industry-Ready • 📦 Modular • 🔐 Secure

---

### 👥 **Team Infiverse**
| Member | Role |
|--------|------|
| **Saachi Potam** | Full-Stack Developer • UI/UX Lead |
| **Aahan Desai** | Backend Developer • Database & Logic |
| **Aarti Machha** | Inventory Flow Designer • QA & Testing |

📍 *Thakur College of Engineering and Technology (TCET)* 
📍 *Atharva University* 

🧑‍🏫 Reviewer:
**Aman Patel (ampa)**
GitHub Reviewer ID: **ampa-odoo**

---

</div>

# 📝 **Problem Statement**
Build a **modular Inventory Management System (IMS)** that replaces manual registers, Excel files, and scattered tracking methods with a **centralized, digital, real-time system**).

The platform should streamline:
- Stock inflow & outflow  
- Internal warehouse transfers  
- Inventory auditing  
- Dashboard visibility  
- Product lifecycle tracking  

---

# ⭐ **Why StockMaster?**
Our system is designed with **real warehouse challenges** in mind.

- 🧠 **Minimal clicks, maximum clarity**
- 🔄 **Error-free automated stock movements**
- 🏷 **SKU-driven smart search**
- 📉 **Instant low-stock alerts**
- 🛠 **Modular architecture for scalability**
- 📊 **KPI-rich dashboard built for decision makers**
- 📚 **Clean history logs for audits**

**It’s a digital transformation tool for inventory-heavy businesses.**

---

# 📊 **Feature Overview**

## 🎛️ 1. Dashboard (Real-Time KPI Engine)
The landing page shows a snapshot of inventory operations
- Total products in stock
- Low Stock / Out of Stock Items
- Pending Receipts
- Pending Deliveries
- Internal Transfers Scheduled
- Filters by:
  - Document Type (Receipts / Delivery / Internal / Adjustments)
  - Status (Draft, Waiting, Ready, Done, Canceled)
  - Warehouse / Location
  - Product Category

---

## 📦 2. Product Management
- Create / update products
- Create products with: Name, SKU / Code, Category, and Unit of Measure
- Initial stock 
- Stock availability per location
- Reordering rules
- SKU search & smart filters

---

## 🚚 3. Receipts (Incoming Stock)
Used when items arrive from vendors.
Workflow:  
1. Create a new receipt
2. Add supplier & products
3. Input quantities received
4. Validate → **Stock Increases Automatically**

Example:  
Receive 50 units of "Steel Rods" → stock +50

---

## 📤 4. Delivery Orders (Outgoing Stock)
Used when stock leaves the warehouse for customer shipment
Workflow:  
1. Pick items
2. Pack items
3. Validate → **Stock Decreases Automatically**

Example:  
Sales order for 10 chairs → Delivery order reduces chairs by 10

---

## 🔄 5. Internal Transfers
Move stock inside the company:
- Warehouses (Warehouse 1 $\rightarrow$ Warehouse 2) 
- Racks (Rack A $\rightarrow$ Rack B)
- Departments (Main Warehouse $\rightarrow$ Production Floor)

Each movement is logged in the ledger.

---

## 🛠️ 6. Stock Adjustments
Fix mismatches between recorded stock and physical count.
Workflow:  
1. Select product/location
2. Enter counted quantity
3. System auto-updates and logs the adjustment

---

# 🚀 **Future Scope & Vision (The Winning Edge)**

While the core modules achieve the immediate problem statement, **StockMaster** is architected for continuous evolution into a true warehouse intelligence platform. Our vision extends into integrating[...]

## 🌟 **Winning-Edge Innovations (Post-Hackathon)**

### 1. **Augmented Reality (AR) Picking Guide**
* **Problem:** Warehouse staff spend critical time navigating large, complex facilities, leading to errors.
* **Solution:** Using the device's camera, the app will overlay real-time, step-by-step navigational directions directly onto the physical view of the warehouse floor.
* **Impact:** Drastically reduces picking errors and cuts fulfillment time by up to **$40\%$**.

### 2. **Dynamic Reorder Point (DRP) Engine**
* **Problem:** Fixed reorder rules are static and fail to account for seasonal spikes or varying supplier lead times.
* **Solution:** Implement a lightweight, time-series forecasting model that analyzes historical **Move History** data to dynamically adjust the Reorder Point for each product.
* **Impact:** **Prevents most stock-outs** while minimizing capital tied up in slow-moving inventory (overstocking).

### 3. **Gamified Cycle Counting**
* **Problem:** Inventory adjustments (physical counts) are tedious, prone to human error, and often rushed.
* **Solution:** Turn the Stock Adjustment process into a game by awarding points and badges for counting accuracy and speed, fostering internal competition.
* **Impact:** **Increases inventory accuracy**, improves staff diligence, and boosts operational morale.

---

# 🏗️ **Architecture (Planned)**

| Layer         | Folder Path         | Key Contents/Files                                         | Description                                            |
|---------------|--------------------|-----------------------------------------------------------|--------------------------------------------------------|
| Frontend      | `/frontend`        | `components/`, `pages/`, `assets/`, `App.jsx`             | React-based user interface components and main app      |
| Backend       | `/backend`         | `controllers/`, `routes/`, `models/`, `services/`, `app.py` | Python API, logic, and routing for StockMaster          |
| Database      | `/database`        | `erd.png`, `schema.sql`, `migrations/`                    | ER diagrams, SQL schema, migration scripts             |
| Documentation | `/docs`            | `architecture-diagram.png`, `system-design.md`, `api-documentation.md` | Design docs and API documentation                      |

---

# 🛣️ **Project Roadmap**

### 🔹 Phase 1 — Foundation
- [x] Requirements + Documentation  
- [ ] UI Wireframes  
- [ ] Database Schema  

### 🔹 Phase 2 — Development
- [ ] Authentication  
- [ ] Dashboard KPIs  
- [ ] Product Module  
- [ ] Receipts  
- [ ] Delivery Orders  
- [ ] Internal Transfers  
- [ ] Stock Adjustments  

### 🔹 Phase 3 — Final Touch
- [ ] Testing & Bug Fixing  
- [ ] Video Demo  
- [ ] Final Presentation  
- [ ] Deployment  

---

# 🤝 **Collaborator**
`ampa-odoo` (Reviewer)

---

<div align="center">

# 💙 Made with Precision  
### **Team Infiverse**
Innovating today. Impacting tomorrow.

</div>
