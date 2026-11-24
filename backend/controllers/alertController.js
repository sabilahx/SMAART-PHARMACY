import Alert from '../models/Alert.js';

// Retrieve active alerts scoped by pharmacyId
export const getAlerts = async (req, res) => {
    try {
        let pharmacyId = req.user.pharmacyId;
        const query = { isRead: false };
        if (req.user.role === 'Admin') {
            if (req.query.branchId && req.query.branchId !== 'all' && req.query.branchId !== 'overview') {
                query.pharmacyId = req.query.branchId;
            }
        } else {
            query.pharmacyId = pharmacyId;
        }
        const alerts = await Alert.find(query).sort({ createdAt: -1 });

        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Dismiss/Mark alert as read
export const markAlertAsRead = async (req, res) => {
    try {
        let pharmacyId = req.user.pharmacyId;
        const query = { _id: req.params.id };
        if (req.user.role === 'Admin') {
            if (req.query.branchId && req.query.branchId !== 'all' && req.query.branchId !== 'overview') {
                query.pharmacyId = req.query.branchId;
            }
        } else {
            query.pharmacyId = pharmacyId;
        }
        const alert = await Alert.findOneAndUpdate(
            query,
            { isRead: true },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found or access denied.' });
        }

        res.json({ message: 'Alert successfully marked as read.', alert });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
