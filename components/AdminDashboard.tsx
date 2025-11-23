import React, { useEffect, useState } from 'react';
import { getBusinesses } from '../lib/supabase';
import { ArrowLeft, Edit, FileText, Loader2, LogOut, Search } from 'lucide-react';

interface AdminDashboardProps {
  onSelect: (id: number) => void;
  onBack: () => void;
  onLogout: () => void;
}

interface BusinessRecord {
  id: number;
  business_name: string;
  status: string;
  created_at: string;
  google_place_id: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelect, onBack, onLogout }) => {
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setLoading(true);
    const { data } = await getBusinesses();
    if (data) {
      setBusinesses(data);
    }
    setLoading(false);
  };

  const filteredBusinesses = businesses.filter(business =>
    business.business_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent w-64"
              />
            </div>
            <button
              onClick={loadBusinesses}
              className="text-sm text-brand-orange font-medium hover:underline"
            >
              Refresh List
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-4">Business Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading businesses...
                      </div>
                    </td>
                  </tr>
                ) : filteredBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      {searchTerm ? 'No matching businesses found.' : 'No businesses found.'}
                    </td>
                  </tr>
                ) : (
                  filteredBusinesses.map((business) => (
                    <tr key={business.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 font-medium text-gray-900">
                        {business.business_name}
                        {business.google_place_id && (
                          <span className="block text-xs text-gray-400 font-normal mt-0.5">
                            ID: {business.google_place_id.substring(0, 10)}...
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${business.status === 'onboarded' ? 'bg-green-100 text-green-800' :
                            business.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                          }
                        `}>
                          {business.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {new Date(business.created_at).toLocaleDateString()}
                        <span className="text-gray-400 ml-2 text-xs">
                          {new Date(business.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onSelect(business.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange text-white text-xs font-medium rounded hover:bg-orange-600 transition-colors shadow-sm"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Open
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
