import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { protect } from './middleware/authMiddleware.js';
import { login, logout, getMe } from './controllers/authController.js';
import { getMedicines, getMedicineById, addMedicine, updateMedicine, getMedicineLogs } from './controllers/medicineController.js';
import { postStockIn, postStockOut, postAdjustment, getHistory } from './controllers/inventoryController.js';
import { getDashboardData, getAdminBranchesComparison } from './controllers/analyticsController.js';
import { getReorderQueue, createReorderRequest, completeReorderRequest } from './controllers/reorderController.js';
import { getAlerts, markAlertAsRead } from './controllers/alertController.js';
import { exportAuditTrailCSV } from './controllers/complianceController.js';

// Load models for seeder
import Pharmacy from './models/Pharmacy.js';
import User from './models/User.js';
import Medicine from './models/Medicine.js';
import ReorderRequest from './models/ReorderRequest.js';
import BranchHealthHistory from './models/BranchHealthHistory.js';
import Alert from './models/Alert.js';
import InventoryTransaction from './models/InventoryTransaction.js';
import InventoryLog from './models/InventoryLog.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
    origin: true, // Allow frontend origin
    credentials: true // Allow session cookies to pass
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session structure using MongoStore
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-system';
app.use(session({
    secret: process.env.SESSION_SECRET || 'pharmacy-intelligence-secret-key-1984',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: uri,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}));

// API Routes
app.post('/api/auth/login', login);
app.post('/api/auth/logout', logout);
app.get('/api/auth/me', getMe);

app.get('/api/medicines', protect, getMedicines);
app.get('/api/medicines/:id', protect, getMedicineById);
app.post('/api/medicines', protect, addMedicine);
app.put('/api/medicines/:id', protect, updateMedicine);
app.get('/api/medicines/:id/logs', protect, getMedicineLogs);

app.post('/api/inventory/stock-in', protect, postStockIn);
app.post('/api/inventory/stock-out', protect, postStockOut);
app.post('/api/inventory/adjustment', protect, postAdjustment);
app.get('/api/inventory/history', protect, getHistory);

app.get('/api/analytics/dashboard', protect, getDashboardData);
app.get('/api/analytics/admin/branches', protect, getAdminBranchesComparison);

app.get('/api/reorders', protect, getReorderQueue);
app.post('/api/reorders', protect, createReorderRequest);
app.put('/api/reorders/:id/complete', protect, completeReorderRequest);

app.get('/api/alerts', protect, getAlerts);
app.put('/api/alerts/:id/read', protect, markAlertAsRead);

app.get('/api/compliance/export', protect, exportAuditTrailCSV);

