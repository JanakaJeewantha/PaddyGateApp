import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getUsers, updateUserStatus, getAllMills, verifyMill } from '../redux/slices/userSlice';
import Spinner from '../components/Spinner';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { users, allMills, isLoading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(getUsers());
    dispatch(getAllMills());
  }, [dispatch]);

  const handleUserStatusChange = (userId, status) => {
    dispatch(updateUserStatus({ id: userId, accountStatus: status }))
      .then(() => {
        toast.success(`User status updated to ${status}`);
      })
      .catch((error) => {
        toast.error('Failed to update user status');
      });
  };

  const handleMillVerificationChange = (millId, status) => {
    dispatch(verifyMill({ id: millId, verificationStatus: status }))
      .then(() => {
        toast.success(`Mill verification status updated to ${status}`);
      })
      .catch((error) => {
        toast.error('Failed to update mill verification status');
      });
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.profile?.name || user?.username || user?.email}</h2>
        <p className="text-gray-600">
          As an administrator, you can manage users and verify mills on the platform.
        </p>
      </div>
      
      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'users' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'mills' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('mills')}
          >
            Mill Verification
          </button>
        </div>
        
        {activeTab === 'users' && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-4">User Management</h3>
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.profile?.name || user.username || user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.profile?.location?.district || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.accountStatus === 'Active' ? 'bg-green-100 text-green-800' :
                          user.accountStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.accountStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                          value={user.accountStatus}
                          onChange={(e) => handleUserStatusChange(user._id, e.target.value)}
                        >
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'mills' && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-4">Mill Verification</h3>
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mill Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specializations
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allMills.map((mill) => (
                    <tr key={mill._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {mill.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mill.owner?.username || mill.owner?.email || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mill.location?.district || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Array.isArray(mill.specializations) && mill.specializations.length > 0 ? mill.specializations.join(', ') : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          mill.verificationStatus === 'Verified' ? 'bg-green-100 text-green-800' :
                          mill.verificationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {mill.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                          value={mill.verificationStatus}
                          onChange={(e) => handleMillVerificationChange(mill._id, e.target.value)}
                        >
                          <option value="Verified">Verified</option>
                          <option value="Pending">Pending</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">System Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-3xl font-bold text-blue-700">{users.length}</p>
            <p className="text-sm text-blue-700 font-medium">Total Users</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-3xl font-bold text-green-700">{users.filter(u => u.role === 'Farmer').length}</p>
            <p className="text-sm text-green-700 font-medium">Farmers</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-3xl font-bold text-purple-700">{users.filter(u => u.role === 'Miller').length}</p>
            <p className="text-sm text-purple-700 font-medium">Millers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;