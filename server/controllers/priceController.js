const Price = require('../models/Price');

// Existing getPriceHistory remains unchanged
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

// New: Get only the current/latest price for each mill/rice variety
exports.getCurrentPrices = async (req, res) => {
  try {
    const currentPrices = await Price.aggregate([
      // Sort so the latest entry is first
      { $sort: { millId: 1, riceVariety: 1, updateTimestamp: -1 } },
      // Group by mill and variety, grab the first (latest) for each
      {
        $group: {
          _id: { millId: "$millId", riceVariety: "$riceVariety" },
          millId: { $first: "$millId" },
          riceVariety: { $first: "$riceVariety" },
          pricePerKg: { $first: "$pricePerKg" },
          updateTimestamp: { $first: "$updateTimestamp" },
          district: { $first: "$district" },
        }
      },
      // (Optional) Lookup mill details if needed
      // {
      //   $lookup: {
      //     from: "mills",
      //     localField: "millId",
      //     foreignField: "_id",
      //     as: "mill"
      //   }
      // },
    ]);
    res.json(currentPrices);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching current rice prices.' });
  }
};