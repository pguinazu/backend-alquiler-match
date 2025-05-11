const Property = require('../models/property.model');

// Add a new property
const addProperty = async (req, res) => {
    try {
        const {
            address,
            price,
            size,
            age,
            contractDuration,
            requirements
        } = req.body;

        // Create new property
        const property = new Property({
            address,
            price,
            size,
            age,
            contractDuration,
            requirements,
            owner: req.user._id, // Link to authenticated user
            userType: req.user.userType
        });

        // Save to database
        await property.save();

        res.status(201).json({
            message: 'Property added successfully',
            property
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while adding property' });
    }
};

module.exports = {
    addProperty
};