// Debug Seeder Route (for Phase 1 Manual Verification)
app.post('/api/debug/seed', async (req, res) => {
    try {
        // Clear existing database collections
        await Pharmacy.deleteMany({});
        await User.deleteMany({});
        await Medicine.deleteMany({});
        await ReorderRequest.deleteMany({});
        await BranchHealthHistory.deleteMany({});
        await Alert.deleteMany({});
        await InventoryTransaction.deleteMany({});
        await InventoryLog.deleteMany({});

        // 1. Create Pharmacies
        const pharmacyNorth = await Pharmacy.create({
            name: 'Northside Pharmacy',
            address: '456 Medical Ridge, Sector 4'
        });

        const pharmacyDowntown = await Pharmacy.create({
            name: 'Downtown Pharmacy',
            address: '101 Broadway Ave, City Center'
        });

        // 2. Create Tenant Users (Passwords will be hashed automatically by userSchema pre-save hook)
        const pharmacistUser = await User.create({
            username: 'pharmacist_northside',
            password: 'password123',
            pharmacyId: pharmacyNorth._id,
            role: 'Pharmacist'
        });

        const managerUser = await User.create({
            username: 'manager_downtown',
            password: 'password123',
            pharmacyId: pharmacyDowntown._id,
            role: 'Manager'
        });

        const adminUser = await User.create({
            username: 'admin_sys',
            password: 'password123',
            pharmacyId: pharmacyNorth._id, // Arbitrary attachment for setup
            role: 'Admin'
        });

        // 3. Create Tenant Medicines
        const northMeds = await Medicine.create([
            {
                name: 'Paracetamol 650mg',
                ndc: 'CI-PAR-650',
                category: 'Analgesic',
                stock: 1200,
                price: 15.00,
                supplier: 'Cipla Ltd',
                status: 'Active',
                reorderPoint: 100,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Healthy
                pharmacyId: pharmacyNorth._id,
                createdBy: pharmacistUser._id
            },
            {
                name: 'Amoxicillin 500mg',
                ndc: 'SP-AMO-500',
                category: 'Anti-infective',
                stock: 210,
                price: 45.50,
                supplier: 'Sun Pharma',
                status: 'Active',
                reorderPoint: 50,
                expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Expired
                pharmacyId: pharmacyNorth._id,
                createdBy: pharmacistUser._id
            },
            {
                name: 'Metformin 500mg',
                ndc: 'AI-MET-500',
                category: 'Endocrine',
                stock: 12, // Low stock
                price: 8.20,
                supplier: 'Abbott India',
                status: 'Active',
                reorderPoint: 100,
                expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // Healthy
                pharmacyId: pharmacyNorth._id,
                createdBy: pharmacistUser._id
            },
            {
                name: 'Amlodipine 5mg',
                ndc: 'LL-AML-005',
                category: 'Cardiovascular',
                stock: 0, // Depleted
                price: 12.00,
                supplier: 'Lupin Ltd',
                status: 'Active',
                reorderPoint: 50,
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Healthy
                pharmacyId: pharmacyNorth._id,
                createdBy: pharmacistUser._id
            },
            {
                name: 'Pantoprazole 40mg',
                ndc: 'AL-PAN-040',
                category: 'Gastrointestinal',
                stock: 5, // Low stock & near expiry
                price: 22.50,
                supplier: 'Alkem Laboratories',
                status: 'Active',
                reorderPoint: 30,
                expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Near Expiry
                pharmacyId: pharmacyNorth._id,
                createdBy: pharmacistUser._id
            }
        ]);

        const downtownMeds = await Medicine.create([
            {
                name: 'Paracetamol 650mg',
                ndc: 'CI-PAR-650',
                category: 'Analgesic',
                stock: 800,
                price: 15.00,
                supplier: 'Cipla Ltd',
                status: 'Active',
                reorderPoint: 100,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                pharmacyId: pharmacyDowntown._id,
                createdBy: managerUser._id
            },
            {
                name: 'Amoxicillin 500mg',
                ndc: 'SP-AMO-500',
                category: 'Anti-infective',
                stock: 15, // Low stock & near expiry
                price: 45.50,
                supplier: 'Sun Pharma',
                status: 'Active',
                reorderPoint: 50,
                expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
                pharmacyId: pharmacyDowntown._id,
                createdBy: managerUser._id
            },
            {
                name: 'Metformin 500mg',
                ndc: 'AI-MET-500',
                category: 'Endocrine',
                stock: 900,
                price: 8.20,
                supplier: 'Abbott India',
                status: 'Active',
                reorderPoint: 100,
                expiryDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
                pharmacyId: pharmacyDowntown._id,
                createdBy: managerUser._id
            },
            {
                name: 'Amlodipine 5mg',
                ndc: 'LL-AML-005',
                category: 'Cardiovascular',
                stock: 60,
                price: 12.00,
                supplier: 'Lupin Ltd',
                status: 'Active',
                reorderPoint: 50,
                expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Near expiry
                pharmacyId: pharmacyDowntown._id,
                createdBy: managerUser._id
            }
        ]);

        // 4. Create Historical health scores
        await BranchHealthHistory.create([
            { pharmacyId: pharmacyNorth._id, healthScore: 95, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
            { pharmacyId: pharmacyNorth._id, healthScore: 92, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { pharmacyId: pharmacyNorth._id, healthScore: 88, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
            
            { pharmacyId: pharmacyDowntown._id, healthScore: 90, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
            { pharmacyId: pharmacyDowntown._id, healthScore: 85, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { pharmacyId: pharmacyDowntown._id, healthScore: 80, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ]);

        // 5. Create some seed alerts
        await Alert.create([
            {
                pharmacyId: pharmacyNorth._id,
                title: 'Audit Warning',
                message: 'Monthly drugs check compliance audit sheet is pending completion.',
                severity: 'warning',
                alertType: 'General'
            },
            {
                pharmacyId: pharmacyDowntown._id,
                title: 'Low Temperature Alert',
                message: 'Cold-chain storage refrigerator #2 temp warning logged.',
                severity: 'critical',
                alertType: 'General'
            }
        ]);

        // 6. Create active reorder request
        await ReorderRequest.create({
            medicineId: northMeds[3]._id, // Amlodipine 5mg
            pharmacyId: pharmacyNorth._id,
            quantityNeeded: 100,
            supplier: 'Lupin Ltd',
            status: 'Ordered',
            orderedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            createdBy: pharmacistUser._id
        });

        // 7. Seed inventory movements for past week chart & audit logs
        const days = 7;
        const txs = [];

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Northside stock movements
            txs.push({
                medicineId: northMeds[0]._id, // Paracetamol
                pharmacyId: pharmacyNorth._id,
                userId: pharmacistUser._id,
                transactionType: 'Stock In',
                quantityChanged: Math.floor(Math.random() * 80) + 20,
                createdAt: date
            });

            txs.push({
                medicineId: northMeds[0]._id,
                pharmacyId: pharmacyNorth._id,
                userId: pharmacistUser._id,
                transactionType: 'Stock Out',
                quantityChanged: -(Math.floor(Math.random() * 50) + 10),
                createdAt: date
            });

            // Downtown stock movements
            txs.push({
                medicineId: downtownMeds[0]._id, // Paracetamol
                pharmacyId: pharmacyDowntown._id,
                userId: managerUser._id,
                transactionType: 'Stock In',
                quantityChanged: Math.floor(Math.random() * 60) + 15,
                createdAt: date
            });

            txs.push({
                medicineId: downtownMeds[0]._id,
                pharmacyId: pharmacyDowntown._id,
                userId: managerUser._id,
                transactionType: 'Stock Out',
                quantityChanged: -(Math.floor(Math.random() * 40) + 10),
                createdAt: date
            });
        }

        await InventoryTransaction.create(txs);

        res.json({
            message: 'Database seeded successfully with authentic Indian pharmaceutical data, alerts, reorders, and transactional activity!',
            pharmacies: [
                { id: pharmacyNorth._id, name: pharmacyNorth.name },
                { id: pharmacyDowntown._id, name: pharmacyDowntown.name }
            ],
            users: [
                { username: pharmacistUser.username, role: pharmacistUser.role, pharmacy: pharmacyNorth.name },
                { username: managerUser.username, role: managerUser.role, pharmacy: pharmacyDowntown.name },
                { username: adminUser.username, role: adminUser.role, pharmacy: pharmacyNorth.name }
            ]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Root check
app.get('/', (req, res) => {
    res.send('Pharmacy System API running.');
});

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
