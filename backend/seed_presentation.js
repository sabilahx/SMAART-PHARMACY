import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pharmacy from './models/Pharmacy.js';
import User from './models/User.js';
import Medicine from './models/Medicine.js';
import Supplier from './models/Supplier.js';
import PurchaseOrder from './models/PurchaseOrder.js';
import InventoryTransaction from './models/InventoryTransaction.js';
import Alert from './models/Alert.js';
import ReorderRequest from './models/ReorderRequest.js';
import EmergencyRequest from './models/EmergencyRequest.js';
import BranchHealthHistory from './models/BranchHealthHistory.js';
import SupplierAudit from './models/SupplierAudit.js';
import BranchAudit from './models/BranchAudit.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pharmacy_management_dev';

async function seedPresentation() {
    try {
        console.log('Connecting to MongoDB at:', uri);
        await mongoose.connect(uri);
        console.log('Connected! Purging old demo collections...');

        await Promise.all([
            Pharmacy.deleteMany({}),
            User.deleteMany({}),
            Medicine.deleteMany({}),
            Supplier.deleteMany({}),
            PurchaseOrder.deleteMany({}),
            InventoryTransaction.deleteMany({}),
            Alert.deleteMany({}),
            ReorderRequest.deleteMany({}),
            EmergencyRequest.deleteMany({}),
            BranchHealthHistory.deleteMany({}),
            SupplierAudit.deleteMany({}),
            BranchAudit.deleteMany({})
        ]);

        console.log('1. Creating Pharmacy Branches...');
        const pharmacyNorth = await Pharmacy.create({
            name: 'Northside Pharmacy',
            branchCode: 'BR-001',
            address: '456 Medical Enclave, Sector 4, New Delhi',
            coordinator: 'Dr. Rajesh Sharma',
            contactPhone: '+91 98765 43210',
            gstin: '07AAAAA1111A1Z1',
            drugLicence: 'DL-20-112233/21',
            email: 'northside@smaartpharmacy.in',
            openingHours: '24 Hours Open',
            status: 'Active',
            healthScore: 92
        });

        const pharmacyDowntown = await Pharmacy.create({
            name: 'Downtown Medical Center',
            branchCode: 'BR-002',
            address: '101 Central Boulevard, Connaught Place',
            coordinator: 'Dr. Anita Desai',
            contactPhone: '+91 87654 32109',
            gstin: '07BBBBB2222B2Z2',
            drugLicence: 'DL-20-445566/21',
            email: 'downtown@smaartpharmacy.in',
            openingHours: '8:00 AM - 11:00 PM',
            status: 'Active',
            healthScore: 86
        });

        const pharmacyMetro = await Pharmacy.create({
            name: 'Metro Care Pharmacy',
            branchCode: 'BR-003',
            address: '88 Ring Road, South Extension',
            coordinator: 'Dr. S. K. Verma',
            contactPhone: '+91 76543 21098',
            gstin: '07CCCCC3333C3Z3',
            drugLicence: 'DL-20-778899/21',
            email: 'metro@smaartpharmacy.in',
            openingHours: '9:00 AM - 10:00 PM',
            status: 'Active',
            healthScore: 95
        });

        console.log('2. Creating Authenticated Users for Demo...');
        const adminUser = await User.create({
            username: 'admin_sys',
            password: 'password123',
            pharmacyId: pharmacyNorth._id,
            role: 'Admin',
            fullName: 'System Administrator',
            phone: '+91 99000 11223',
            email: 'admin@smaartpharmacy.in',
            qualification: 'Pharm.D',
            registrationNumber: 'DL-RPH-100200',
            shiftType: 'Day',
            status: 'Active'
        });

        const managerNorth = await User.create({
            username: 'manager_northside',
            password: 'password123',
            pharmacyId: pharmacyNorth._id,
            role: 'Manager',
            fullName: 'Vikram Malhotra',
            phone: '+91 98111 22334',
            email: 'vikram.m@smaartpharmacy.in',
            qualification: 'M.Pharm',
            registrationNumber: 'DL-RPH-334455',
            shiftType: 'Day',
            status: 'Active'
        });

        const pharmacistNorth = await User.create({
            username: 'pharmacist_northside',
            password: 'password123',
            pharmacyId: pharmacyNorth._id,
            role: 'Pharmacist',
            fullName: 'Rahul Sharma',
            phone: '+91 97222 33445',
            email: 'rahul.s@smaartpharmacy.in',
            qualification: 'B.Pharm',
            registrationNumber: 'UP-RPH-992211',
            shiftType: 'Day',
            status: 'Active'
        });

        const managerDowntown = await User.create({
            username: 'manager_downtown',
            password: 'password123',
            pharmacyId: pharmacyDowntown._id,
            role: 'Manager',
            fullName: 'Pooja Iyer',
            phone: '+91 96333 44556',
            email: 'pooja.i@smaartpharmacy.in',
            qualification: 'M.Pharm',
            registrationNumber: 'MH-RPH-554433',
            shiftType: 'Rotational',
            status: 'Active'
        });

        // Set assigned managers
        pharmacyNorth.assignedManager = managerNorth._id;
        await pharmacyNorth.save();
        pharmacyDowntown.assignedManager = managerDowntown._id;
        await pharmacyDowntown.save();

        console.log('3. Creating Pharmaceutical Suppliers...');
        const suppliers = await Supplier.create([
            {
                name: 'Cipla Pharmaceuticals',
                contactPerson: 'Amit Patel',
                phone: '+91 91234 56789',
                email: 'orders@cipla-supply.com',
                address: 'Cipla House, Peninsula Business Park, Mumbai',
                gstNumber: '27AAACC1234K1Z1',
                status: 'Active',
                rating: 4.8,
                healthScore: 96,
                pharmacyId: pharmacyNorth._id,
                performanceMetrics: {
                    totalOrders: 18,
                    completedOrders: 16,
                    pendingOrders: 2,
                    totalPurchaseValue: 245000,
                    averageDeliveryTime: 3.2,
                    returnRate: 0.4
                }
            },
            {
                name: 'Sun Pharma Distributors',
                contactPerson: 'Sanjay Shah',
                phone: '+91 92345 67890',
                email: 'sales@sunpharma.com',
                address: 'Sun House, Western Express Highway, Goregaon, Mumbai',
                gstNumber: '27AAACC5678P1Z3',
                status: 'Active',
                rating: 4.5,
                healthScore: 88,
                pharmacyId: pharmacyNorth._id,
                performanceMetrics: {
                    totalOrders: 14,
                    completedOrders: 12,
                    pendingOrders: 1,
                    totalPurchaseValue: 180000,
                    averageDeliveryTime: 4.0,
                    returnRate: 1.1
                }
            },
            {
                name: 'Dr. Reddy’s Laboratories',
                contactPerson: 'K. V. Raman',
                phone: '+91 93456 78901',
                email: 'supply@drreddys.com',
                address: 'Road No 3, Banjara Hills, Hyderabad',
                gstNumber: '36AAACD1122H1Z5',
                status: 'Active',
                rating: 4.7,
                healthScore: 94,
                pharmacyId: pharmacyNorth._id,
                performanceMetrics: {
                    totalOrders: 12,
                    completedOrders: 11,
                    pendingOrders: 1,
                    totalPurchaseValue: 155000,
                    averageDeliveryTime: 3.5,
                    returnRate: 0.8
                }
            },
            {
                name: 'Abbott India Healthcare',
                contactPerson: 'Rajesh Khanna',
                phone: '+91 94567 89012',
                email: 'distributor@abbott.co.in',
                address: 'Godrej One, Vikhroli East, Mumbai',
                gstNumber: '27AAACA9012F1Z8',
                status: 'Active',
                rating: 4.6,
                healthScore: 91,
                pharmacyId: pharmacyNorth._id,
                performanceMetrics: {
                    totalOrders: 10,
                    completedOrders: 9,
                    pendingOrders: 1,
                    totalPurchaseValue: 135000,
                    averageDeliveryTime: 3.8,
                    returnRate: 0.6
                }
            }
        ]);

        console.log('4. Seeding Clinical Medicines for Northside (Primary Demo Branch)...');
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;

        const northMedicinesData = [
            // Analgesics & Anti-Inflammatory
            {
                name: 'Paracetamol 650mg (Dolo)',
                ndc: 'CI-PAR-650',
                category: 'Analgesic',
                stock: 1250,
                price: 32.50,
                supplierCost: 20.00,
                supplier: 'Cipla Pharmaceuticals',
                primarySupplier: suppliers[0]._id,
                reorderPoint: 150,
                expiryDate: new Date(now + 420 * DAY),
                status: 'Active'
            },
            {
                name: 'Ibuprofen 400mg (Brufen)',
                ndc: 'AB-IBU-400',
                category: 'Analgesic',
                stock: 420,
                price: 45.00,
                supplierCost: 30.00,
                supplier: 'Abbott India Healthcare',
                primarySupplier: suppliers[3]._id,
                reorderPoint: 80,
                expiryDate: new Date(now + 360 * DAY),
                status: 'Active'
            },
            {
                name: 'Tramadol 50mg (Ultracet)',
                ndc: 'SP-TRA-050',
                category: 'Analgesic',
                stock: 85,
                price: 68.00,
                supplierCost: 45.00,
                supplier: 'Sun Pharma Distributors',
                primarySupplier: suppliers[1]._id,
                reorderPoint: 40,
                expiryDate: new Date(now + 280 * DAY),
                status: 'Active'
            },

            // Anti-infectives & Antibiotics
            {
                name: 'Amoxicillin 500mg (Augmentin)',
                ndc: 'SP-AMO-500',
                category: 'Anti-infective',
                stock: 14, // LOW STOCK (Threshold 50)
                price: 125.00,
                supplierCost: 85.00,
                supplier: 'Sun Pharma Distributors',
                primarySupplier: suppliers[1]._id,
                reorderPoint: 50,
                expiryDate: new Date(now + 300 * DAY),
                status: 'Active'
            },
            {
                name: 'Azithromycin 500mg (Azee)',
                ndc: 'CI-AZI-500',
                category: 'Anti-infective',
                stock: 240,
                price: 118.00,
                supplierCost: 78.00,
                supplier: 'Cipla Pharmaceuticals',
                primarySupplier: suppliers[0]._id,
                reorderPoint: 60,
                expiryDate: new Date(now + 320 * DAY),
                status: 'Active'
            },
            {
                name: 'Ciprofloxacin 500mg (Cifran)',
                ndc: 'SP-CIP-500',
                category: 'Anti-infective',
                stock: 0, // OUT OF STOCK
                price: 88.00,
                supplierCost: 55.00,
                supplier: 'Sun Pharma Distributors',
                primarySupplier: suppliers[1]._id,
                reorderPoint: 40,
                expiryDate: new Date(now + 210 * DAY),
                status: 'Active'
            },
            {
                name: 'Cefixime 200mg (Zifi)',
                ndc: 'DR-CEF-200',
                category: 'Anti-infective',
                stock: 160,
                price: 104.00,
                supplierCost: 68.00,
                supplier: 'Dr. Reddy’s Laboratories',
                primarySupplier: suppliers[2]._id,
                reorderPoint: 50,
                expiryDate: new Date(now + 270 * DAY),
                status: 'Active'
            },

            // Cardiovascular
            {
                name: 'Amlodipine 5mg (Amlong)',
                ndc: 'DR-AML-005',
                category: 'Cardiovascular',
                stock: 6, // LOW STOCK (Threshold 40)
                price: 48.00,
                supplierCost: 30.00,
                supplier: 'Dr. Reddy’s Laboratories',
                primarySupplier: suppliers[2]._id,
                reorderPoint: 40,
                expiryDate: new Date(now + 310 * DAY),
                status: 'Active'
            },
            {
                name: 'Telmisartan 40mg (Telma)',
                ndc: 'AB-TEL-040',
                category: 'Cardiovascular',
                stock: 310,
                price: 88.50,
                supplierCost: 58.00,
                supplier: 'Abbott India Healthcare',
                primarySupplier: suppliers[3]._id,
                reorderPoint: 60,
                expiryDate: new Date(now + 400 * DAY),
                status: 'Active'
            },
            {
                name: 'Atorvastatin 20mg (Atorva)',
                ndc: 'CI-ATO-020',
                category: 'Cardiovascular',
                stock: 195,
                price: 142.00,
                supplierCost: 95.00,
                supplier: 'Cipla Pharmaceuticals',
                primarySupplier: suppliers[0]._id,
                reorderPoint: 50,
                expiryDate: new Date(now + 340 * DAY),
                status: 'Active'
            },

            // Endocrine & Diabetes
            {
                name: 'Metformin 500mg (Glycomet)',
                ndc: 'AB-MET-500',
                category: 'Endocrine',
                stock: 890,
                price: 45.00,
                supplierCost: 28.00,
                supplier: 'Abbott India Healthcare',
                primarySupplier: suppliers[3]._id,
                reorderPoint: 100,
                expiryDate: new Date(now + 500 * DAY),
                status: 'Active'
            },
            {
                name: 'Glimepiride 2mg (Amaryl)',
                ndc: 'DR-GLI-002',
                category: 'Endocrine',
                stock: 22, // EXPIRING SOON (14 days left!)
                price: 78.00,
                supplierCost: 50.00,
                supplier: 'Dr. Reddy’s Laboratories',
                primarySupplier: suppliers[2]._id,
                reorderPoint: 30,
                expiryDate: new Date(now + 14 * DAY),
                status: 'Active'
            },
            {
                name: 'Teneligliptin 20mg (Tenelimac)',
                ndc: 'SP-TEN-020',
                category: 'Endocrine',
                stock: 135,
                price: 138.00,
                supplierCost: 92.00,
                supplier: 'Sun Pharma Distributors',
                primarySupplier: suppliers[1]._id,
                reorderPoint: 40,
                expiryDate: new Date(now + 260 * DAY),
                status: 'Active'
            },

            // Gastrointestinal
            {
                name: 'Pantoprazole 40mg (Pan 40)',
                ndc: 'AB-PAN-040',
                category: 'Gastrointestinal',
                stock: 580,
                price: 98.00,
                supplierCost: 62.00,
                supplier: 'Abbott India Healthcare',
                primarySupplier: suppliers[3]._id,
                reorderPoint: 80,
                expiryDate: new Date(now + 450 * DAY),
                status: 'Active'
            },
            {
                name: 'Omeprazole 20mg (Omez)',
                ndc: 'DR-OME-020',
                category: 'Gastrointestinal',
                stock: 0, // OUT OF STOCK
                price: 64.00,
                supplierCost: 40.00,
                supplier: 'Dr. Reddy’s Laboratories',
                primarySupplier: suppliers[2]._id,
                reorderPoint: 50,
                expiryDate: new Date(now + 220 * DAY),
                status: 'Active'
            },
            {
                name: 'Domperidone 10mg (Vomistop)',
                ndc: 'CI-DOM-010',
                category: 'Gastrointestinal',
                stock: 310,
                price: 36.00,
                supplierCost: 22.00,
                supplier: 'Cipla Pharmaceuticals',
                primarySupplier: suppliers[0]._id,
                reorderPoint: 50,
                expiryDate: new Date(now + 380 * DAY),
                status: 'Active'
            },
            {
                name: 'Rabeprazole + Levosulpiride (Razo-L)',
                ndc: 'DR-RAB-020',
                category: 'Gastrointestinal',
                stock: 18, // EXPIRING SOON (22 days left!)
                price: 195.00,
                supplierCost: 130.00,
                supplier: 'Dr. Reddy’s Laboratories',
                primarySupplier: suppliers[2]._id,
                reorderPoint: 25,
                expiryDate: new Date(now + 22 * DAY),
                status: 'Active'
            },

            // Respiratory & Anti-Allergic
            {
                name: 'Montelukast + Levocetirizine (Montair-LC)',
                ndc: 'CI-MON-010',
                category: 'Respiratory',
                stock: 440,
                price: 172.00,
                supplierCost: 110.00,
                supplier: 'Cipla Pharmaceuticals',
                primarySupplier: suppliers[0]._id,
                reorderPoint: 70,
                expiryDate: new Date(now + 360 * DAY),
                status: 'Active'
            },
            {
                name: 'Budesonide Inhaler 200mcg (Budecort)',
                ndc: 'CI-BUD-200',
                category: 'Respiratory',
                stock: 72,
                price: 335.00,
                supplierCost: 220.00,
                supplier: 'Cipla Pharmaceuticals',
                primarySupplier: suppliers[0]._id,
                reorderPoint: 30,
                expiryDate: new Date(now + 300 * DAY),
                status: 'Active'
            },
            {
                name: 'Salbutamol Inhaler 100mcg (Asthalin)',
                ndc: 'CI-SAL-100',
                category: 'Respiratory',
                stock: 125,
                price: 152.00,
                supplierCost: 98.00,
                supplier: 'Cipla Pharmaceuticals',
                primarySupplier: suppliers[0]._id,
                reorderPoint: 40,
                expiryDate: new Date(now + 340 * DAY),
                status: 'Active'
            },

            // Dead Stock Demo Item (Expired 8 days ago)
            {
                name: 'Expired Test Formulation 100ml',
                ndc: 'EX-TST-100',
                category: 'General',
                stock: 10,
                price: 85.00,
                supplierCost: 55.00,
                supplier: 'Cipla Pharmaceuticals',
                primarySupplier: suppliers[0]._id,
                reorderPoint: 20,
                expiryDate: new Date(now - 8 * DAY), // Expired!
                status: 'Active'
            }
        ];

        const createdNorthMeds = await Medicine.create(
            northMedicinesData.map(m => ({
                ...m,
                pharmacyId: pharmacyNorth._id,
                createdBy: pharmacistNorth._id
            }))
        );

        console.log('5. Seeding Surplus Stock in Sister Branches (for Emergency Search)...');
        // Give Downtown branch stock of Ciprofloxacin and Omeprazole so Northside can find them via Emergency Search!
        await Medicine.create([
            {
                name: 'Ciprofloxacin 500mg (Cifran)',
                ndc: 'SP-CIP-500',
                category: 'Anti-infective',
                stock: 180, // Sister store has 180 units!
                price: 88.00,
                supplierCost: 55.00,
                supplier: 'Sun Pharma Distributors',
                primarySupplier: suppliers[1]._id,
                reorderPoint: 40,
                expiryDate: new Date(now + 300 * DAY),
                pharmacyId: pharmacyDowntown._id,
                status: 'Active',
                createdBy: managerDowntown._id
            },
            {
                name: 'Omeprazole 20mg (Omez)',
                ndc: 'DR-OME-020',
                category: 'Gastrointestinal',
                stock: 95, // Sister store has 95 units!
                price: 64.00,
                supplierCost: 40.00,
                supplier: 'Dr. Reddy’s Laboratories',
                primarySupplier: suppliers[2]._id,
                reorderPoint: 50,
                expiryDate: new Date(now + 320 * DAY),
                pharmacyId: pharmacyDowntown._id,
                status: 'Active',
                createdBy: managerDowntown._id
            },
            {
                name: 'Paracetamol 650mg (Dolo)',
                ndc: 'CI-PAR-650',
                category: 'Analgesic',
                stock: 800,
                price: 32.50,
                supplierCost: 20.00,
                supplier: 'Cipla Pharmaceuticals',
                primarySupplier: suppliers[0]._id,
                reorderPoint: 100,
                expiryDate: new Date(now + 400 * DAY),
                pharmacyId: pharmacyDowntown._id,
                status: 'Active',
                createdBy: managerDowntown._id
            },
            {
                name: 'Amlodipine 5mg (Amlong)',
                ndc: 'DR-AML-005',
                category: 'Cardiovascular',
                stock: 120, // Sister store has 120 units!
                price: 48.00,
                supplierCost: 30.00,
                supplier: 'Dr. Reddy’s Laboratories',
                primarySupplier: suppliers[2]._id,
                reorderPoint: 30,
                expiryDate: new Date(now + 310 * DAY),
                pharmacyId: pharmacyMetro._id,
                status: 'Active',
                createdBy: adminUser._id
            }
        ]);

        console.log('6. Seeding Real Purchase Orders...');
        await PurchaseOrder.create([
            {
                poNumber: 'PO-202611-0012',
                supplierId: suppliers[0]._id,
                pharmacyId: pharmacyNorth._id,
                branchName: 'Northside Pharmacy',
                medicines: [
                    {
                        medicineId: createdNorthMeds[0]._id,
                        name: 'Paracetamol 650mg (Dolo)',
                        quantity: 500,
                        unitCost: 20.00,
                        totalCost: 10000.00
                    },
                    {
                        medicineId: createdNorthMeds[4]._id,
                        name: 'Azithromycin 500mg (Azee)',
                        quantity: 100,
                        unitCost: 78.00,
                        totalCost: 7800.00
                    }
                ],
                totalCost: 17800.00,
                orderDate: new Date(now - 8 * DAY),
                expectedDeliveryDate: new Date(now - 3 * DAY),
                actualDeliveryDate: new Date(now - 3 * DAY),
                status: 'Delivered',
                createdBy: managerNorth._id,
                approvedBy: adminUser._id,
                notes: 'Received in full. Cold-chain and packaging verified.'
            },
            {
                poNumber: 'PO-202611-0015',
                supplierId: suppliers[1]._id,
                pharmacyId: pharmacyNorth._id,
                branchName: 'Northside Pharmacy',
                medicines: [
                    {
                        medicineId: createdNorthMeds[3]._id,
                        name: 'Amoxicillin 500mg (Augmentin)',
                        quantity: 200,
                        unitCost: 85.00,
                        totalCost: 17000.00
                    }
                ],
                totalCost: 17000.00,
                orderDate: new Date(now - 2 * DAY),
                expectedDeliveryDate: new Date(now + 2 * DAY),
                status: 'In Transit',
                createdBy: managerNorth._id,
                approvedBy: adminUser._id,
                notes: 'Urgent replenishment dispatched via Blue Dart Logistics.'
            },
            {
                poNumber: 'PO-202611-0018',
                supplierId: suppliers[2]._id,
                pharmacyId: pharmacyNorth._id,
                branchName: 'Northside Pharmacy',
                medicines: [
                    {
                        medicineId: createdNorthMeds[7]._id,
                        name: 'Amlodipine 5mg (Amlong)',
                        quantity: 150,
                        unitCost: 30.00,
                        totalCost: 4500.00
                    }
                ],
                totalCost: 4500.00,
                orderDate: new Date(now - 1 * DAY),
                expectedDeliveryDate: new Date(now + 3 * DAY),
                status: 'Ordered',
                createdBy: pharmacistNorth._id,
                notes: 'Stock dropped below reorder threshold.'
            }
        ]);

        console.log('7. Seeding 7-Day Live Stock Movement Ledger...');
        const txList = [];
        // Past 7 days with authentic peaks
        const dailyMovementTemplate = [
            { dayOffset: 6, stockIn: 180, stockOut: 110 },
            { dayOffset: 5, stockIn: 90, stockOut: 140 },
            { dayOffset: 4, stockIn: 220, stockOut: 130 },
            { dayOffset: 3, stockIn: 140, stockOut: 165 },
            { dayOffset: 2, stockIn: 310, stockOut: 195 },
            { dayOffset: 1, stockIn: 120, stockOut: 150 },
            { dayOffset: 0, stockIn: 160, stockOut: 115 }
        ];

        for (const day of dailyMovementTemplate) {
            const date = new Date(now - day.dayOffset * DAY);

            // Stock In transaction
            txList.push({
                medicineId: createdNorthMeds[0]._id, // Paracetamol
                pharmacyId: pharmacyNorth._id,
                userId: managerNorth._id,
                transactionType: 'Stock In',
                quantityChanged: day.stockIn,
                batchNumber: `BN-2026-CIP-${100 + day.dayOffset}`,
                supplier: 'Cipla Pharmaceuticals',
                receivedDate: date,
                reason: 'Supplier Delivery Receipt',
                notes: 'Verified against PO',
                createdAt: new Date(date.getTime() + 10 * 60 * 1000)
            });

            // Stock Out transaction
            txList.push({
                medicineId: createdNorthMeds[0]._id,
                pharmacyId: pharmacyNorth._id,
                userId: pharmacistNorth._id,
                transactionType: 'Stock Out',
                quantityChanged: -day.stockOut,
                reason: 'Patient Prescription Dispensed',
                createdAt: new Date(date.getTime() + 35 * 60 * 1000)
            });

            // Dispensing other key meds
            txList.push({
                medicineId: createdNorthMeds[1]._id, // Brufen
                pharmacyId: pharmacyNorth._id,
                userId: pharmacistNorth._id,
                transactionType: 'Stock Out',
                quantityChanged: -Math.floor(day.stockOut * 0.4),
                reason: 'Retail Counter Sale',
                createdAt: new Date(date.getTime() + 75 * 60 * 1000)
            });
        }

        await InventoryTransaction.create(txList);

        console.log('8. Seeding Live Emergency Inter-Branch Transfer Request...');
        await EmergencyRequest.create([
            {
                sourcePharmacyId: pharmacyNorth._id,
                targetPharmacyId: pharmacyDowntown._id,
                medicineName: 'Ciprofloxacin 500mg (Cifran)',
                ndc: 'SP-CIP-500',
                quantityRequested: 20,
                urgency: 'Critical',
                status: 'Approved',
                notes: 'Emergency ICU prescription: Patient arriving from Sector 4 clinic.',
                contactPhone: '+91 98765 43210',
                requestedBy: pharmacistNorth._id
            },
            {
                sourcePharmacyId: pharmacyDowntown._id,
                targetPharmacyId: pharmacyNorth._id,
                medicineName: 'Paracetamol 650mg (Dolo)',
                ndc: 'CI-PAR-650',
                quantityRequested: 100,
                urgency: 'Medium',
                status: 'Pending',
                notes: 'High demand during seasonal flu surge.',
                contactPhone: '+91 87654 32109',
                requestedBy: managerDowntown._id
            }
        ]);

        console.log('9. Seeding System Alerts & Health History...');
        await Alert.create([
            {
                pharmacyId: pharmacyNorth._id,
                title: 'Cold-Chain Storage Temp Warning',
                message: 'Biological Refrigerator #1 reached +7.8°C (Optimal threshold: +2°C to +6°C). Automated cooling cycled.',
                severity: 'critical',
                alertType: 'General',
                isRead: false
            },
            {
                pharmacyId: pharmacyNorth._id,
                title: 'Supplier Return Window Alert',
                message: 'Glimepiride 2mg has 14 days before expiration. Eligible for 100% manufacturer return credit until Friday.',
                severity: 'warning',
                alertType: 'Health',
                isRead: false
            }
        ]);

        await BranchHealthHistory.create([
            { pharmacyId: pharmacyNorth._id, healthScore: 96, date: new Date(now - 3 * DAY) },
            { pharmacyId: pharmacyNorth._id, healthScore: 94, date: new Date(now - 2 * DAY) },
            { pharmacyId: pharmacyNorth._id, healthScore: 92, date: new Date(now - 1 * DAY) },
            { pharmacyId: pharmacyDowntown._id, healthScore: 90, date: new Date(now - 2 * DAY) },
            { pharmacyId: pharmacyDowntown._id, healthScore: 86, date: new Date(now - 1 * DAY) },
            { pharmacyId: pharmacyMetro._id, healthScore: 95, date: new Date(now - 1 * DAY) }
        ]);

        console.log('========================================================');
        console.log('PRESENTATION SEED COMPLETE!');
        console.log('Demo Credentials:');
        console.log('  Admin:       username: admin_sys           | password: password123');
        console.log('  Manager:     username: manager_northside   | password: password123');
        console.log('  Pharmacist:  username: pharmacist_northside| password: password123');
        console.log('Branches created:');
        console.log('  - Northside Pharmacy (BR-001) [Primary Demo Branch]');
        console.log('  - Downtown Medical Center (BR-002)');
        console.log('  - Metro Care Pharmacy (BR-003)');
        console.log('========================================================');

        process.exit(0);
    } catch (err) {
        console.error('Error during presentation seed:', err);
        process.exit(1);
    }
}

seedPresentation();
