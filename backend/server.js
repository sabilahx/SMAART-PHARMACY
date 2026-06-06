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

// Load models for seeder
import Pharmacy from './models/Pharmacy.js';
import User from './models/User.js';
import Medicine from './models/Medicine.js';

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

// Debug Seeder Route (for Phase 1 Manual Verification)
app.post('/api/debug/seed', async (req, res) => {
    try {
        // Clear existing database collections
        await Pharmacy.deleteMany({});
        await User.deleteMany({});
        await Medicine.deleteMany({});

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
        await Medicine.create([
            {
                name: 'Atorvastatin 20mg',
                ndc: '00071-0156-40',
                category: 'Cardiovascular',
                stock: 1240,
                price: 0.15,
                supplier: 'Medline Industries',
                status: 'Active',
                pharmacyId: pharmacyNorth._id
            },
            {
                name: 'Amoxicillin 500mg',
                ndc: '00093-3109-05',
                category: 'Anti-infective',
                stock: 210,
                price: 0.22,
                supplier: 'McKesson Corp',
                status: 'Active',
                pharmacyId: pharmacyNorth._id
            },
            {
                name: 'Lisinopril 10mg',
                ndc: '00378-0219-01',
                category: 'Cardiovascular',
                stock: 680,
                price: 0.08,
                supplier: 'Medline Industries',
                status: 'Active',
                pharmacyId: pharmacyDowntown._id
            },
            {
                name: 'Metformin 1000mg',
                ndc: '50090-2849-00',
                category: 'Endocrine',
                stock: 135,
                price: 0.12,
                supplier: 'Cardinal Health',
                status: 'Inactive',
                pharmacyId: pharmacyDowntown._id
            },
            {
                name: 'Humalog Insulin 100 U/mL',
                ndc: '00002-8290-01',
                category: 'Emergency',
                stock: 15,
                price: 32.50,
                supplier: 'Cardinal Health',
                status: 'Active',
                pharmacyId: pharmacyDowntown._id
            }
        ]);

        res.json({
            message: 'Database seeded successfully!',
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
