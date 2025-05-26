import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getPrices, getPriceHistory, updatePrice } from '../redux/slices/priceSlice';
import { getMillerMills, createMill, updateMill } from '../redux/slices/millSlice';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MillerDashboard = () => {
  const [millFormData, setMillFormData] = useState({
    name: '',
    district: '',
    address: '',
    phone: '',
    email: '',
    specializations: []
  });

  const [priceFormData, setPriceFormData] = useState({
    millId: '',
    riceVariety: '',
    pricePerKg: ''
  });

  const [editingMill, setEditingMill] = useState(null);
  const [showMillForm, setShowMillForm] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { prices, priceHistory, isLoading: priceLoading } = useSelector((state) => state.prices);
  const { millerMills, isLoading: millLoading } = useSelector((state) => state.mills);

  useEffect(() => {
    dispatch(getMillerMills());
    dispatch(getPrices());
  }, [dispatch]);

  const handleMillFormChange = (e) => {
    const { name, value } = e.target;

    if (name === 'specializations') {
      const options = e.target.options;
      const values = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          values.push(options[i].value);
        }
      }
      setMillFormData(prevState => ({
        ...prevState,
        [name]: values
      }));
    } else {
      setMillFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handlePriceFormChange = (e) => {
    const { name, value } = e.target;
    setPriceFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const submitMillForm = (e) => {
    e.preventDefault();

    if (!millFormData.name || !millFormData.district || !millFormData.address || !millFormData.phone || !millFormData.email || millFormData.specializations.length === 0) {
      toast.error('Please fill all mill details and select at least one specialization');
      return;
    }

    if (editingMill) {
      dispatch(updateMill({
        id: editingMill._id,
        millData: {
          name: millFormData.name,
          location: {
            district: millFormData.district,
            address: millFormData.address
          },
          contactInfo: {
            phone: millFormData.phone,
            email: millFormData.email
          },
          specializations: millFormData.specializations
        }
      })).then((action) => {
        if (!action.error) {
          toast.success('Mill updated successfully');
          setShowMillForm(false);
          setEditingMill(null);
          resetMillForm();
        } else {
          toast.error(action.error.message || "Failed to update mill");
        }
      });
    } else {
      dispatch(createMill({
        name: millFormData.name,
        location: {
          district: millFormData.district,
          address: millFormData.address
        },
        contactInfo: {
          phone: millFormData.phone,
          email: millFormData.email
        },
        specializations: millFormData.specializations
      })).then((action) => {
        if (!action.error) {
          toast.success('Mill created successfully');
          setShowMillForm(false);
          resetMillForm();
        } else {
          toast.error(action.error.message || "Failed to create mill");
        }
      });
    }
  };

  const submitPriceForm = (e) => {
    e.preventDefault();

    if (!priceFormData.millId || !priceFormData.riceVariety || !priceFormData.pricePerKg) {
      toast.error('Please fill all required fields');
      return;
    }

    const mill = millerMills.find(m => m._id === priceFormData.millId);

    if (!mill) {
      toast.error('Selected mill not found');
      return;
    }

    dispatch(updatePrice({
      millId: priceFormData.millId,
      riceVariety: priceFormData.riceVariety,
      pricePerKg: parseFloat(priceFormData.pricePerKg),
      district: mill.location.district
    })).then((action) => {
      if (!action.error) {
        toast.success('Price updated successfully');
        setShowPriceForm(false);
        resetPriceForm();
      } else {
        toast.error(action.error.message || "Failed to update price");
      }
    });
  };

  const editMill = (mill) => {
    setEditingMill(mill);
    setMillFormData({
      name: mill.name,
      district: mill.location.district,
      address: mill.location.address || '',
      phone: mill.contactInfo?.phone || '',
      email: mill.contactInfo?.email || '',
      specializations: mill.specializations || []
    });
    setShowMillForm(true);
  };

  const resetMillForm = () => {
    setMillFormData({
      name: '',
      district: '',
      address: '',
      phone: '',
      email: '',
      specializations: []
    });
    setEditingMill(null);
  };

  const resetPriceForm = () => {
    setPriceFormData({
      millId: '',
      riceVariety: '',
      pricePerKg: ''
    });
  };

  const viewPriceHistory = (price) => {
    const millId = price.millId?._id || price.millId;
    if (!millId) {
      toast.error('Mill ID not found for this price');
      return;
    }

    dispatch(getPriceHistory({
      millId: millId,
      riceVariety: price.riceVariety
    }));
    setSelectedPrice(price);
    setShowPriceHistory(true);
  };

  const millerPrices = prices.filter(price => {
    if (!price || !price.millId) return false;
    const priceMillId = price.millId._id || price.millId;
    return millerMills.some(mill => mill && mill._id && mill._id === priceMillId);
  });

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

  if (millLoading || priceLoading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Miller Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.profile?.name || 'Miller'}</h2>
          <div className="text-gray-600">
            <p><span className="font-medium">District:</span> {user?.profile?.location?.district || 'N/A'}</p>
            <p><span className="font-medium">Contact:</span> {user?.profile?.contact?.phone || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              className="btn btn-primary"
              onClick={() => {
                resetMillForm();
                setShowMillForm(true);
              }}
            >
              Add New Mill
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetPriceForm();
                setShowPriceForm(true);
              }}
              disabled={!millerMills || millerMills.length === 0}
            >
              Update Rice Prices
            </button>
          </div>
        </div>
      </div>

      {showMillForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingMill ? 'Edit' : 'Add'} Mill</h2>
          <form onSubmit={submitMillForm}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Mill Name
                </label>
                <input
                  className="input"
                  type="text"
                  id="name"
                  name="name"
                  value={millFormData.name}
                  onChange={handleMillFormChange}
                  placeholder="Enter mill name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="district">
                  District
                </label>
                <select
                  className="input"
                  id="district"
                  name="district"
                  value={millFormData.district}
                  onChange={handleMillFormChange}
                  required
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

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                  Address
                </label>
                <input
                  className="input"
                  type="text"
                  id="address"
                  name="address"
                  value={millFormData.address}
                  onChange={handleMillFormChange}
                  placeholder="Enter address"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  Phone
                </label>
                <input
                  className="input"
                  type="tel"
                  id="phone"
                  name="phone"
                  value={millFormData.phone}
                  onChange={handleMillFormChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="input"
                  type="email"
                  id="email"
                  name="email"
                  value={millFormData.email}
                  onChange={handleMillFormChange}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specializations">
                  Rice Specializations
                </label>
                <select
                  className="input"
                  id="specializations"
                  name="specializations"
                  value={millFormData.specializations}
                  onChange={handleMillFormChange}
                  multiple
                  required
                >
                  {riceVarieties.map(variety => (
                    <option key={variety} value={variety}>{variety}</option>
                  ))}
                </select>
                <small className="text-gray-500">Hold Ctrl (or Cmd) to select multiple</small>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowMillForm(false);
                  setEditingMill(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {editingMill ? 'Update' : 'Add'} Mill
              </button>
            </div>
          </form>
        </div>
      )}

      {showPriceForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Update Rice Price</h2>
          <form onSubmit={submitPriceForm}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="millId">
                  Select Mill
                </label>
                <select
                  className="input"
                  id="millId"
                  name="millId"
                  value={priceFormData.millId}
                  onChange={handlePriceFormChange}
                  required
                >
                  <option value="">Select Mill</option>
                  {millerMills && millerMills.map(mill => (
                    <option key={mill._id} value={mill._id}>
                      {mill.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="riceVariety">
                  Rice Variety
                </label>
                <select
                  className="input"
                  id="riceVariety"
                  name="riceVariety"
                  value={priceFormData.riceVariety}
                  onChange={handlePriceFormChange}
                  required
                  disabled={!priceFormData.millId}
                >
                  <option value="">Select Rice Variety</option>
                  {priceFormData.millId && millerMills && millerMills.find(m => m._id === priceFormData.millId)?.specializations?.map(variety => (
                    <option key={variety} value={variety}>
                      {variety}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pricePerKg">
                  Price per Kg (Rs.)
                </label>
                <input
                  className="input"
                  type="number"
                  id="pricePerKg"
                  name="pricePerKg"
                  value={priceFormData.pricePerKg}
                  onChange={handlePriceFormChange}
                  placeholder="Enter price per kg"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPriceForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Update Price
              </button>
            </div>
          </form>
        </div>
      )}

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Mills</h2>
          {!millerMills || millerMills.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
              You haven't added any mills yet. Add your first mill to start posting prices.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {millerMills.map(mill => (
                  <li key={mill._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{mill.name}</h3>
                        <p className="text-sm text-gray-600">{mill.location?.district || 'N/A'}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Specializations: {mill.specializations?.join(', ') || 'None'}
                        </p>
                      </div>
                      <div>
                        <button
                          onClick={() => editMill(mill)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Status: <span className={`font-medium ${mill.verificationStatus === 'Verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {mill.verificationStatus || 'Pending'}
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Current Prices</h2>
          {!millerPrices || millerPrices.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
              You haven't posted any prices yet. Update prices to attract farmers.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {millerPrices.map(price => (
                  <li key={price._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {price.riceVariety} - Rs. {price.pricePerKg?.toFixed(2) || '0.00'}/kg
                        </h3>
                        <p className="text-sm text-gray-600">
                          Mill: {price.millId?.name || (millerMills && millerMills.find(m => m._id === price.millId)?.name) || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last Updated: {price.updateTimestamp ? new Date(price.updateTimestamp).toLocaleString() : 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => viewPriceHistory(price)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View History
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MillerDashboard;