import { useState, useEffect } from "react";
import {
  Search,
  Globe,
  Mail,
  User,
  Calendar,
  Lock,
  ExternalLink,
  X,
  ChevronRight,
  Eye,
  EyeOff,
  Edit,
  Server,
  Layers,
  Users,
  ArrowLeft,
  Building2,
  Calendar as CalendarIcon,
  DollarSign,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AllInfo() {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [editingAgent, setEditingAgent] = useState(null);
  const [selectedHost, setSelectedHost] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedView, setSelectedView] = useState("all");

 useEffect(() => {
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 🟢 STEP 1 — Get all hosts/domains/agents
      const res = await fetch(`${API_BASE_URL}/api/all-info/combined`);
      const data = await res.json();

      // Flatten all agents from nested structure
      const allAgents = data.flatMap((host) =>
        host.domains.flatMap((domain) =>
          domain.agents.map((a) => ({
            ...a,
            domainName: domain.domainName,
            hostName: host.domainHost,
          }))
        )
      );

      // 🟢 STEP 2 — Enrich each agent with lead count + email status
      const enrichedAgents = await Promise.all(
        allAgents.map(async (agent) => {
          let leadCount = 0;
          let emailStatus = "inactive";

          // ✅ Fetch lead count (optional external CRM)
          try {
            const leadRes = await fetch(
              `https://abacco-lead-crm.onrender.com/api/leads/count/${agent.agentEmail}`
            );
            const leadData = await leadRes.json();
            if (leadData.success) leadCount = leadData.count;
          } catch (err) {
            console.error(`Lead count error for ${agent.agentEmail}:`, err);
          }

          // ✅ Fetch email activity (from EmailAccount)
          try {
            const emailRes = await fetch(
              `${API_BASE_URL}/api/all-info/emails/by-agent/${agent.id}`
            );
            const emailData = await emailRes.json();

            if (Array.isArray(emailData) && emailData.length > 0) {
              const hasActive = emailData.some((e) => e.isActive === true);
              emailStatus = hasActive ? "active" : "inactive";
            } else {
              emailStatus = "inactive";
            }
          } catch (err) {
            console.error(`Email fetch error for ${agent.agentEmail}:`, err);
          }

          // ✅ Employee active status comes from the DB (agent.isActive)
          const agentStatus = agent.isActive ? "active" : "inactive";

          // Return fully enriched agent
          return {
            ...agent,
            agentStatus,      // from Agent table
            emailStatus,      // from EmailAccount table
            leadEmailCount: leadCount,
          };
        })
      );

      // 🟢 STEP 3 — Merge enriched agents back into hosts → domains → agents
      const updatedHosts = data.map((host) => ({
        ...host,
        domains: host.domains.map((domain) => ({
          ...domain,
          agents: domain.agents.map((agent) => {
            const enriched = enrichedAgents.find((ea) => ea.id === agent.id);
            return enriched ? { ...agent, ...enriched } : agent;
          }),
        })),
      }));

      // 🟢 STEP 4 — Update state
      console.log("✅ Updated hosts with agent & email statuses:", updatedHosts);
      setHosts(updatedHosts);
    } catch (err) {
      console.error("❌ Error fetching combined data:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAllData();
}, [refreshTrigger]);



  const totalHosts = hosts.length;
  const totalDomains = hosts.reduce((sum, h) => sum + h.domains.length, 0);
  const totalAgents = hosts.reduce(
    (sum, h) => sum + h.domains.reduce((s, d) => s + d.agents.length, 0),
    0
  );

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEditAgent = (host) => {
    const fullHost = {
      id: host.id,
      domainHost: host.domainHost || "",
      loginId: host.loginId || "",
      loginPass: host.loginPass || "",
      customerId: host.customerId || "",
    };
    setEditingAgent(fullHost);
  };

  const handleSaveAgent = async () => {
    if (!editingAgent) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/all-info/hosts/${editingAgent.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingAgent),
        }
      );
      if (!response.ok) throw new Error("Failed to update host info");
      alert("✅ Host updated successfully!");
      setEditingAgent(null);
      setRefreshTrigger((p) => p + 1);
    } catch (err) {
      console.error("❌ Error saving host:", err);
      alert("❌ Failed to save host changes.");
    }
  };

  const handleViewHostDetails = (host) => {
    setSelectedHost(host);
  };

  const filteredHosts = hosts.filter(
    (h) =>
      h.domainHost?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.loginId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header with White Background */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Server className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Domain Manager
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Centralized hosting control
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
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
        {/* Enhanced Search Bar */}
        <div className="mb-6 sm:mb-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search hosts, domains, or logins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div
            onClick={() => setSelectedView("hosts")}
            className="group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-all"></div>
            <div className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 group-hover:border-blue-400/50 group-hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Hosting Accounts
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{totalHosts}</h2>
            </div>
          </div>

          <div
            onClick={() => setSelectedView("domains")}
            className="group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-all"></div>
            <div className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 group-hover:border-cyan-400/50 group-hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-cyan-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Total Domains
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{totalDomains}</h2>
            </div>
          </div>

          <div
            onClick={() => setSelectedView("agents")}
            className="group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-all"></div>
            <div className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 group-hover:border-purple-400/50 group-hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Total Mail IDs
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{totalAgents}</h2>
            </div>
          </div>
        </div>

        {/* Back Button */}
        {selectedView !== "all" && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setSelectedView("all")}
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Overview
            </button>
          </div>
        )}

        {/* Hosts View - Enhanced Mobile Table */}
        {(selectedView === "all" || selectedView === "hosts") && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Server className="w-5 h-5 mr-2 text-blue-600" />
                Hosting Accounts
              </h2>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="inline-block w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Host
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Login ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Password
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Customer ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredHosts.map((host) => (
                        <tr
                          key={host.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {host.domainHost}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {host.loginId}
                          </td>
                          <td className="px-6 py-4 font-mono text-gray-700">
                            <div className="flex items-center space-x-2">
                              <span>
                                {visiblePasswords[`host-${host.id}`]
                                  ? host.loginPass
                                  : "••••••••"}
                              </span>
                              <button
                                onClick={() =>
                                  togglePasswordVisibility(`host-${host.id}`)
                                }
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                {visiblePasswords[`host-${host.id}`] ? (
                                  <EyeOff className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <Eye className="w-4 h-4 text-gray-500" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {host.customerId || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewHostDetails(host)}
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition shadow"
                              >
                                View
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </button>
                              <button
                                onClick={() => handleEditAgent(host)}
                                className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden p-4 space-y-4">
                  {filteredHosts.map((host) => (
                    <div
                      key={host.id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {host.domainHost}
                        </h3>
                        <button
                          onClick={() => handleEditAgent(host)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Login ID</p>
                          <p className="text-sm text-gray-900">{host.loginId}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Password</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-mono text-gray-900">
                              {visiblePasswords[`host-${host.id}`]
                                ? host.loginPass
                                : "••••••••"}
                            </span>
                            <button
                              onClick={() =>
                                togglePasswordVisibility(`host-${host.id}`)
                              }
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              {visiblePasswords[`host-${host.id}`] ? (
                                <EyeOff className="w-4 h-4 text-gray-500" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Customer ID</p>
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {host.customerId || "—"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewHostDetails(host)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition shadow"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Domains View - Enhanced Grid */}
        {selectedView === "domains" && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-6 text-gray-900 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-cyan-600" /> All Domains
            </h2>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {hosts.flatMap((h) =>
                h.domains.map((d) => (
                  <div
                    key={d.id}
                    className="group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-all"></div>
                    <div className="relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <Globe className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                        {d.domainPrice && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium">
                            ₹{d.domainPrice}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3 break-all">
                        {d.domainName}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-700">
                          <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-xs">{h.domainHost}</span>
                        </div>
                        {d.domainExpiryDate && (
                          <div className="flex items-center text-red-600">
                            <CalendarIcon className="w-4 h-4 mr-2 text-red-500" />
                            <span className="text-xs">
                              Exp: {new Date(d.domainExpiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Agents View - Enhanced Cards */}
        {selectedView === "agents" && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-6 text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" /> All Employee's
            </h2>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {hosts.flatMap((h) =>
                h.domains.flatMap((d) =>
                  d.agents.map((a) => (
                    <div
                      key={a.id}
                      className="group relative overflow-hidden cursor-pointer"
                      onClick={() => setSelectedAgent(a)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-all"></div>
                      <div className="relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {a.agentName || "Unnamed"}
                            </h3>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start text-gray-700">
                            <Mail className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs break-all">{a.agentEmail || "—"}</span>
                          </div>
                          <div className="flex items-center text-blue-700">
                            <Globe className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                            <span className="text-xs truncate">{d.domainName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        )}

        {/* Host Details Modal - Enhanced and Responsive */}
        {selectedHost && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {selectedHost.domainHost} — Domains
                </h2>
                <button
                  onClick={() => setSelectedHost(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)] w-full">
                <div className="flex flex-col gap-4 w-full">
                  {selectedHost.domains.length > 0 ? (
                    selectedHost.domains.map((d) => (
                      <div
                        key={d.id}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:bg-white transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 break-all flex-1">
                            {d.domainName}
                          </h3>
                          {d.domainPrice && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium ml-2 flex-shrink-0">
                              ₹{d.domainPrice}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 text-sm text-gray-700 mb-4">
                          <div className="flex items-start">
                            <Mail className="w-6 h-6 mr-2 text-lg font-bold text-[#6d59ff] flex-shrink-0 mt-0.5" />
                            <span className="text-lg break-all font-bold text-[#6d59ff]">
                              Email Host: {d.domainEmailHost || "—"}
                            </span>
                          </div>
                          {d.domainPurchaseDate && (
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                              <span className="text-xs">
                                Purchase: {new Date(d.domainPurchaseDate).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          )}
                          {d.domainExpiryDate && (
                            <div className="flex items-center text-red-600">
                              <CalendarIcon className="w-4 h-4 mr-2 text-red-500" />
                              <span className="text-xs">
                                Expiry: {new Date(d.domainExpiryDate).toLocaleDateString('en-IN')}
                              </span>

                            </div>
                          )}
                          
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-2">
                            Employee's:
                          </p>
                          {d.agents.length > 0 ? (
                            <div className="space-y-2">
                              {d.agents.map((a) => (
                                <button
                                  key={a.id}
                                  onClick={() => setSelectedAgent(a)}
                                  className="w-full text-left px-3 py-2 rounded-lg bg-white hover:bg-blue-50 text-sm text-gray-900 font-medium transition-colors flex items-center"
                                >
                                  <User className="w-4 h-4 mr-2 text-blue-600" />
                                  <span className="truncate">{a.agentName || "Unnamed"}</span>
                                  <ChevronRight className="w-4 h-4 ml-auto text-gray-500" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              No agents assigned
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-full text-center text-gray-500 italic py-8">
                      No domains found for this host.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agent Details Modal - Enhanced */}
        {selectedAgent && (
          <div className="fixed inset-0 bg-black/50  backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
           <div className="bg-white shadow-2xl border border-gray-200 rounded-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-5xl max-h-[90vh] overflow-y-auto transition-all duration-300 mx-auto">
             
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-600" />
                  Employee Details
                </h3>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Profile Avatar */}
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                    <User className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Name + Status */}
                {/* Agent Status */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Employee Status</p>
                    <p className="font-medium text-gray-900">{selectedAgent.agentName || "—"}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${selectedAgent.agentStatus === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {selectedAgent.agentStatus === "active" ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Email Status */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email Status</p>
                    <p className="font-medium text-gray-900 break-all">{selectedAgent.agentEmail}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${selectedAgent.emailStatus === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {selectedAgent.emailStatus === "active" ? "Active" : "Inactive"}
                  </span>
                </div>


                {/* Email + Email Status */}
                {/* <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900 break-all">{selectedAgent.agentEmail}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${selectedAgent.emailStatus === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {selectedAgent.emailStatus === "active" ? "Active" : "Inactive"}
                  </span>
                </div> */}

                {/* Leads */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 mb-1">Leads Assigned</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {selectedAgent.leadEmailCount ?? 0}
                  </p>
                </div>

                {/* Password */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Password</p>
                  <p className="font-mono text-gray-900 bg-white px-3 py-2 rounded-lg break-all">
                    {selectedAgent.agentPassword || "—"}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition shadow"
                >
                  Close
                </button>
              </div>
              
            </div>
          </div>
        )}

        {/* Edit Host Modal - Enhanced */}
        {editingAgent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-gray-200">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <Edit className="w-5 h-5 mr-2 text-blue-600" />
                  Edit Hosting Account
                </h2>
                <button
                  onClick={() => setEditingAgent(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Domain Host</label>
                  <input
                    type="text"
                    name="domainHost"
                    placeholder="e.g., GoDaddy, Namecheap"
                    value={editingAgent.domainHost}
                    onChange={(e) =>
                      setEditingAgent({
                        ...editingAgent,
                        domainHost: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Login ID</label>
                  <input
                    type="text"
                    name="loginId"
                    placeholder="Enter login ID"
                    value={editingAgent.loginId}
                    onChange={(e) =>
                      setEditingAgent({
                        ...editingAgent,
                        loginId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Password</label>
                  <input
                    type="text"
                    name="loginPass"
                    placeholder="Enter password"
                    value={editingAgent.loginPass}
                    onChange={(e) =>
                      setEditingAgent({
                        ...editingAgent,
                        loginPass: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Customer ID</label>
                  <input
                    type="text"
                    name="customerId"
                    placeholder="Enter customer ID"
                    value={editingAgent.customerId}
                    onChange={(e) =>
                      setEditingAgent({
                        ...editingAgent,
                        customerId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setEditingAgent(null)}
                  className="w-full sm:w-auto px-6 py-2 text-gray-800 hover:bg-gray-100 rounded-xl font-medium transition-colors border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAgent}
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition shadow"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
