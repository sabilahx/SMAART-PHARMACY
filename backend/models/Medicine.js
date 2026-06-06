import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    ndc: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    supplier: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Archived'],
        default: 'Active',
        required: true
    },
    expiryDate: {
        type: Date,
        index: true
    },
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true,
        index: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
