import { useEffect, useState, useMemo } from "react";
import {
  Globe,
  Loader2,
  Plus,
  Save,
  Trash2,
  ToggleRight,
  ToggleLeft,
  Pencil,
  X,
  Mail,
  ChevronDown,
  ChevronRight,
  RefreshCcw,
  Check,
  Server,
  Calendar,
  DollarSign,
  User,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DomainsManager() {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newDomain, setNewDomain] = useState({});
  const [savingHost, setSavingHost] = useState(null);
  const [editingDomain, setEditingDomain] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    domainId: null,
    domainName: "",
  });
  const [expandedDomains, setExpandedDomains] = useState({});
  const [emailModal, setEmailModal] = useState({
    show: false,
    domainId: null,
    domainPrice: null,
  });

  const fetchHosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/manage/hosts`);
      const data = await res.json();
      setHosts(data || []);
    } catch (err) {
      console.error("Error fetching hosts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const domainMap = useMemo(() => {
    const m = new Map();
    hosts.forEach((h) =>
      h.domains?.forEach((d) => {
        m.set(d.id, d);
      })
    );
    return m;
  }, [hosts]);

  const handleAddDomain = (hostId) => {
    setNewDomain((prev) => ({
      ...prev,
      [hostId]: {
        domainName: "",
        domainPurchaseDate: "",
        domainExpiryDate: "",
        domainPrice: "",
        domainEmailHost: "",
      },
    }));
  };

  const handleSaveNewDomain = async (hostId) => {
    const domain = newDomain[hostId];
    if (!domain?.domainName) return alert("Please enter a domain name.");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/manage/hosts/${hostId}/domains`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(domain),
        }
      );
      if (!res.ok) throw new Error("Failed to add domain");

      alert("✅ Domain added successfully!");
      setNewDomain((prev) => ({ ...prev, [hostId]: null }));
      fetchHosts();
    } catch (err) {
      console.error("Error adding domain:", err);
      alert("❌ Failed to add domain.");
    }
  };

  const handleUpdateDomain = async (domainId, updatedData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/manage/domains/${domainId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData), // ✅ FIX: send data directly
    });

    if (!res.ok) throw new Error("Update failed");

    alert("✅ Domain updated!");
    fetchHosts();
  } catch (err) {
    console.error("Error updating domain:", err);
    alert("❌ Failed to update domain.");
  }
};


  const handleToggleActive = async (domainId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/manage/domains/${domainId}/toggle`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Toggle failed");
      fetchHosts();
    } catch (err) {
      console.error("Error toggling active:", err);
    }
  };

  const handleSaveHost = async (hostId) => {
    setSavingHost(hostId);
    try {
      const host = hosts.find((h) => h.id === hostId);
      await fetch(`${API_BASE_URL}/api/manage/hosts/${hostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainHost: host.domainHost,
          loginId: host.loginId,
          loginPass: host.loginPass,
          customerId: host.customerId,
          isActive: host.isActive,
        }),
      });
      alert("✅ Hosting account updated!");
      fetchHosts();
    } catch (err) {
      console.error("Error saving host:", err);
      alert("❌ Failed to save host.");
    } finally {
      setSavingHost(null);
    }
  };

  const handleDeleteDomain = async () => {
    const { domainId } = confirmDelete;
    if (!domainId) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/manage/domains/${domainId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete domain");

      alert("🗑️ Domain deleted successfully!");
      setConfirmDelete({ show: false, domainId: null, domainName: "" });
      fetchHosts();
    } catch (err) {
      console.error("Error deleting domain:", err);
      alert("❌ Failed to delete domain.");
    }
  };

  const handleAddEmail = async (domainId, emailEntries) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/manage/domains/${domainId}/emails`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails: emailEntries }),
        }
      );

      if (!response.ok) {
        const t = await response.text();
        console.error("Add emails response:", t);
        throw new Error("Failed to create email(s)");
      }

      const data = await response.json();
      console.log("✅ Emails added:", data);

      setEmailModal({ show: false, domainId: null, domainPrice: null });

      await new Promise((resolve) => setTimeout(resolve, 300));
      await fetchHosts();

      setExpandedDomains((prev) => ({ ...prev, [domainId]: true }));

      alert("✅ Emails & agents added successfully!");
    } catch (err) {
      console.error("Error adding emails:", err);
      alert("❌ Failed to add emails.");
    }
  };

  const toggleExpandDomain = (domainId) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">Loading domains...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-8 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
              Domain Manager
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 ml-0 sm:ml-14">
            Manage your hosting accounts, domains, and email services
          </p>
        </div>

        {/* Hosts */}
        <div className="space-y-4 sm:space-y-6">
          {hosts.map((host) => (
            <div
              key={host.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              {/* Host Header */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-white border-b border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                        {host.domainHost}
                      </h2>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${host.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {host.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {host.loginId}
                      </span>
                      <span className="flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        ID: {host.customerId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={fetchHosts}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-sm transition-colors"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <button
                      onClick={() => handleSaveHost(host.id)}
                      disabled={savingHost === host.id}
                      className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {savingHost === host.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Save</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Domains */}
              <div className="p-4 sm:p-6">
                {host.domains?.length ? (
                  <div className="space-y-3">
                    {host.domains.map((domain) => (
                      <DomainCard
                        key={domain.id}
                        domain={domain}
                        expanded={!!expandedDomains[domain.id]}
                        onToggle={() => toggleExpandDomain(domain.id)}
                        onEdit={() => setEditingDomain(domain)}
                        onDelete={() =>
                          setConfirmDelete({
                            show: true,
                            domainId: domain.id,
                            domainName: domain.domainName,
                          })
                        }
                        onToggleActive={() => handleToggleActive(domain.id)}
                        onAddEmail={() =>
                          setEmailModal({
                            show: true,
                            domainId: domain.id,
                            domainPrice: domain.emailPrice,
                          })
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No domains found</p>
                  </div>
                )}

                {/* Add Domain */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  {newDomain[host.id] ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="example.com"
                        value={newDomain[host.id].domainName}
                        onChange={(e) =>
                          setNewDomain((prev) => ({
                            ...prev,
                            [host.id]: { ...prev[host.id], domainName: e.target.value },
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveNewDomain(host.id)}
                          className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Save className="w-4 h-4 inline mr-1" /> Save
                        </button>
                        <button
                          onClick={() => setNewDomain((prev) => ({ ...prev, [host.id]: null }))}
                          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddDomain(host.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Domain
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modals */}
        {editingDomain && (
          <EditDomainModal
            domain={editingDomain}
            onClose={() => setEditingDomain(null)}
            onSave={async (updated) => {
              await handleUpdateDomain(editingDomain.id, updated);
              setEditingDomain(null);
            }}
          />
        )}

        {emailModal.show && (
          <AddEmailModal
            domainId={emailModal.domainId}
            domainPrice={emailModal.domainPrice}
            onClose={() =>
              setEmailModal({ show: false, domainId: null, domainPrice: null })
            }
            onSave={handleAddEmail}
          />
        )}

        {confirmDelete.show && (
          <DeleteDomainModal
            confirmDelete={confirmDelete}
            setConfirmDelete={setConfirmDelete}
            handleDeleteDomain={handleDeleteDomain}
          />
        )}
      </div>
    </div>
  );
}

function DomainCard({ domain, expanded, onToggle, onEdit, onDelete, onToggleActive, onAddEmail }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={onToggle}
            className="flex items-center gap-2 text-left flex-1 min-w-0"
          >
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">{domain.domainName}</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                {domain.domainExpiryDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Exp: {new Date(domain.domainExpiryDate).toLocaleDateString('en-IN')}
                  </span>

                )}
                {domain.domainPrice && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ₹{domain.domainPrice}
                  </span>
                )}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onToggleActive}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              title={domain.isActive ? "Active" : "Inactive"}
            >
              {domain.isActive ? (
                <ToggleRight className="w-5 h-5 text-green-500" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-slate-400" />
              )}
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onAddEmail}
              className="px-2 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              <span className="hidden sm:inline">Email</span>
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50">
          <DomainEmailsSection domainId={domain.id} domain={domain} />
        </div>
      )}
    </div>
  );
}

function DomainEmailsSection({ domainId, domain }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [editing, setEditing] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [toggling, setToggling] = useState({ type: null, id: null });

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/manage/domains/${domainId}/emails`);
      const data = await res.json();

      console.log("📦 Email API response:", data);

      // ✅ Normalize + Fallback for missing agent info
      const normalized = (data || []).map((r) => {
        // 🔍 Try to find a matching agent in domain.agents if email.agent is null
        let foundAgent = r.agent;
        if (!foundAgent && domain?.agents?.length) {
          foundAgent = domain.agents.find(
            (a) => a.agentEmail?.toLowerCase() === r.email?.toLowerCase()
          );
        }

        return {
          ...r,
          emailPurchaseDate: r.emailPurchaseDate ? r.emailPurchaseDate.split("T")[0] : "",
          emailExpiryDate: r.emailExpiryDate ? r.emailExpiryDate.split("T")[0] : "",
          agent: {
            id: foundAgent?.id ?? null,
            agentName: foundAgent?.agentName ?? "",
            empId: foundAgent?.empId ?? "",
            agentEmail: foundAgent?.agentEmail ?? r.email ?? "",
            isActive: foundAgent?.isActive ?? true,
          },
        };
      });

      setRows(normalized);
    } catch (e) {
      console.error("❌ Error loading emails:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [domainId]);

  const toggleEdit = (id) => {
    setEditing((p) => ({ ...p, [id]: !p[id] }));
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleChange = (id, field, value, section = "email") => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? section === "email"
            ? { ...r, [field]: value }
            : { ...r, agent: { ...r.agent, [field]: value } }
          : r
      )
    );
  };

  const handleSave = async (row) => {
    setSavingId(row.id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/manage/emails/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: row.email,
          password: row.password,
          emailPurchaseDate: row.emailPurchaseDate,
          emailExpiryDate: row.emailExpiryDate,
          agent: {
            agentName: row.agent?.agentName,
            empId: row.agent?.empId,
            agentEmail: row.agent?.agentEmail ?? row.email,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      alert("✅ Updated successfully!");
      setEditing((p) => ({ ...p, [row.id]: false }));
      fetchEmails();
    } catch (e) {
      console.error("Error saving:", e);
      alert("❌ Failed to save.");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleEmail = async (emailId) => {
    setToggling({ type: 'email', id: emailId });
    try {
      const res = await fetch(`${API_BASE_URL}/api/manage/emails/${emailId}/toggle`, {
        method: 'PATCH',
      });

      if (!res.ok) throw new Error("Toggle failed");

      // Update the local state to reflect the change
      setRows(prev => prev.map(row =>
        row.id === emailId ? { ...row, isActive: !row.isActive } : row
      ));

      alert("✅ Email status updated!");
    } catch (e) {
      console.error("Error toggling email:", e);
      alert("❌ Failed to toggle email status.");
    } finally {
      setToggling({ type: null, id: null });
    }
  };

  const handleToggleAgent = async (agentId) => {
    if (!agentId) return;

    setToggling({ type: 'agent', id: agentId });
    try {
      const res = await fetch(`${API_BASE_URL}/api/manage/agents/${agentId}/toggle`, {
        method: 'PATCH',
      });

      if (!res.ok) throw new Error("Toggle failed");

      // Update the local state to reflect the change
      setRows(prev => prev.map(row =>
        row.agent?.id === agentId
          ? { ...row, agent: { ...row.agent, isActive: !row.agent.isActive } }
          : row
      ));

      alert("✅ Agent status updated!");
    } catch (e) {
      console.error("Error toggling agent:", e);
      alert("❌ Failed to toggle agent status.");
    } finally {
      setToggling({ type: null, id: null });
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin mx-auto" />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="p-6 text-center text-sm text-slate-500">
        No emails yet. Click "Add Email" to create one.
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-slate-800 text-sm">Email Accounts & Agents</h4>
        <button
          onClick={fetchEmails}
          className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1"
        >
          <RefreshCcw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((r) => {
          const isEdit = !!editing[r.id];
          const isTogglingEmail = toggling.type === 'email' && toggling.id === r.id;
          const isTogglingAgent = toggling.type === 'agent' && toggling.id === r.agent?.id;

          return (
            <div key={r.id} className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  {isEdit ? (
                    <input
                      type="email"
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={r.email}
                      onChange={(e) => handleChange(r.id, "email", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 truncate">{r.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                  <div className="flex items-center">
                    {isEdit ? (
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={r.password || ""}
                        onChange={(e) => handleChange(r.id, "password", e.target.value)}
                      />
                    ) : (
                      <span className="text-sm text-slate-600 font-mono">
                        {visiblePasswords[r.id] ? r.password : "••••••••"}
                      </span>
                    )}
                    {!isEdit && (
                      <button
                        onClick={() => togglePasswordVisibility(r.id)}
                        className="ml-2 p-1 hover:bg-slate-100 rounded-lg transition"
                      >
                        {visiblePasswords[r.id] ? (
                          <EyeOff className="w-4 h-4 text-slate-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Agent Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Employee Name</label>
                  {isEdit ? (
                    <input
                      type="text"
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={r.agent.agentName || ""}
                      onChange={(e) => handleChange(r.id, "agentName", e.target.value, "agent")}
                    />
                  ) : (
                    <p className="text-sm text-slate-800">{r.agent.agentName || "—"}</p>
                  )}
                </div>

                {/* Employee ID */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Employee ID</label>
                  {isEdit ? (
                    <input
                      type="text"
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={r.agent.empId || ""}
                      onChange={(e) => handleChange(r.id, "empId", e.target.value, "agent")}
                    />
                  ) : (
                    <p className="text-sm text-slate-800">{r.agent.empId || "—"}</p>
                  )}
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Expiry Date</label>
                  {isEdit ? (
                    <input
                      type="date"
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={r.emailExpiryDate || ""}
                      onChange={(e) => handleChange(r.id, "emailExpiryDate", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm text-slate-800">
                      {r.emailExpiryDate ? new Date(r.emailExpiryDate).toLocaleDateString('en-IN') : "—"}
                    </p>
                  )}
                </div>


                {/* Toggle Buttons */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Email:</span>
                      <button
                        onClick={() => handleToggleEmail(r.id)}
                        disabled={isTogglingEmail}
                        className={`p-1.5 rounded-lg transition-colors ${r.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        title={r.isActive ? "Email is active" : "Email is inactive"}
                      >
                        {r.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Employee:</span>
                      <button
                        onClick={() => handleToggleAgent(r.agent?.id)}
                        disabled={isTogglingAgent || !r.agent?.id}
                        className={`p-1.5 rounded-lg transition-colors ${r.agent?.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        title={r.agent?.isActive ? "Agent is active" : "Agent is inactive"}
                      >
                        {r.agent?.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save / Edit Button */}
                <div className="flex items-end">
                  {isEdit ? (
                    <button
                      onClick={() => handleSave(r)}
                      disabled={savingId === r.id}
                      className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {savingId === r.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleEdit(r.id)}
                      className="w-full px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditDomainModal({ domain, onClose, onSave }) {
  const [formData, setFormData] = useState({
    ...domain,
    domainPurchaseDate: domain.domainPurchaseDate ? domain.domainPurchaseDate.split("T")[0] : "",
    domainExpiryDate: domain.domainExpiryDate ? domain.domainExpiryDate.split("T")[0] : "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Edit Domain</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Domain Name</label>
            <input
              type="text"
              name="domainName"
              value={formData.domainName || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Domain Price (₹)</label>
            <input
              type="number"
              name="domainPrice"
              value={formData.domainPrice ?? ""}
              onChange={handleChange}
              placeholder="999"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Price (₹)</label>
            <input
              type="number"
              name="emailPrice"
              value={formData.emailPrice ?? ""}
              onChange={handleChange}
              placeholder="499"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Date</label>
            <input
              type="date"
              name="domainPurchaseDate"
              value={formData.domainPurchaseDate || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
            <input
              type="date"
              name="domainExpiryDate"
              value={formData.domainExpiryDate || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Host</label>
            <input
              type="text"
              name="domainEmailHost"
              value={formData.domainEmailHost || ""}
              onChange={handleChange}
              placeholder="Hostinger, GoDaddy"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function AddEmailModal({ domainId, onClose, onSave, domainPrice }) {
  const [emailEntries, setEmailEntries] = useState([
    { email: "", password: "", purchaseDate: "", expiryDate: "", agentName: "", empId: "" },
  ]);

  const handleChange = (index, field, value) => {
    setEmailEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  };

  const handleAddRow = () => {
    setEmailEntries((prev) => [
      ...prev,
      { email: "", password: "", purchaseDate: "", expiryDate: "", agentName: "", empId: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (emailEntries.length === 1) return;
    setEmailEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = () => {
    const invalid = emailEntries.some((e) => !e.email || !e.password);
    if (invalid) {
      alert("Please fill Email and Password for all rows.");
      return;
    }
    onSave(domainId, emailEntries);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Add Email Accounts & Agents
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <p className="text-sm text-slate-600">
            💰 Email Price: <span className="font-semibold">₹{domainPrice ?? "—"}</span>
          </p>
        </div>

        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {emailEntries.map((entry, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative">
              {emailEntries.length > 1 && (
                <button
                  onClick={() => handleRemoveRow(i)}
                  className="absolute right-3 top-3 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <h3 className="text-sm font-medium text-blue-700 mb-3">Entry {i + 1}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={entry.email}
                    onChange={(e) => handleChange(i, "email", e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Password *
                  </label>
                  <input
                    type="text"
                    value={entry.password}
                    onChange={(e) => handleChange(i, "password", e.target.value)}
                    placeholder="Password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={entry.purchaseDate}
                    onChange={(e) => handleChange(i, "purchaseDate", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={entry.expiryDate}
                    onChange={(e) => handleChange(i, "expiryDate", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={entry.agentName}
                    onChange={(e) => handleChange(i, "agentName", e.target.value)}
                    placeholder="Employee Name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={entry.empId}
                    onChange={(e) => handleChange(i, "empId", e.target.value)}
                    placeholder="EMP123"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleAddRow}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Another Entry
          </button>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" /> Save All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteDomainModal({ confirmDelete, setConfirmDelete, handleDeleteDomain }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Confirm Deletion</h2>
        </div>
        <p className="text-slate-600 mb-6">
          Delete <span className="font-semibold text-red-600">{confirmDelete.domainName}</span> and all related data? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmDelete({ show: false, domainId: null, domainName: "" })}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteDomain}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}