import { useState, useEffect } from "react";
import { Search, Globe, Mail, User, Calendar, Lock, ExternalLink, X, ChevronRight, Eye, EyeOff, Edit } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function AllInfo() {
  // ===== BACKEND DATA (Your original dummy data - unchanged) =====
  const [agents, setAgents] = useState([]);

  const [domains, setDomains] = useState([]);

  const [emailAgents, setEmailAgents] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ===== END BACKEND DATA =====

  // Backend integration would look like this:

  useEffect(() => {
    // Fetch agents data
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/agents`);
        const data = await response.json();

        setAgents(data);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };

    // Fetch domains data
    const fetchDomains = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/domains`);
        const data = await response.json();
        setDomains(() => {
          const unique = [];
          const seen = new Set();
          for (const d of data) {
            if (!seen.has(d.id)) {
              unique.push(d);
              seen.add(d.id);
            }
          }
          return unique;
        });
      } catch (error) {
        console.error('Error fetching domains:', error);
      }
    };

    const fetchEmailAgents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/agents`);
        const data = await response.json();

        // Fetch lead counts for each agentEmail from Lead CRM
        const updatedAgents = await Promise.all(
          data.map(async (agent) => {
            try {
              const countRes = await fetch(
                // `${API_BASE_URL}/api/leads/count/${agent.agentEmail}`
                 `https://abacco-lead-crm.onrender.com/api/leads/count/${agent.agentEmail}` 
              );
              const countData = await countRes.json();
              return {
                ...agent,
                leadEmailCount: countData.success ? countData.count : 0,
              };
            } catch (err) {
              console.error(`Error fetching lead count for ${agent.agentEmail}:`, err);
              return { ...agent, leadEmailCount: 0 };
            }
          })
        );

        console.log("Fetched email agents with lead counts:", updatedAgents);
        setEmailAgents(updatedAgents);
      } catch (error) {
        console.error("Error fetching email agents:", error);
      }
    };


    fetchAgents();
    fetchDomains();
    fetchEmailAgents();
  },  [refreshTrigger]);


  // Edit states
  const [editingAgent, setEditingAgent] = useState(null);
  const [editingDomain, setEditingDomain] = useState(null);
  const [editingEmailAgent, setEditingEmailAgent] = useState(null);

  // Existing states
  const [selectedDomain, setSelectedDomain] = useState([]);
  const [selectedAgentEmails, setSelectedAgentEmails] = useState([]);
  const [showEmailAgents, setShowEmailAgents] = useState(false);
  const [noEmailFound, setNoEmailFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const handleDomainClick = (domainId) => {
    if (!domainId) return;
    const filtered = domains.filter((d) => d.id === domainId);
    setSelectedDomain(filtered);
  };


  const handleEmailClick = (agentName) => {
    const filtered = emailAgents.filter(
      (a) => a.agentName && a.agentName.toLowerCase() === agentName.toLowerCase()
    );

    if (filtered.length > 0) {
      setSelectedAgentEmails(filtered);
      setShowEmailAgents(true);
      setNoEmailFound(false);
    } else {
      setSelectedAgentEmails([]);
      setShowEmailAgents(true);
      setNoEmailFound(true);
    }
  };

  const uniqueAgents = agents.filter(
    (agent, index, self) =>
      index === self.findIndex(a => a.domain?.id === agent.domain?.id)
  );

  const filteredAgents = uniqueAgents.filter(agent =>
    (agent.agentName && agent.agentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (agent.agentEmail && agent.agentEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (agent.domain?.domainName && agent.domain.domainName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (agent.domain?.domainHost && agent.domain.domainHost.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Edit handlers
  const handleEditAgent = (agent) => {
    const fullAgent = {
      id: agent.id,
      agentName: agent.agentName || "",
      empId: agent.empId || "",
      agentEmail: agent.agentEmail || "",
      agentPassword: agent.agentPassword || "",
      adminId: agent.adminId || "",
      domainHost: agent.domain?.domainHost || agent.domainHost || "",
      loginId: agent.domain?.loginId || agent.loginId || "",
      loginPass: agent.domain?.loginPass || agent.loginPass || "",
      customerId: agent.domain?.customerId || agent.customerId || "",
      // ✅ ensure domainId is present
      domainId: agent.domainId || (agent.domain && agent.domain.id) || null,
      domain: agent.domain || null,
    };

    setEditingAgent(fullAgent);
  };


  const handleEditDomain = (domain) => {
    const fullDomain = {
      id: domain.id,
      domainProvider:
        domain.domainProvider ||
        domain.domainHost ||
        domain.domain?.domainHost ||
        "",
      domainName: domain.domainName || domain.domain?.domainName || "",
      domainPurchaseDate:
        domain.domainPurchaseDate || domain.domain?.domainPurchaseDate || "",
      domainExpiryDate:
        domain.domainExpiryDate || domain.domain?.domainExpiryDate || "",
      domainEmailHost:
        domain.domainEmailHost || domain.domain?.domainEmailHost || "",
      emailHostPurchase:
        domain.emailHostPurchase || domain.domain?.emailHostPurchase || "",
      emailHostExpiry:
        domain.emailHostExpiry || domain.domain?.emailHostExpiry || "",
      emailCount: domain.emailCount || domain.domain?.emailCount || "",
      emailAddresses:
        domain.emailAddresses || domain.domain?.emailAddresses || "",
      customerId: domain.customerId || domain.domain?.customerId || "",
    };
    setEditingDomain(fullDomain);
  };


  const handleEditEmailAgent = (emailAgent) => {
    // Ensure domainId is available for backend PUT route
    const fullAgent = {
      id: emailAgent.id,
      agentName: emailAgent.agentName || "",
      empId: emailAgent.empId || "",
      agentEmail: emailAgent.agentEmail || "",
      agentPassword: emailAgent.agentPassword || "",
      adminId: emailAgent.adminId || "",
      domainId:
        emailAgent.domainId ||
        (emailAgent.domain && emailAgent.domain.id) ||
        null,
    };

    setEditingEmailAgent(fullAgent);
  };


const handleSaveAgent = async () => {
  if (!editingAgent) return;

  try {
    const domainId =
      editingAgent.domainId ||
      (editingAgent.domain && editingAgent.domain.id);

    if (!domainId) {
      alert("❌ Missing domain ID. Cannot update agent.");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/domains/${domainId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: {
          domainHost: editingAgent.domainHost,
          loginId: editingAgent.loginId,
          loginPass: editingAgent.loginPass,
          customerId: editingAgent.customerId,
        },
        agents: [
          {
            id: editingAgent.id,
            agentName: editingAgent.agentName,
            empId: editingAgent.empId,
            agentEmail: editingAgent.agentEmail,
            agentPassword: editingAgent.agentPassword,
            adminId: editingAgent.adminId,
          },
        ],
      }),
    });

    if (!response.ok) throw new Error("Failed to update agent");

    await response.json();

    // ✅ Auto refresh data everywhere
    setRefreshTrigger(prev => prev + 1);

    setEditingAgent(null);
    alert("✅ Agent updated successfully!");
  } catch (err) {
    console.error("Error saving agent:", err);
    alert("❌ Failed to update agent. Check console for details.");
  }
};




 const handleSaveDomain = async () => {
  if (!editingDomain) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/domains/${editingDomain.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: {
          domainHost: editingDomain.domainProvider,
          domainName: editingDomain.domainName,
          domainPurchaseDate: editingDomain.domainPurchaseDate,
          domainExpiryDate: editingDomain.domainExpiryDate,
          domainEmailHost: editingDomain.domainEmailHost,
          emailHostPurchase: editingDomain.emailHostPurchase,
          emailHostExpiry: editingDomain.emailHostExpiry,
          emailCount: editingDomain.emailCount,
          emailAddresses: editingDomain.emailAddresses,
          customerId: editingDomain.customerId,
        },
        agents: editingDomain.agents || [],
      }),
    });

    if (!response.ok) throw new Error("Failed to update domain");

    await response.json();

    // ✅ Auto refresh data
    setRefreshTrigger(prev => prev + 1);

    setEditingDomain(null);
    alert("✅ Domain updated successfully!");
  } catch (err) {
    console.error("Error saving domain:", err);
    alert("❌ Failed to save domain changes. Check console for details.");
  }
};



 const handleSaveEmailAgent = async () => {
  if (!editingEmailAgent) return;

  try {
    const domainId =
      editingEmailAgent.domainId ||
      (editingEmailAgent.domain && editingEmailAgent.domain.id);

    if (!domainId) {
      alert("❌ Missing domain ID for this agent. Cannot update.");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/domains/${domainId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agents: [
          {
            id: editingEmailAgent.id,
            agentName: editingEmailAgent.agentName,
            empId: editingEmailAgent.empId,
            agentEmail: editingEmailAgent.agentEmail,
            agentPassword: editingEmailAgent.agentPassword,
            adminId: editingEmailAgent.adminId,
          },
        ],
      }),
    });

    if (!response.ok) throw new Error("Failed to update email agent");

    await response.json();

    // ✅ Auto refresh data
    setRefreshTrigger(prev => prev + 1);

    setEditingEmailAgent(null);
    alert("✅ Email agent updated successfully!");
  } catch (err) {
    console.error("Error saving email agent:", err);
    alert("❌ Failed to save email agent changes. Check console for details.");
  }
};



  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Domain Manager</h1>
                <p className="text-sm text-slate-500">Manage your domains and email accounts</p>
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
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by domain host, login ID, or customer ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Agents</p>
                <p className="text-3xl font-bold mt-1">{agents.length}</p>
              </div>
              <User className="w-12 h-12 text-blue-200 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Domains</p>
                <p className="text-3xl font-bold mt-1">{domains.length}</p>
              </div>
              <Globe className="w-12 h-12 text-purple-200 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Email Accounts</p>
                <p className="text-3xl font-bold mt-1">{emailAgents.length}</p>
              </div>
              <Mail className="w-12 h-12 text-indigo-200 opacity-80" />
            </div>
          </div>
        </div>

        {/* Domain Hosting Accounts */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white mb-[2rem]">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-indigo-600" />
              Domain Hosting Accounts
            </h2>
          </div>
          {/* Domain Hosting Accounts */}
          <div className="bg-white shadow-sm border border-slate-200 overflow-hidden ">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200 ">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Domain Host</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Login ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-slate-50 transition">

                      {/* Domain Host - show only once */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                            <Globe className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="font-medium text-slate-800">
                            {agent.domain?.domainHost || agent.domainHost || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Login ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-slate-600">
                          <Mail className="w-4 h-4 mr-2 text-slate-400" />
                          {agent.domain?.loginId || "—"}
                        </div>
                      </td>

                      {/* Password */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-slate-600">
                          <Lock className="w-4 h-4 mr-2 text-slate-400" />
                          <span className="font-mono text-sm">
                            {visiblePasswords[`agent-${agent.id}`]
                              ? agent.domain?.loginPass
                              : "••••••••"}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(`agent-${agent.id}`)}
                            className="ml-2 p-1 hover:bg-slate-100 rounded transition"
                          >
                            {visiblePasswords[`agent-${agent.id}`] ? (
                              <EyeOff className="w-4 h-4 text-slate-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Customer ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          {agent.domain?.customerId || "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDomainClick(agent.domain?.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
                          >
                            View Domains
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                          <button
                            onClick={() => handleEditAgent(agent)}
                            className="inline-flex items-center px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
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
          </div>

        </div>

        {/* Customer Domain Info Modal/Section */}
        {selectedDomain.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-indigo-600" />
                  Customer Domain Information
                </h2>
                <button
                  onClick={() => setSelectedDomain([])}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="overflow-x-auto flex-1 p-6">
                <div className="space-y-4">
                  {selectedDomain.map((d) => (
                    <div key={d.customerId} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg p-6 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer ID</p>
                          <p className="text-sm font-medium text-slate-800">{d.customerId}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Domain Provider</p>
                          <p className="text-sm font-medium text-slate-800">{d.domainHost}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Domain Name</p>
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600">{d.domainName}</p>
                            <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Purchase Date</p>
                          <p className="text-sm font-medium text-slate-800">{d.domainPurchaseDate}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry Date</p>
                          <p className="text-sm font-medium text-red-600">{d.domainExpiryDate}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Host</p>
                          <p className="text-sm font-medium text-slate-800">{d.domainEmailHost}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Host Purchase</p>
                          <p className="text-sm font-medium text-slate-800">{d.emailHostPurchase}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Host Expiry</p>
                          <p className="text-sm font-medium text-red-600">{d.emailHostExpiry}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Count</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {d.emailCount} emails
                          </span>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned To</p>
                          {d.agents && d.agents.map((agent) => (
                            <button
                              key={agent.id}
                              onClick={() => handleEmailClick(agent.agentName)}
                              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 underline mr-2"
                            >
                              {agent.agentName}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          ))}

                        </div>
                        <div className="md:col-span-3 flex justify-end">
                          <button
                            onClick={() => handleEditDomain(d)}
                            className="inline-flex items-center px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Domain
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => setSelectedDomain([])}
                  className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Agents Modal/Section */}
        {showEmailAgents && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-white flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-purple-600" />
                  Email Agent Information
                </h2>
                <button
                  onClick={() => {
                    setShowEmailAgents(false);
                    setNoEmailFound(false);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="overflow-auto flex-1 p-6">
                {noEmailFound ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-lg font-medium text-slate-800 mb-2">No Email Accounts Found</p>
                    <p className="text-sm text-slate-500">No email has been provided for this agent.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAgentEmails && selectedAgentEmails.map((a) => (
                      <div key={a.id} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{a.agentName}</p>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${a.adminId === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                {a.adminId}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditEmailAgent(a)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          {/* <div className="flex items-center text-sm">
                            <Mail className="w-4 h-4 mr-2 text-slate-400" />
                            <span className="text-slate-600">{a.agentEmail}</span>
                          </div> */}
                          <div className="flex items-center text-sm justify-between">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-slate-400" />
                              <span className="text-slate-600">{a.agentEmail}</span>
                            </div>
                            {a.leadEmailCount !== undefined && (
                              <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                                {a.leadEmailCount} Leads
                              </span>
                            )}
                          </div>

                          <div className="flex items-center text-sm">
                            <Lock className="w-4 h-4 mr-2 text-slate-400" />
                            <span className="text-slate-600 font-mono">
                              {visiblePasswords[`email-${a.id}`] ? a.agentPassword : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(`email-${a.id}`)}
                              className="ml-2 p-1 hover:bg-slate-100 rounded transition"
                            >
                              {visiblePasswords[`email-${a.id}`] ? (
                                <EyeOff className="w-4 h-4 text-slate-500" />
                              ) : (
                                <Eye className="w-4 h-4 text-slate-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => {
                    setShowEmailAgents(false);
                    setNoEmailFound(false);
                  }}
                  className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== Edit Agent Modal ===================== */}
        {editingAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Edit Host</h2>
                <button
                  onClick={() => setEditingAgent(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700 w-1/3">Domain Host</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="domainHost"
                          value={editingAgent.domainHost || ""}
                          onChange={(e) => handleInputChange(e, setEditingAgent)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700">Login ID</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="loginId"
                          value={editingAgent.loginId || ""}
                          onChange={(e) => handleInputChange(e, setEditingAgent)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700">Password</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="loginPass"
                          value={editingAgent.loginPass || ""}
                          onChange={(e) => handleInputChange(e, setEditingAgent)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium text-slate-700">Customer ID</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="customerId"
                          value={editingAgent.customerId || ""}
                          onChange={(e) => handleInputChange(e, setEditingAgent)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
                <button
                  onClick={() => setEditingAgent(null)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAgent}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== Edit Domain Modal ===================== */}

        {editingDomain && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Edit Domain</h2>
                <button
                  onClick={() => setEditingDomain(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700 w-1/3">Domain Provider</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="domainProvider"
                          value={editingDomain.domainProvider || ""}
                          onChange={(e) => handleInputChange(e, setEditingDomain)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700">Domain Name</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="domainName"
                          value={editingDomain.domainName || ""}
                          onChange={(e) => handleInputChange(e, setEditingDomain)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700">Purchase Date</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="domainPurchaseDate"
                          value={editingDomain.domainPurchaseDate || ""}
                          onChange={(e) => handleInputChange(e, setEditingDomain)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700">Expiry Date</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="domainExpiryDate"
                          value={editingDomain.domainExpiryDate || ""}
                          onChange={(e) => handleInputChange(e, setEditingDomain)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700">Email Host</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="domainEmailHost"
                          value={editingDomain.domainEmailHost || ""}
                          onChange={(e) => handleInputChange(e, setEditingDomain)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700">Email Host Purchase</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="emailHostPurchase"
                          value={editingDomain.emailHostPurchase || ""}
                          onChange={(e) => handleInputChange(e, setEditingDomain)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700">Email Host Expiry</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="emailHostExpiry"
                          value={editingDomain.emailHostExpiry || ""}
                          onChange={(e) => handleInputChange(e, setEditingDomain)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700">Email Count</td>
                      <td className="py-3">
                        <input
                          type="number"
                          name="emailCount"
                          value={editingDomain.emailCount || ""}
                          onChange={(e) => handleInputChange(e, setEditingDomain)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium text-slate-700">Assigned Emails</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="emailAddresses"
                          value={editingDomain.emailAddresses || ""}
                          onChange={(e) => handleInputChange(e, setEditingDomain)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
                <button
                  onClick={() => setEditingDomain(null)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDomain}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Edit Email Agent Modal */}
        {editingEmailAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-white flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Edit Email Agent</h2>
                <button
                  onClick={() => setEditingEmailAgent(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700 w-1/3">Agent Name</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="agentName"
                          value={editingEmailAgent.agentName}
                          onChange={(e) => handleInputChange(e, setEditingEmailAgent)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700 w-1/3">Employee Id</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="empId"
                          value={editingEmailAgent.empId}
                          onChange={(e) => handleInputChange(e, setEditingEmailAgent)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700">Agent Email</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="agentEmail"
                          value={editingEmailAgent.agentEmail}
                          onChange={(e) => handleInputChange(e, setEditingEmailAgent)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-700">Agent Password</td>
                      <td className="py-3">
                        <input
                          type="text"
                          name="agentPassword"
                          value={editingEmailAgent.agentPassword}
                          onChange={(e) => handleInputChange(e, setEditingEmailAgent)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium text-slate-700">Admin ID</td>
                      <td className="py-3">
                        <select
                          name="adminId"
                          value={editingEmailAgent.adminId}
                          onChange={(e) => handleInputChange(e, setEditingEmailAgent)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="normal">Normal</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
                <button
                  onClick={() => setEditingEmailAgent(null)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEmailAgent}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm"
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
