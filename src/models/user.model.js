const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
        userType: {
            type: String,
            enum: ['tenant', 'admin', 'landlord'],
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property'
        }
    }, {
        timestamps: true
    }
);

module.exports = mongoose.model('User', UsuarioSchema);