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
    const tenants = await User.find({ role: 'tenant' });
    const tenantPropertys = await Property.find({ role: 'tenant' });
    const landlordPropertys = await Property.find({ role: 'landlord' });

    const matches = [];

    for (const tenant of tenants) {
      // Fetch credit score
      const creditScore = await getCreditScore(tenant._id);
      await User.updateOne({ _id: tenant._id }, { creditScore });

      const tenantReqs = tenantPropertys.filter(req => req.user.equals(tenant._id));

      for (const tenantReq of tenantReqs) {
        for (const landlordReq of landlordPropertys) {
          const landlord = await User.findById(landlordReq.user);

          // Matching criteria
          let score = 0;

          // Credit score check
          if (creditScore >= (landlordReq.minCreditScore || 0)) {
            score += 40; // Heavy weight for credit
          }

          // Rent check
          if (tenantReq.rent >= landlordReq.rent) {
            score += 30;
          }

          // Bedrooms check
          if (!tenantReq.bedrooms || !landlordReq.bedrooms || tenantReq.bedrooms <= landlordReq.bedrooms) {
            score += 15;
          }

          // Location check (geospatial)
          if (tenantReq.location && tenantReq.maxDistance && landlordReq.location) {
            const [tenantLon, tenantLat] = tenantReq.location.coordinates;
            const [landlordLon, landlordLat] = landlordReq.location.coordinates;

            // Simplified distance calculation (in meters, approximate)
            const distance = Math.sqrt(
              Math.pow(landlordLon - tenantLon, 2) + Math.pow(landlordLat - tenantLat, 2)
            ) * 111139; // Convert degrees to meters

            if (distance <= tenantReq.maxDistance) {
              score += 10;
            }
          }

          // Income check
          if (!landlordReq.minIncome || (tenantReq.minIncome && tenantReq.minIncome >= landlordReq.minIncome)) {
            score += 5;
          }

          if (score > 50) { // Threshold for a valid match
            const match = new Match({
              tenant: tenant._id,
              landlord: landlord._id,
              tenantProperty: tenantReq._id,
              landlordProperty: landlordReq._id,
              matchScore: score,
            });
            await match.save();
            matches.push(match);
          }
        }
      }
    }

    res.status(200).json({ message: 'Matching completed', matches });
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