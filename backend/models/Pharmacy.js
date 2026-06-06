import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
export default Pharmacy;
