import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getPrices, getPriceHistory } from '../redux/slices/priceSlice';
import { getMills } from '../redux/slices/millSlice';
import Spinner from '../components/Spinner';
import riceVarieties from '../constants/riceVarieties';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';


// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FarmerDashboard = () => {
  const [filters, setFilters] = useState({
    district: '',
    riceVariety: ''
  });
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [paddyWeight, setPaddyWeight] = useState('');
  const [estimatedProfit, setEstimatedProfit] = useState(null);
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { prices, priceHistory, isLoading } = useSelector((state) => state.prices);
  const { mills } = useSelector((state) => state.mills);

  useEffect(() => {
    dispatch(getPrices());
    dispatch(getMills());
  }, [dispatch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    dispatch(getPrices(filters));
  };

  const resetFilters = () => {
    setFilters({
      district: '',
      riceVariety: ''
    });
    dispatch(getPrices());
  };

  const calculateProfit = () => {
    if (!selectedPrice || !paddyWeight || isNaN(paddyWeight) || paddyWeight <= 0) {
      toast.error('Please select a price and enter a valid weight');
      return;
    }

    const profit = selectedPrice.pricePerKg * parseFloat(paddyWeight);
    setEstimatedProfit(profit);
  };

  const viewPriceHistory = (price) => {
    dispatch(getPriceHistory({
      millId: price.millId._id,
      riceVariety: price.riceVariety
    }));
    setSelectedPrice(price);
    setShowPriceHistory(true);
  };

  // Prepare data for the price history chart
  const chartData = {
    labels: priceHistory.map(history => new Date(history.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: selectedPrice ? `${selectedPrice.riceVariety} Price History` : 'Price History',
        data: priceHistory.map(history => history.price),
        fill: false,
        backgroundColor: 'rgb(99, 102, 241)',
        borderColor: 'rgba(99, 102, 241, 0.7)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Price History Chart'
      }
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Farmer Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user.profile.name}</h2>
          <div className="text-gray-600">
            <p><span className="font-medium">District:</span> {user.profile.location.district}</p>
            <p><span className="font-medium">Contact:</span> {user.profile.contact.phone}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Price Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="district">
                District
              </label>
              <select
                className="input"
                id="district"
                name="district"
                value={filters.district}
                onChange={handleFilterChange}
              >
                <option value="">Select District</option>
                  <option value="Ampara">Ampara</option>
                  <option value="Anuradhapura">Anuradhapura</option>
                  <option value="Badulla">Badulla</option>
                  <option value="Batticaloa">Batticaloa</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Galle">Galle</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Hambantota">Hambantota</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Kalutara">Kalutara</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Kegalle">Kegalle</option>
                  <option value="Kilinochchi">Kilinochchi</option>
                  <option value="Kurunegala">Kurunegala</option>
                  <option value="Mannar">Mannar</option>
                  <option value="Matale">Matale</option>
                  <option value="Matara">Matara</option>
                  <option value="Monaragala">Monaragala</option>
                  <option value="Mullaitivu">Mullaitivu</option>
                  <option value="Nuwara Eliya">Nuwara Eliya</option>
                  <option value="Polonnaruwa">Polonnaruwa</option>
                  <option value="Puttalam">Puttalam</option>
                  <option value="Ratnapura">Ratnapura</option>
                  <option value="Trincomalee">Trincomalee</option>
                  <option value="Vavuniya">Vavuniya</option>
                
              </select>
            </div>
            <div>
              
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="riceVariety">
                Rice Variety
              </label>
               <select
                  className="input"
                  id="riceVariety"
                  name="riceVariety"
                  value={filters.riceVariety}
                  onChange={handleFilterChange}
                >
  <option value="">Select Rice Variety</option>
  {riceVarieties.map(variety => (
    <option key={variety} value={variety}>{variety}</option>
  ))}
</select>
            </div>
            <div className="flex items-end gap-2">
              <button 
                className="btn btn-primary"
                onClick={applyFilters}
              >
                Apply Filters
              </button>
              <button 
                className="btn btn-secondary"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Current Rice Prices</h2>
        {prices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
            No price data available. Try adjusting your filters or check back later.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mill Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    District
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rice Variety
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price per Kg
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prices.map((price) => (
                  <tr key={price._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {price.millId.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {price.district}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {price.riceVariety}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rs. {price.pricePerKg.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(price.updateTimestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedPrice(price);
                          setEstimatedProfit(null);
                          setShowPriceHistory(false);
                        }}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Select
                      </button>
                      <button
                        onClick={() => viewPriceHistory(price)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {showPriceHistory && selectedPrice && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Price History</h2>
          <div className="h-80">
            <Line options={chartOptions} data={chartData} />
          </div>
          <button
            className="mt-4 btn btn-secondary"
            onClick={() => setShowPriceHistory(false)}
          >
            Close History
          </button>
        </div>
      )}
      
      {selectedPrice && !showPriceHistory && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Profit Calculator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="mb-2">
                <span className="font-medium">Selected Mill:</span> {selectedPrice.millId.name}
              </p>
              <p className="mb-2">
                <span className="font-medium">Rice Variety:</span> {selectedPrice.riceVariety}
              </p>
              <p className="mb-4">
                <span className="font-medium">Price per Kg:</span> Rs. {selectedPrice.pricePerKg.toFixed(2)}
              </p>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paddyWeight">
                  Paddy Weight (Kg)
                </label>
                <input
                  className="input"
                  type="number"
                  id="paddyWeight"
                  value={paddyWeight}
                  onChange={(e) => setPaddyWeight(e.target.value)}
                  placeholder="Enter weight in kg"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <button
                className="btn btn-primary"
                onClick={calculateProfit}
              >
                Calculate Potential Earnings
              </button>
            </div>
            
            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-6">
              {estimatedProfit !== null ? (
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Estimated Earnings</h3>
                  <p className="text-3xl font-bold text-primary-600">Rs. {estimatedProfit.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on {paddyWeight} kg at Rs. {selectedPrice.pricePerKg.toFixed(2)}/kg
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">
                  Enter the weight of your paddy harvest to calculate potential earnings.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;