import { useState, useEffect } from "react";
import { Globe, Mail, User, Calendar, AlertTriangle, Clock, DollarSign } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function ExpireInfo() {
  const [domains, setDomains] = useState([]);
  const [expiringDomains, setExpiringDomains] = useState([]);
  const [expiringEmails, setExpiringEmails] = useState([]);

  // Calculate days remaining
  const calculateDaysRemaining = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyLevel = (days) => {
    if (days < 0) return { label: 'Expired', color: 'bg-red-100 text-red-800', badge: 'bg-red-500' };
    if (days <= 7) return { label: 'Critical', color: 'bg-red-100 text-red-800', badge: 'bg-red-500' };
    if (days <= 15) return { label: 'High', color: 'bg-orange-100 text-orange-800', badge: 'bg-orange-500' };
    if (days <= 30) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', badge: 'bg-yellow-500' };
    return { label: 'Low', color: 'bg-green-100 text-green-800', badge: 'bg-green-500' };
  };

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/domains`); // your backend URL
        const data = await res.json();
        setDomains(data);
      } catch (error) {
        console.error('Error fetching domains:', error);
      }
    };

    fetchDomains();
  }, []);

  // Compute expiring domains & emails
  useEffect(() => {
    const today = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);

    const expDomains = domains
      .filter((d) => {
        const domainExpiry = new Date(d.domainExpiryDate);
        return domainExpiry >= today && domainExpiry <= oneMonthLater;
      })
      .map((d) => ({
        ...d,
        daysRemaining: calculateDaysRemaining(d.domainExpiryDate),
        renewalCost: d.domainPrice,
        emailAddresses: d.agents?.map(a => a.loginId).join(', ') || '',
      }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    const expEmails = domains
      .filter((d) => {
        const emailExpiry = new Date(d.emailHostExpiry);
        return emailExpiry >= today && emailExpiry <= oneMonthLater;
      })
      .map((d) => ({
        ...d,
        daysRemaining: calculateDaysRemaining(d.emailHostExpiry),
        renewalCost: d.emailPrice,
        emailAddresses: d.agents?.map(a => a.loginId).join(', ') || '',
      }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    setExpiringDomains(expDomains);
    setExpiringEmails(expEmails);
  }, [domains]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Expiry Dashboard</h1>
                <p className="text-sm text-slate-500">Monitor and manage upcoming renewals</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Domains Expiring</p>
                <p className="text-3xl font-bold mt-1">{expiringDomains.length}</p>
                <p className="text-red-100 text-xs mt-1">Within 30 days</p>
              </div>
              <Globe className="w-12 h-12 text-red-200 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Email Hosts Expiring</p>
                <p className="text-3xl font-bold mt-1">{expiringEmails.length}</p>
                <p className="text-orange-100 text-xs mt-1">Within 30 days</p>
              </div>
              <Mail className="w-12 h-12 text-orange-200 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Renewal Cost</p>
                <p className="text-3xl font-bold mt-1">
                  ${expiringDomains.reduce((sum, d) => sum + d.renewalCost, 0).toFixed(2)}
                </p>
                <p className="text-purple-100 text-xs mt-1">For all expiring items</p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-200 opacity-80" />
            </div>
          </div>
        </div>

        {/* Expiring Domains Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-red-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-red-600" />
                Domains Expiring Soon ({expiringDomains.length})
              </h2>
              {expiringDomains.length > 0 && (
                <span className="text-xs text-slate-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Sorted by urgency
                </span>
              )}
            </div>
          </div>
          <div className="p-6">
            {expiringDomains.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-slate-800 mb-2">All Clear!</p>
                <p className="text-sm text-slate-500">No domains are expiring within the next month.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer ID</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Domain Provider</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Domain Name</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Domain Price</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Expiry Date</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Days Remaining</th>
                      {/* <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned To</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expiringDomains.map((d, i) => {
                      const urgency = getUrgencyLevel(d.daysRemaining);
                      return (
                        <tr key={i} className="hover:bg-slate-50 transition text-center">
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${urgency.color}`}>
                              <span className={`w-2 h-2 rounded-full ${urgency.badge} mr-1.5`}></span>
                              {urgency.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm font-medium">
                              {d.customerId}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                            {d.domainHost}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Globe className="w-4 h-4 mr-2 text-indigo-500" />
                              <span className="text-sm font-medium text-indigo-600">{d.domainName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-green-600 text-center" />
                              <span className="text-sm font-medium text-green-600 text-center">{d.domainPrice}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                            {d.domainExpiryDate}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-slate-400" />
                              <span className={`text-sm font-bold ${d.daysRemaining <= 7 ? 'text-red-600' : d.daysRemaining <= 15 ? 'text-orange-600' : 'text-slate-700'}`}>
                                {d.daysRemaining} {d.daysRemaining === 1 ? 'day' : 'days'}
                              </span>
                            </div>
                          </td>
                          {/* <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-slate-400" />
                              <span className="text-sm text-slate-700">{d.emailAddresses}</span>
                            </div>
                          </td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Expiring Email Hosts Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-orange-600" />
                Email Hosting Expiring Soon ({expiringEmails.length})
              </h2>
              {expiringEmails.length > 0 && (
                <span className="text-xs text-slate-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Sorted by urgency
                </span>
              )}
            </div>
          </div>
          <div className="p-6">
            {expiringEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-slate-800 mb-2">All Clear!</p>
                <p className="text-sm text-slate-500">No email hosting accounts are expiring within the next month.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 text-center">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer ID</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Domain Name</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Host</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Host Price</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Expiry Date</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Days Remaining</th>
                      {/* <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned To</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expiringEmails.map((d, i) => {
                      const urgency = getUrgencyLevel(d.daysRemaining);
                      return (
                        <tr key={i} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${urgency.color}`}>
                              <span className={`w-2 h-2 rounded-full ${urgency.badge} mr-1.5`}></span>
                              {urgency.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm font-medium">
                              {d.customerId}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center">
                              <Globe className="w-4 h-4 mr-2 text-indigo-500" />
                              <span className="text-sm font-medium text-indigo-600">{d.domainName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center whitespace-nowrap text-sm text-slate-700">
                            {d.domainEmailHost}
                          </td>
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600 text-center ">{d.emailPrice}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center whitespace-nowrap text-sm text-red-600 font-medium">
                            {d.emailHostExpiry}
                          </td>
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-slate-400" />
                              <span className={`text-sm font-bold ${d.daysRemaining <= 7 ? 'text-red-600' : d.daysRemaining <= 15 ? 'text-orange-600' : 'text-slate-700'}`}>
                                {d.daysRemaining} {d.daysRemaining === 1 ? 'day' : 'days'}
                              </span>
                            </div>
                          </td>
                          {/* <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-slate-400" />
                              <span className="text-sm text-slate-700">{d.emailAddresses}</span>
                            </div>
                          </td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
