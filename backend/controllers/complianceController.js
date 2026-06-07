import InventoryTransaction from '../models/InventoryTransaction.js';

// Export compliance audit trail to CSV format (Drugs & Cosmetics Act compliant audit log)
export const exportAuditTrailCSV = async (req, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;

        const transactions = await InventoryTransaction.find({ pharmacyId })
            .populate('medicineId', 'name ndc category price')
            .populate('userId', 'username')
            .sort({ createdAt: -1 });

        // CSV headers
        let csvContent = 'Date,Transaction Type,Medicine Name,NDC,Category,Quantity Changed,Unit Price (INR),Batch Number,Supplier,Received Date,Operator (User),Reason,Notes\n';

        transactions.forEach(t => {
            const dateStr = t.createdAt ? new Date(t.createdAt).toISOString() : '';
            const type = t.transactionType || '';
            const name = t.medicineId ? t.medicineId.name.replace(/"/g, '""') : 'Unknown Medicine';
            const ndc = t.medicineId ? t.medicineId.ndc : '';
            const cat = t.medicineId ? t.medicineId.category : '';
            const qty = t.quantityChanged || 0;
            const price = t.medicineId ? t.medicineId.price : 0;
            const batch = t.batchNumber || '';
            const supplier = t.supplier ? t.supplier.replace(/"/g, '""') : '';
            const rxDate = t.receivedDate ? new Date(t.receivedDate).toISOString() : '';
            const operator = t.userId ? t.userId.username : '';
            const reason = t.reason ? t.reason.replace(/"/g, '""') : '';
            const notes = t.notes ? t.notes.replace(/"/g, '""') : '';

            csvContent += `"${dateStr}","${type}","${name}","${ndc}","${cat}",${qty},${price},"${batch}","${supplier}","${rxDate}","${operator}","${reason}","${notes}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=drugs_compliance_audit_trail.csv');
        res.status(200).send(csvContent);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
