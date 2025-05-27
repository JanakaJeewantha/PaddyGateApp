const Price = require('../models/Price');

// ...
exports.getPriceHistory = async (req, res) => {
  const { millId, riceVariety } = req.params;
  try {
    const history = await Price.find({
      millId,
      riceVariety
    }).sort({ updateTimestamp: 1 });

    const formatted = history.map(item => ({
      price: item.pricePerKg,
      timestamp: item.updateTimestamp
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching price history.' });
  }
};