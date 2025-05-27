const express = require('express');
const router = express.Router();
const Price = require('../models/Price');
const Mill = require('../models/Mill');
const { protect, authorize } = require('../middleware/auth');

// Only allow price updates by millers for verified mills
router.post('/', protect, authorize('Miller'), async (req, res) => {
  try {
    const { millId, district, riceVariety, pricePerKg } = req.body;
    if (!millId || !district || !riceVariety || !pricePerKg) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const mill = await Mill.findById(millId);
    if (!mill) {
      return res.status(404).json({ message: "Mill not found" });
    }
    if (mill.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not own this mill." });
    }
    if (mill.verificationStatus !== "Verified") {
      return res.status(403).json({ message: "This mill is not verified yet." });
    }
    // Create or update price
    const price = await Price.create({ millId, district, riceVariety, pricePerKg });
    res.status(201).json(price);
  } catch (err) {
    console.error('Price update error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Only show prices for verified mills (for farmers and everyone)
// NOW FILTERS BY DISTRICT AND RICEVARIETY IF PROVIDED
router.get('/', async (req, res) => {
  try {
    const { district, riceVariety } = req.query;
    let query = {};
    if (district) query.district = district;
    if (riceVariety) query.riceVariety = riceVariety;

    const prices = await Price.find(query).populate('millId');
    const verifiedPrices = prices.filter(
      price => price.millId && price.millId.verificationStatus === "Verified"
    );
    res.json(verifiedPrices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === NEW: Only the latest/current price per mill and rice variety ===
router.get('/current', async (req, res) => {
  try {
    const { district, riceVariety } = req.query;
    let match = {};
    if (district) match.district = district;
    if (riceVariety) match.riceVariety = riceVariety;

    // Aggregate: sort by latest, group by millId + riceVariety, keep first (latest)
    const prices = await Price.aggregate([
      { $match: match },
      { $sort: { millId: 1, riceVariety: 1, updateTimestamp: -1 } },
      {
        $group: {
          _id: { millId: "$millId", riceVariety: "$riceVariety" },
          millId: { $first: "$millId" },
          riceVariety: { $first: "$riceVariety" },
          pricePerKg: { $first: "$pricePerKg" },
          updateTimestamp: { $first: "$updateTimestamp" },
          district: { $first: "$district" },
        }
      }
    ]);

    // Optional: populate mill name and filter for verified mills
    const populated = await Mill.populate(prices, { path: "millId" });
    const verifiedPrices = populated.filter(
      p => p.millId && p.millId.verificationStatus === "Verified"
    );
    res.json(verifiedPrices);
  } catch (err) {
    console.error('Error fetching current prices:', err);
    res.status(500).json({ message: 'Error fetching current prices.' });
  }
});

// Price history endpoint for graph/charting
// Returns all price records for a given mill and rice variety, sorted by updateTimestamp ascending
router.get('/history/:millId/:riceVariety', async (req, res) => {
  try {
    const { millId, riceVariety } = req.params;

    // Find all price records for this mill and rice variety
    const history = await Price.find({
      millId,
      riceVariety
    }).sort({ updateTimestamp: 1 }); // oldest first

    // Format for chart.js: {price, timestamp}
    const formatted = history.map(item => ({
      price: item.pricePerKg,
      timestamp: item.updateTimestamp
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching price history:', err);
    res.status(500).json({ message: 'Error fetching price history.' });
  }
});

module.exports = router;