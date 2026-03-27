import { google } from 'googleapis';

export interface Order {
  id: string;
  status: string;
  deliveryDate: string;
  trackingUrl: string;
  items: { name: string; quantity: number }[];
  updates: { date: string; status: string; location: string }[];
}

export interface Promotion {
  code: string;
  discount: string;
  description: string;
  expiry: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  lastOrderDate: string;
  loyaltyTier: string;
}

// Fallback Mock Data
const MOCK_ORDERS: Order[] = [
  { 
    id: "ORD-123", 
    status: "Shipped", 
    deliveryDate: "2026-03-28",
    trackingUrl: "https://track.example.com/ORD-123",
    items: [
      { name: "TechNova Pro Max", quantity: 1 },
      { name: "PureSound Noise Cancel 2", quantity: 2 }
    ],
    updates: [
      { date: "2026-03-25", status: "Order Processed", location: "Warehouse A" },
      { date: "2026-03-26", status: "Shipped", location: "Transit Hub" }
    ]
  },
  { 
    id: "ORD-456", 
    status: "Out for Delivery", 
    deliveryDate: "2026-03-26",
    trackingUrl: "https://track.example.com/ORD-456",
    items: [
      { name: "EcoStyle Solar Watch", quantity: 1 }
    ],
    updates: [
      { date: "2026-03-24", status: "Order Processed", location: "Warehouse B" },
      { date: "2026-03-25", status: "Shipped", location: "Regional Center" },
      { date: "2026-03-26", status: "Out for Delivery", location: "Your City" }
    ]
  },
  { 
    id: "ORD-789", 
    status: "Delivered", 
    deliveryDate: "2026-03-20",
    trackingUrl: "https://track.example.com/ORD-789",
    items: [
      { name: "GlowBeam Smart Lamp", quantity: 1 }
    ],
    updates: [
      { date: "2026-03-18", status: "Order Processed", location: "Warehouse A" },
      { date: "2026-03-19", status: "Shipped", location: "Transit Hub" },
      { date: "2026-03-20", status: "Delivered", location: "Front Porch" }
    ]
  },
  { 
    id: "ORD-101", 
    status: "Processing", 
    deliveryDate: "2026-04-02",
    trackingUrl: "https://track.example.com/ORD-101",
    items: [
      { name: "AeroGlide Mouse", quantity: 1 }
    ],
    updates: [
      { date: "2026-03-27", status: "Order Received", location: "System" }
    ]
  }
];

const MOCK_PROMOTIONS: Promotion[] = [
  { code: "WELCOME10", discount: "10% Off", description: "First order special", expiry: "2026-12-31" },
  { code: "TECH20", discount: "20% Off", description: "Electronics flash sale", expiry: "2026-04-15" },
  { code: "FREESHIP", discount: "Free Shipping", description: "Orders over $100", expiry: "2026-06-30" },
  { code: "SPRING25", discount: "25% Off", description: "Spring collection launch", expiry: "2026-05-01" }
];

const MOCK_CUSTOMERS: Customer[] = [
  { id: "CUST-001", name: "John Doe", email: "john@example.com", phone: "+1234567890", totalSpent: 450.50, lastOrderDate: "2026-03-25", loyaltyTier: "Gold" },
  { id: "CUST-002", name: "Jane Smith", email: "jane@example.com", phone: "+0987654321", totalSpent: 120.00, lastOrderDate: "2026-03-20", loyaltyTier: "Silver" },
  { id: "CUST-003", name: "Alex Johnson", email: "alex@example.com", phone: "+1122334455", totalSpent: 890.00, lastOrderDate: "2026-03-27", loyaltyTier: "Platinum" },
  { id: "CUST-004", name: "Sarah Williams", email: "sarah@example.com", phone: "+5566778899", totalSpent: 45.00, lastOrderDate: "2026-02-15", loyaltyTier: "Bronze" }
];

export class GoogleSheetsService {
  private auth: any;
  private sheets: any;
  private spreadsheetId: string | undefined;

  constructor() {
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (clientEmail && privateKey && this.spreadsheetId) {
      this.auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    }
  }

