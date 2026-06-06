import Medicine from '../models/Medicine.js';
import InventoryTransaction from '../models/InventoryTransaction.js';

export const getDashboardData = async (req, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        thirtyDaysFromNow.setHours(23, 59, 59, 999);

        // Fetch all non-archived medicines for this tenant
        const medicines = await Medicine.find({
            pharmacyId,
            status: { $ne: 'Archived' }
        });

        // 1. Basic Stats
        let totalValuation = 0;
        let activeChannelsCount = 0;
        let outOfStockCount = 0;
        let lowStockCount = 0;
        let expiredCount = 0;
        let nearExpiryCount = 0;

        const expiryAlerts = [];
        const lowStockAlerts = [];

        medicines.forEach(m => {
            const isZero = m.stock === 0;
            const isLow = m.stock > 0 && m.stock < 20;

            if (m.status === 'Active') {
                activeChannelsCount++;
                if (isZero) outOfStockCount++;
                if (isLow) {
                    lowStockCount++;
                    lowStockAlerts.push(m);
                }
            }

            totalValuation += m.stock * m.price;

            if (m.expiryDate) {
                const expDate = new Date(m.expiryDate);
                if (expDate < today) {
                    expiredCount++;
                    expiryAlerts.push({
                        _id: m._id,
                        name: m.name,
                        ndc: m.ndc,
                        stock: m.stock,
                        expiryDate: m.expiryDate,
                        status: 'Expired',
                        category: m.category
                    });
                } else if (expDate <= thirtyDaysFromNow) {
                    nearExpiryCount++;
                    expiryAlerts.push({
                        _id: m._id,
                        name: m.name,
                        ndc: m.ndc,
                        stock: m.stock,
                        expiryDate: m.expiryDate,
                        status: 'Near Expiry',
                        category: m.category
                    });
                }
            }
        });

        // 2. Recent Transactions
        const recentTransactions = await InventoryTransaction.find({ pharmacyId })
            .populate('medicineId', 'name ndc category')
            .populate('userId', 'username')
            .sort({ createdAt: -1 })
            .limit(5);

        // 3. Category Distribution
        const categoryMap = {};
        medicines.forEach(m => {
            if (!categoryMap[m.category]) {
                categoryMap[m.category] = { category: m.category, count: 0, valuation: 0 };
            }
            categoryMap[m.category].count += 1;
            categoryMap[m.category].valuation += m.stock * m.price;
        });
        const categoryData = Object.values(categoryMap);

        // 4. Daily Stock Movements (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const last7DaysTransactions = await InventoryTransaction.find({
            pharmacyId,
            createdAt: { $gte: sevenDaysAgo }
        }).sort({ createdAt: 1 });

        // Initialize 7 days list
        const dailyMovementsMap = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyMovementsMap[dateStr] = { date: dateStr, label, stockIn: 0, stockOut: 0 };
        }

        last7DaysTransactions.forEach(t => {
            const dateStr = new Date(t.createdAt).toISOString().split('T')[0];
            if (dailyMovementsMap[dateStr]) {
                if (t.transactionType === 'Stock In') {
                    dailyMovementsMap[dateStr].stockIn += Math.abs(t.quantityChanged);
                } else if (t.transactionType === 'Stock Out') {
                    dailyMovementsMap[dateStr].stockOut += Math.abs(t.quantityChanged);
                }
            }
        });

        const dailyMovements = Object.values(dailyMovementsMap);

        res.json({
            metrics: {
                totalValuation,
                activeChannels: activeChannelsCount,
                outOfStock: outOfStockCount,
                lowStock: lowStockCount,
                expired: expiredCount,
                nearExpiry: nearExpiryCount
            },
            expiryAlerts: expiryAlerts.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)),
            lowStockAlerts: lowStockAlerts.sort((a, b) => a.stock - b.stock),
            recentTransactions,
            categoryData,
            dailyMovements
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
