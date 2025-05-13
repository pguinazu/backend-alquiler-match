const Property = require('../models/property.model');
const User = require('../models/user.model');

const findMatchesForTenant = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('propertyId');
        if (!user || user.userType !== 'tenant') {
            return res.status(403).json({ message: 'Only tenants can request matches' });
        }

        const tenantProperty = user.propertyId;
        if (!tenantProperty || !tenantProperty.requirements?.guarantors) {
            return res.status(404).json({ message: 'Tenant property or guarantees not found' });
        }

        const g = tenantProperty.requirements.guarantors;

        const matches = await Property.find({
            createdByType: 'landlord',
            'requirements.tenantRequirements.salaryGuarantee.seniorityYears': { $lte: g.salaryGuarantee.seniorityYears },
            'requirements.tenantRequirements.salaryGuarantee.minSalary': { $lte: g.salaryGuarantee.minSalary },
            'requirements.tenantRequirements.salaryGuarantee.goodCreditHistory': {
                $in: [true, g.salaryGuarantee.goodCreditHistory]
            },
            'requirements.tenantRequirements.pets.quantity': { $gte: g.pets?.quantity || 0 },
            'requirements.tenantRequirements.pets.petType': {
                $in: [g.pets?.petType || 'none', 'none']
            },
            'requirements.tenantRequirements.pets.size': {
                $in: [g.pets?.size || 'none', 'none']
            }
        });

        res.status(200).json(matches);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error while matching for tenant' });
    }
};

const findMatchesForLandlord = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('propertyId');
        if (!user || user.userType !== 'landlord') {
            return res.status(403).json({ message: 'Only landlords can request matches' });
        }

        const landlordProperty = user.propertyId;
        if (!landlordProperty || !landlordProperty.requirements?.tenantRequirements) {
            return res.status(404).json({ message: 'Landlord property or requirements not found' });
        }

        const r = landlordProperty.requirements.tenantRequirements;

        const matches = await Property.find({
            createdByType: 'tenant',
            'requirements.guarantors.salaryGuarantee.seniorityYears': { $gte: r.salaryGuarantee.seniorityYears },
            'requirements.guarantors.salaryGuarantee.minSalary': { $gte: r.salaryGuarantee.minSalary },
            'requirements.guarantors.salaryGuarantee.goodCreditHistory': {
                $in: [true, r.salaryGuarantee.goodCreditHistory]
            },
            'requirements.guarantors.pets.quantity': { $lte: r.pets?.quantity || 0 },
            'requirements.guarantors.pets.petType': {
                $in: [r.pets?.petType || 'none', 'none']
            },
            'requirements.guarantors.pets.size': {
                $in: [r.pets?.size || 'none', 'none']
            }
        });

        res.status(200).json(matches);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error while matching for landlord' });
    }
};

module.exports = {
    findMatchesForTenant,
    findMatchesForLandlord
};
