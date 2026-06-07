import Alert from '../models/Alert.js';

// Retrieve active alerts scoped by pharmacyId
export const getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({
            pharmacyId: req.user.pharmacyId,
            isRead: false
        }).sort({ createdAt: -1 });

        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Dismiss/Mark alert as read
export const markAlertAsRead = async (req, res) => {
    try {
        const alert = await Alert.findOneAndUpdate(
            { _id: req.params.id, pharmacyId: req.user.pharmacyId },
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
