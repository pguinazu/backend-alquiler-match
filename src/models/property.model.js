const mongoose = require('mongoose');

// Schema for Landlord Guarantor
const LandlordGuarantorSchema = new mongoose.Schema({
    propertyDeed: {
        type: String,
        required: true
    },
    couldBeFamily: {
        type: Boolean,
        default: false
    }
});

// Schema for Salary Guarantee (shared by landlord and tenant requirements)
const SalaryGuaranteeSchema = new mongoose.Schema({
    seniorityYears: {
        type: Number,
        required: true
    },
    minSalary: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    goodCreditHistory: {
        type: Boolean,
        default: true
    }
});

// Schema for Tenant Requirements
const TenantRequirementsSchema = new mongoose.Schema({
    salaryGuarantee: {
        type: SalaryGuaranteeSchema,
        required: true
    },
    pets: {
        quantity: {
            type: Number,
            default: 0
        },
        petType: {
            type: String,
            enum: ['dog', 'cat', 'bird', 'other', 'none'],
            default: 'none'
        },
        size: {
            type: String,
            enum: ['s', 'm', 'l', 'xl', 'none'],
            default: 'none'
        }
    }
});

// Schema for Requirements (combines landlord and tenant requirements)
const RequirementsSchema = new mongoose.Schema({
    guarantors: {
        landlordGuarantor: {
            type: LandlordGuarantorSchema,
            required: true
        },
        salaryGuarantee: {
            type: SalaryGuaranteeSchema,
            required: true
        }
    },
    tenantRequirements: {
        type: TenantRequirementsSchema,
        required: true
    }
});

// Schema for Property
const PropertySchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    contractDuration: {
        type: String,
        required: true
    },
    requirements: {
        type: RequirementsSchema,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userType: {
        type: String,
        enum: ['tenant', 'admin', 'landlord'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Property', PropertySchema);