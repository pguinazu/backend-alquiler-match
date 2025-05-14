const Property = require('../models/property.model');
const User = require('../models/user.model');

const findMatchesForTenant = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('propertyId');
        
        if (!user || user.userType !== 'tenant') {
            return res.status(403).json({ message: 'Only tenants can request matches' });
        }

        const tenantProperty = (await Property.find({ owner: req.user._id })).at(0);
        
        if (!tenantProperty || !tenantProperty.requirements?.guarantors) {
            return res.status(404).json({ message: 'Tenant property or guarantees not found d' });
        }
        
        const guarantorsObj = tenantProperty.requirements.guarantors;
        const tenantRequirementsObj = tenantProperty.requirements.tenantRequirements;
        
        const matches = await Property.find({
            userType: 'landlord',
            'requirements.tenantRequirements.salaryGuarantee.seniorityYears': { $lte: guarantorsObj.salaryGuarantee.seniorityYears },
            'requirements.tenantRequirements.salaryGuarantee.minSalary': { $lte: guarantorsObj.salaryGuarantee.minSalary },
            'requirements.tenantRequirements.salaryGuarantee.goodCreditHistory': {
                $in: [true, guarantorsObj.salaryGuarantee.goodCreditHistory]
            },
            'requirements.tenantRequirements.pets.quantity': { $gte: guarantorsObj.pets?.quantity || 0 },
            'requirements.tenantRequirements.pets.petType': { $eq: tenantRequirementsObj.pets?.petType || 'none' },
            'requirements.tenantRequirements.pets.size': {
                $in: [tenantRequirementsObj.pets?.size || 'none', 'none']
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
