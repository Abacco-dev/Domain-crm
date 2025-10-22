import React, { useState, useEffect } from "react";
import { Globe, Mail, Calendar, AlertTriangle, Clock, DollarSign, TrendingUp } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ExpireInfo() {
  const [domains, setDomains] = useState([]);
  const [expiringDomains, setExpiringDomains] = useState([]);
  const [expiringEmails, setExpiringEmails] = useState([]);

  // Calculate days remaining
  const calculateDaysRemaining = (expiryDate) => {
    if (!expiryDate) return Number.POSITIVE_INFINITY;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyLevel = (days) => {
    if (days < 0) return { label: "Expired", color: "bg-red-50 text-red-700 border border-red-200", badge: "bg-red-500" };
    if (days <= 7) return { label: "Critical", color: "bg-red-50 text-red-700 border border-red-200", badge: "bg-red-500" };
    if (days <= 15) return { label: "High", color: "bg-orange-50 text-orange-700 border border-orange-200", badge: "bg-orange-500" };
    if (days <= 30) return { label: "Medium", color: "bg-yellow-50 text-yellow-700 border border-yellow-200", badge: "bg-yellow-500" };
    return { label: "Low", color: "bg-green-50 text-green-700 border border-green-200", badge: "bg-green-500" };
  };

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/domains`);
        const data = await res.json();
        setDomains(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching domains:", error);
      }
    };

    fetchDomains();
  }, []);

  // Compute expiring domains & emails (within next 30 days)
  useEffect(() => {
    const today = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);

    // 1) Domains expiring using domainExpiryDate
    const expDomains = domains
      .filter((d) => {
        if (!d.domainExpiryDate) return false;
        const domainExpiry = new Date(d.domainExpiryDate);
        return domainExpiry >= today && domainExpiry <= oneMonthLater;
      })
      .map((d) => ({
        ...d,
        daysRemaining: calculateDaysRemaining(d.domainExpiryDate),
        renewalCost: d.domainPrice ?? 0,
        formattedExpiry: d.domainExpiryDate
          ? new Date(d.domainExpiryDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "—",
      }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    // 2) Emails expiring using EmailAccount.emailExpiryDate
    const expEmails = [];
    domains.forEach((d) => {
      const priceFromDomain = d.emailPrice ?? 0;
      const emailHostName = d.domainEmailHost || "—";
      const domainName = d.domainName;
      const customerId = d.customerId;
      const domainId = d.id;

      (d.emailAccounts || []).forEach((ea) => {
        if (!ea.emailExpiryDate) return;
        const emailExpiry = new Date(ea.emailExpiryDate);
        if (emailExpiry >= today && emailExpiry <= oneMonthLater) {
          const daysRemaining = calculateDaysRemaining(ea.emailExpiryDate);
          expEmails.push({
            domainId,
            domainName,
            customerId,
            domainEmailHost: emailHostName,
            emailPrice: priceFromDomain,
            emailAccountId: ea.id,
            email: ea.email,
            emailPurchaseDate: ea.emailPurchaseDate,
            emailExpiryDate: ea.emailExpiryDate,
            formattedExpiry: ea.emailExpiryDate
              ? new Date(ea.emailExpiryDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "—",
            daysRemaining,
          });
        }
      });
    });

    expEmails.sort((a, b) => a.daysRemaining - b.daysRemaining);

    setExpiringDomains(expDomains);
    setExpiringEmails(expEmails);
  }, [domains]);

  const totalRenewalCost = expiringDomains.reduce((sum, d) => sum + (Number(d.renewalCost) || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-sm">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Expiry Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Monitor and manage upcoming renewals</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white border-2 border-red-200 rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-red-600" />
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">Domains Expiring</p>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{expiringDomains.length}</p>
                <p className="text-gray-500 text-xs">Within 30 days</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-orange-200 rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-orange-600" />
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">Email Hosts Expiring</p>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{expiringEmails.length}</p>
                <p className="text-gray-500 text-xs">Within 30 days</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-green-200 rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Renewal Cost</p>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">₹{totalRenewalCost.toFixed(2)}</p>
                <p className="text-gray-500 text-xs">For expiring domains</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Expiring Domains Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 sm:mb-8 shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-red-600" />
                Domains Expiring Soon
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  {expiringDomains.length}
                </span>
              </h2>
              {expiringDomains.length > 0 && (
                <span className="text-xs text-gray-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Sorted by urgency
                </span>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {expiringDomains.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border-2 border-green-200">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">All Clear!</p>
                <p className="text-sm text-gray-500">No domains are expiring within the next month.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Domain
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Expiry
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Days Left
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {expiringDomains.map((d) => {
                        const urgency = getUrgencyLevel(d.daysRemaining);
                        return (
                          <tr key={`domain-${d.id}`} className="hover:bg-gray-50 transition">
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold ${urgency.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${urgency.badge} mr-1.5`}></span>
                                {urgency.label}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                {d.customerId}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                              {d.domainHost}
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <Globe className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                                <span className="text-xs sm:text-sm font-medium text-blue-600">{d.domainName}</span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-xs sm:text-sm font-medium text-green-600">₹{d.domainPrice ?? "—"}</span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-red-600 font-medium">
                              {d.formattedExpiry}
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                <span className={`text-xs sm:text-sm font-bold ${
                                  d.daysRemaining <= 7 ? "text-red-600" : d.daysRemaining <= 15 ? "text-orange-600" : "text-gray-700"
                                }`}>
                                  {d.daysRemaining}d
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expiring Email Accounts Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-orange-600" />
                Email Accounts Expiring Soon
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  {expiringEmails.length}
                </span>
              </h2>
              {expiringEmails.length > 0 && (
                <span className="text-xs text-gray-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Sorted by urgency
                </span>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {expiringEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border-2 border-green-200">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">All Clear!</p>
                <p className="text-sm text-gray-500">No email accounts are expiring within the next month.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Domain
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Host
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Expiry
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Days Left
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {expiringEmails.map((e) => {
                        const urgency = getUrgencyLevel(e.daysRemaining);
                        return (
                          <tr key={`email-${e.emailAccountId}`} className="hover:bg-gray-50 transition">
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold ${urgency.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${urgency.badge} mr-1.5`}></span>
                                {urgency.label}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                {e.customerId}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-blue-700 font-medium">
                              {e.domainName}
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-800">
                              <div className="flex items-center">
                                <Mail className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                                <span>{e.email}</span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                              {e.domainEmailHost}
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <span className="text-xs sm:text-sm font-medium text-green-600">₹{e.emailPrice}</span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-red-600 font-medium">
                              {e.formattedExpiry}
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                <span className={`text-xs sm:text-sm font-bold ${
                                  e.daysRemaining <= 7 ? "text-red-600" : e.daysRemaining <= 15 ? "text-orange-600" : "text-gray-700"
                                }`}>
                                  {e.daysRemaining}d
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}