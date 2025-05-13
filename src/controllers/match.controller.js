const User = require('../models/user.model');
const Property = require('../models/property.model');
const Match = require('../models/match.model');
const axios = require('axios'); // For module-backend API calls

// Mock function to simulate module-backend credit score retrieval
const getCreditScore = async (userId) => {
  // Replace with actual module-backend API call
  // Example: const response = await axios.get(`https://module-backend/credit/${userId}`);
  return Math.floor(Math.random() * (850 - 300 + 1)) + 300; // Mock score between 300-850
};

// Match tenant properties to landlord properties
exports.matchPropertys = async (req, res) => {
  try {
    const tenants = await User.find({ userType: 'tenant' });
    const tenantProperties = await Property.find({ userType: 'tenant' });
    const landlordProperties = await Property.find({ userType: 'landlord' });

    const matchedProperties = [];

    for (const tenant of tenants) {
      // Fetch credit score
      const creditScore = await getCreditScore(tenant._id);
      await User.updateOne({ _id: tenant._id }, { creditScore });

      const tenantReqs = tenantProperties.filter(req => req.owner.equals(tenant._id));

      for (const tenantReq of tenantReqs) {
        for (const landlordReq of landlordProperties) {
          const landlord = await User.findById(landlordReq.owner);

          // Matching criteria
          let score = 0;

          // Credit score check (using tenantRequirements.salaryGuarantee.goodCreditHistory)
          if (
            landlordReq.requirements?.tenantRequirements?.salaryGuarantee?.goodCreditHistory &&
            creditScore >= 650 // Assume 650 as a reasonable threshold for "good credit"
          ) {
            score += 40; // Heavy weight for credit
          }

          // Price check (equivalent to rent)
          if (tenantReq.price >= landlordReq.price) {
            score += 30;
          }

          // Size check (assuming size is a numeric value after parsing)
          const tenantSize = parseFloat(tenantReq.size) || 0;
          const landlordSize = parseFloat(landlordReq.size) || 0;
          if (!tenantSize || !landlordSize || tenantSize <= landlordSize) {
            score += 15;
          }

          // Location check (geospatial, assuming address can be geocoded)
          if (tenantReq.address && landlordReq.address) {
            // Mock distance calculation (in absence of geocoding)
            // In production, use a geocoding API (e.g., Google Maps) to convert addresses to coordinates
            const mockDistance = Math.random() * 10000; // Mock distance in meters
            const maxDistance = 5000; // Assume 5km as default max distance
            if (mockDistance <= maxDistance) {
              score += 10;
            }
          }

          // Salary check (using tenantRequirements.salaryGuarantee.minSalary)
          if (
            !landlordReq.requirements?.tenantRequirements?.salaryGuarantee?.minSalary ||
            (tenantReq.requirements?.tenantRequirements?.salaryGuarantee?.minSalary &&
              tenantReq.requirements.tenantRequirements.salaryGuarantee.minSalary >=
                landlordReq.requirements.tenantRequirements.salaryGuarantee.minSalary)
          ) {
            score += 5;
          }

          if (score > 50) { // Threshold for a valid match
            // Save the match to the database
            const match = new Match({
              tenant: tenant._id,
              landlord: landlord._id,
              tenantProperty: tenantReq._id,
              landlordProperty: landlordReq._id,
              matchScore: score,
            });
            await match.save();

            // Add landlord property details to response
            matchedProperties.push({
              address: landlordReq.address,
              price: landlordReq.price,
              size: landlordReq.size,
              age: landlordReq.age,
              contractDuration: landlordReq.contractDuration,
              requirements: landlordReq.requirements,
              owner: landlordReq.owner,
              userType: landlordReq.userType,
              _id: landlordReq._id,
              createdAt: landlordReq.createdAt,
              updatedAt: landlordReq.updatedAt,
              __v: landlordReq.__v,
              matchScore: score, // Include match score for context
              tenantId: tenant._id, // Reference tenant
              tenantPropertyId: tenantReq._id, // Reference tenant property
            });
          }
        }
      }
    }

    res.status(200).json({
      message: 'Matching completed',
      properties: matchedProperties,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error matching properties', error: error.message });
  }
};

// Get matches for a tenant
exports.getTenantMatches = async (req, res) => {
  try {
    const matches = await Match.find({ tenant: req.params.tenantId })
      .populate('tenantProperty')
      .populate('landlordProperty')
      .populate('tenant')
      .populate('landlord');
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching matches', error: error.message });
  }
};