  async getOrders(): Promise<Order[]> {
    if (!this.sheets || !this.spreadsheetId) {
      console.log("Using Mock Orders (Google Sheets not configured)");
      return MOCK_ORDERS;
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Orders!A2:F', // Assuming sheet name is 'Orders' and columns A-F
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log("[INFO] No orders found in Google Sheets, using mock data.");
        return MOCK_ORDERS;
      }

      return rows.map((row: any) => ({
        id: row[0],
        status: row[1],
        deliveryDate: row[2],
        trackingUrl: row[3],
        items: JSON.parse(row[4] || '[]'),
        updates: JSON.parse(row[5] || '[]'),
      }));
    } catch (error) {
      console.error("[ERROR] Failed to fetch orders from Google Sheets:", error);
      return MOCK_ORDERS;
    }
  }

  async getPromotions(): Promise<Promotion[]> {
    if (!this.sheets || !this.spreadsheetId) {
      console.log("Using Mock Promotions (Google Sheets not configured)");
      return MOCK_PROMOTIONS;
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Promotions!A2:D', // Assuming sheet name is 'Promotions' and columns A-D
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log("[INFO] No promotions found in Google Sheets, using mock data.");
        return MOCK_PROMOTIONS;
      }

      return rows.map((row: any) => ({
        code: row[0],
        discount: row[1],
        description: row[2],
        expiry: row[3],
      }));
    } catch (error) {
      console.error("[ERROR] Failed to fetch promotions from Google Sheets:", error);
      return MOCK_PROMOTIONS;
    }
  }

  async getCustomers(): Promise<Customer[]> {
    if (!this.sheets || !this.spreadsheetId) {
      console.log("Using Mock Customers (Google Sheets not configured)");
      return MOCK_CUSTOMERS;
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Customers!A2:G', // Assuming sheet name is 'Customers' and columns A-G
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log("[INFO] No customers found in Google Sheets, using mock data.");
        return MOCK_CUSTOMERS;
      }

      return rows.map((row: any) => ({
        id: row[0],
        name: row[1],
        email: row[2],
        phone: row[3],
        totalSpent: parseFloat(row[4] || '0'),
        lastOrderDate: row[5],
        loyaltyTier: row[6],
      }));
    } catch (error) {
      console.error("[ERROR] Failed to fetch customers from Google Sheets:", error);
      return MOCK_CUSTOMERS;
    }
  }

  async updateCustomer(customer: Partial<Customer> & { email: string }): Promise<void> {
    if (!this.sheets || !this.spreadsheetId) {
      console.log("Updating Mock Customer (Google Sheets not configured)");
      const index = MOCK_CUSTOMERS.findIndex(c => c.email === customer.email);
      if (index !== -1) {
        MOCK_CUSTOMERS[index] = { ...MOCK_CUSTOMERS[index], ...customer };
      } else {
        const newCustomer: Customer = {
          id: `CUST-${String(MOCK_CUSTOMERS.length + 1).padStart(3, '0')}`,
          name: customer.name || 'Unknown',
          email: customer.email,
          phone: customer.phone || '',
          totalSpent: customer.totalSpent || 0,
          lastOrderDate: customer.lastOrderDate || new Date().toISOString().split('T')[0],
          loyaltyTier: customer.loyaltyTier || 'Bronze',
        };
        MOCK_CUSTOMERS.push(newCustomer);
      }
      return;
    }

    try {
      // 1. Find the row index for the customer
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Customers!C2:C', // Email column
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row: any) => row[0] === customer.email);

      if (rowIndex !== -1) {
        // Update existing row (Row index is 0-based from A2, so add 2)
        const actualRow = rowIndex + 2;
        const currentData = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.spreadsheetId,
          range: `Customers!A${actualRow}:G${actualRow}`,
        });
        const rowData = currentData.data.values[0];

        const updatedRow = [
          rowData[0], // ID
          customer.name || rowData[1],
          customer.email,
          customer.phone || rowData[3],
          customer.totalSpent !== undefined ? customer.totalSpent : rowData[4],
          customer.lastOrderDate || rowData[5],
          customer.loyaltyTier || rowData[6],
        ];

        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Customers!A${actualRow}:G${actualRow}`,
          valueInputOption: 'RAW',
          requestBody: { values: [updatedRow] },
        });
      } else {
        // Append new customer
        const newRow = [
          `CUST-${String(rows.length + 1).padStart(3, '0')}`,
          customer.name || 'Unknown',
          customer.email,
          customer.phone || '',
          customer.totalSpent || 0,
          customer.lastOrderDate || new Date().toISOString().split('T')[0],
          customer.loyaltyTier || 'Bronze',
        ];

        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: 'Customers!A2',
          valueInputOption: 'RAW',
          requestBody: { values: [newRow] },
        });
      }
    } catch (error) {
      console.error("Error updating Google Sheets:", error);
    }
  }
}

export const googleSheets = new GoogleSheetsService();
