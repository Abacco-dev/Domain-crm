import { useState } from "react";
import {
  Save, Database, Globe, Mail, User, Eye, EyeOff,
  Calendar, Building2, Lock, AtSign, Server, DollarSign, PlusCircle
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AddDomainForm() {
  const [form, setForm] = useState({
    domainHost: "",
    loginId: "",
    loginPass: "",
    customerId: "",
  });

  // Multiple domains array
  const [domains, setDomains] = useState([
    {
      domainName: "",
      domainPurchaseDate: "",
      domainExpiryDate: "",
      domainPrice: "",
      domainEmailHost: "",
      emailPrice: "",
      emailCount: "",
      emailAddresses: "",
      agents: [],
    },
  ]);

  const [selectedEmailDomainIndex, setSelectedEmailDomainIndex] = useState(0);
  const [selectedAgentDomainIndex, setSelectedAgentDomainIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showAgentPassword, setShowAgentPassword] = useState(false);
  const [partialUpdate, setPartialUpdate] = useState(false);

  // Handlers
  const handleMainChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDomainChange = (index, field, value) => {
    const updated = [...domains];
    updated[index][field] = value;
    setDomains(updated);
  };

  const addNewDomain = () => {
    setDomains([
      ...domains,
      {
        domainName: "",
        domainPurchaseDate: "",
        domainExpiryDate: "",
        domainPrice: "",
        domainEmailHost: "",
        emailPrice: "",
        emailCount: "",
        emailAddresses: "",
        agents: [],
      },
    ]);
  };

  const handleEmailHostChange = (field, value) => {
    const updated = [...domains];
    updated[selectedEmailDomainIndex][field] = value;
    setDomains(updated);
  };

  const handleAgentChange = (agentIndex, field, value) => {
    const updatedDomains = [...domains];
    updatedDomains[selectedAgentDomainIndex].agents[agentIndex][field] = value;
    setDomains(updatedDomains);
  };

  const addAgent = () => {
    const updatedDomains = [...domains];
    updatedDomains[selectedAgentDomainIndex].agents.push({
      agentName: "",
      empId: "",
      agentEmail: "",
      agentPassword: "",
      adminId: "",
      emailPurchaseDate: "",
      emailExpiryDate: "",
    });
    setDomains(updatedDomains);
  };

  // Initialize agents when email count changes
  const handleEmailCountChange = (domainIndex, value) => {
    const count = parseInt(value) || 0;
    const updatedDomains = [...domains];
    updatedDomains[domainIndex].emailCount = value;

    // Adjust agents array based on email count
    if (updatedDomains[domainIndex].agents.length < count) {
      while (updatedDomains[domainIndex].agents.length < count) {
        updatedDomains[domainIndex].agents.push({
          agentName: "",
          empId: "",
          agentEmail: "",
          agentPassword: "",
          adminId: "",
          emailPurchaseDate: "",
          emailExpiryDate: "",
        });
      }
    } else {
      updatedDomains[domainIndex].agents = updatedDomains[domainIndex].agents.slice(0, count);
    }

    setDomains(updatedDomains);
  };

  // Submit
  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      // Validate required fields
      if (!form.domainHost || !form.loginId || !form.loginPass) {
        throw new Error("Hosting Provider Details are required");
      }

      // Check if at least one domain has a name
      const hasDomainName = domains.some(domain => domain.domainName.trim() !== "");
      if (!hasDomainName) {
        throw new Error("At least one domain name is required");
      }

      // Prepare payload with only the fields that have values
      const payload = {
        domainHost: form.domainHost.trim(),
        loginId: form.loginId.trim(),
        loginPass: form.loginPass.trim(),
        customerId: form.customerId?.trim() || null,
        domains: domains
          .filter(domain => domain.domainName.trim() !== "")
          .map(domain => {
            const domainPayload = {
              domainName: domain.domainName.trim(),
            };

            if (domain.domainPurchaseDate) domainPayload.domainPurchaseDate = domain.domainPurchaseDate;
            if (domain.domainExpiryDate) domainPayload.domainExpiryDate = domain.domainExpiryDate;
            if (domain.domainPrice) domainPayload.domainPrice = Number(domain.domainPrice);
            if (domain.domainEmailHost) domainPayload.domainEmailHost = domain.domainEmailHost.trim();
            if (domain.emailPrice) domainPayload.emailPrice = Number(domain.emailPrice);
            if (domain.emailCount) domainPayload.emailCount = Number(domain.emailCount);

            // Include agents as EmailAccounts
            const agentsWithEmail = domain.agents.filter(agent => agent.agentEmail?.trim());
            if (agentsWithEmail.length > 0) {
              domainPayload.emailAccounts = agentsWithEmail.map(agent => ({
                email: agent.agentEmail.trim(),
                password: agent.agentPassword?.trim() || null,
                emailPurchaseDate: agent.emailPurchaseDate || null,
                emailExpiryDate: agent.emailExpiryDate || null,
              }));
              domainPayload.agents = agentsWithEmail.map(agent => ({
                agentName: agent.agentName?.trim() || null,
                empId: agent.empId?.trim() || null,
                agentEmail: agent.agentEmail.trim(),
                agentPassword: agent.agentPassword?.trim() || null,
                adminId: agent.adminId || null,
              }));
              domainPayload.emailAddresses = agentsWithEmail.map(a => a.agentEmail.trim()).join(",");
            }

            return domainPayload;
          })
      };

      console.log("📦 Sending payload:", payload);

      const endpoint = partialUpdate
        ? `${API_BASE_URL}/api/domain-manager/basic-setup`
        : `${API_BASE_URL}/api/domain-manager/complete-setup`;

      const token = localStorage.getItem("token");

      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMessage;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.message || `HTTP error! status: ${res.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${res.status} - ${res.statusText}`;
          if (res.status === 404) {
            errorMessage += ". The API endpoint was not found. Please check backend server.";
          }
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log("✅ Response received:", data);

      setMessage({
        type: "success",
        text: partialUpdate
          ? "✅ Domain information saved successfully! You can add email hosting details later."
          : "✅ Complete domain information saved successfully!",
      });

      if (!partialUpdate) {
        setForm({ domainHost: "", loginId: "", loginPass: "", customerId: "" });
        setDomains([
          {
            domainName: "",
            domainPurchaseDate: "",
            domainExpiryDate: "",
            domainPrice: "",
            domainEmailHost: "",
            emailPrice: "",
            emailCount: "",
            emailAddresses: "",
            agents: [],
          },
        ]);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Header />
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl ${message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
              }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-6">
          {/* Hosting Section */}
          <SectionHeader
            icon={<Building2 size={22} />}
            title="Hosting Provider Details (Required)"
            gradient="from-purple-500 to-indigo-600"
          />
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Domain Hosting Provider *"
                icon={<Globe size={16} className="text-indigo-600" />}
                name="domainHost"
                value={form.domainHost}
                onChange={handleMainChange}
                placeholder="e.g. GoDaddy"
                required
              />
              <InputField
                label="Login ID / Username *"
                icon={<User size={16} className="text-indigo-600" />}
                name="loginId"
                value={form.loginId}
                onChange={handleMainChange}
                placeholder="Login ID"
                required
              />
              <PasswordField
                label="Password *"
                icon={<Lock size={16} className="text-indigo-600" />}
                value={form.loginPass}
                onChange={(e) =>
                  handleMainChange({
                    target: { name: "loginPass", value: e.target.value },
                  })
                }
                showPassword={showPassword}
                toggleShow={() => setShowPassword(!showPassword)}
                required
              />
              <InputField
                label="Customer ID"
                icon={<Database size={16} className="text-indigo-600" />}
                name="customerId"
                value={form.customerId}
                onChange={handleMainChange}
                placeholder="Customer ID"
              />
            </div>
          </div>

          {/* Domain Config Section */}
          <SectionHeader
            icon={<Globe size={22} />}
            title="Domain Configurations (Required)"
            gradient="from-blue-500 to-cyan-600"
          />

          {domains.map((domain, i) => (
            <div
              key={i}
              className="border border-slate-200 rounded-2xl bg-white p-6 mb-6 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-700">
                  Domain {i + 1}
                </h3>
                {i === domains.length - 1 && (
                  <button
                    type="button"
                    onClick={addNewDomain}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <PlusCircle size={18} /> Add More Domain
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <InputField
                  label="Domain Name *"
                  icon={<Globe size={16} className="text-blue-600" />}
                  value={domain.domainName}
                  onChange={(e) =>
                    handleDomainChange(i, "domainName", e.target.value)
                  }
                  placeholder="example.com"
                  fullWidth
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <InputField
                  label="Purchase Date"
                  icon={<Calendar size={16} className="text-blue-600" />}
                  type="date"
                  value={domain.domainPurchaseDate}
                  onChange={(e) =>
                    handleDomainChange(i, "domainPurchaseDate", e.target.value)
                  }
                />
                <InputField
                  label="Expiry Date"
                  icon={<Calendar size={16} className="text-red-600" />}
                  type="date"
                  value={domain.domainExpiryDate}
                  onChange={(e) =>
                    handleDomainChange(i, "domainExpiryDate", e.target.value)
                  }
                />
                <InputField
                  label="Domain Price"
                  icon={<DollarSign size={16} className="text-red-600" />}
                  type="number"
                  value={domain.domainPrice}
                  onChange={(e) =>
                    handleDomainChange(i, "domainPrice", e.target.value)
                  }
                />
              </div>
            </div>
          ))}

          {/* Email Hosting Section */}
          <SectionHeader
            icon={<Mail size={20} />}
            title="Email Hosting Configuration (Optional)"
            gradient="from-emerald-500 to-teal-600"
          />

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
            {/* Select Domain Dropdown */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Globe size={16} className="text-emerald-600" />
                Select Domain
              </label>
              <select
                value={selectedEmailDomainIndex}
                onChange={(e) =>
                  setSelectedEmailDomainIndex(parseInt(e.target.value))
                }
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
              >
                {domains.map((domain, index) => (
                  <option key={index} value={index}>
                    {domain.domainName || `Domain ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Host Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Email Host"
                icon={<Server size={16} className="text-emerald-600" />}
                value={domains[selectedEmailDomainIndex]?.domainEmailHost || ""}
                onChange={(e) =>
                  handleEmailHostChange("domainEmailHost", e.target.value)
                }
                placeholder="e.g. Google Workspace"
              />
              <InputField
                label="Email Price (₹)"
                icon={<DollarSign size={16} className="text-emerald-600" />}
                type="number"
                value={domains[selectedEmailDomainIndex]?.emailPrice || ""}
                onChange={(e) =>
                  handleEmailHostChange("emailPrice", e.target.value)
                }
                placeholder="e.g. 499"
              />
              <InputField
                label="No. of Emails"
                icon={<Database size={16} className="text-emerald-600" />}
                type="number"
                value={domains[selectedEmailDomainIndex]?.emailCount || ""}
                onChange={(e) =>
                  handleEmailCountChange(selectedEmailDomainIndex, e.target.value)
                }
              />
            </div>
          </div>


          {/* Agents Section */}
          <SectionHeader
            icon={<User size={20} />}
            title="Employee Email Credentials (Optional)"
            gradient="from-orange-500 to-pink-600"
          />
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Globe size={16} className="text-orange-600" />
                Select Domain
              </label>
              <select
                value={selectedAgentDomainIndex}
                onChange={(e) =>
                  setSelectedAgentDomainIndex(parseInt(e.target.value))
                }
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all"
              >
                {domains.map((domain, index) => (
                  <option key={index} value={index}>
                    {domain.domainName || `Domain ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-6">
              {domains[selectedAgentDomainIndex]?.agents?.map((agent, j) => (
                <div
                  key={j}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  <InputField
                    label="Employee Name"
                    icon={<User size={16} className="text-orange-600" />}
                    value={agent.agentName}
                    onChange={(e) =>
                      handleAgentChange(j, "agentName", e.target.value)
                    }
                    placeholder="Full name"
                  />
                  <InputField
                    label="Employee Id"
                    icon={<User size={16} className="text-orange-600" />}
                    value={agent.empId}
                    onChange={(e) =>
                      handleAgentChange(j, "empId", e.target.value)
                    }
                    placeholder="EMP001"
                  />
                  <InputField
                    label="Email Address"
                    icon={<AtSign size={16} className="text-orange-600" />}
                    value={agent.agentEmail}
                    onChange={(e) =>
                      handleAgentChange(j, "agentEmail", e.target.value)
                    }
                    placeholder="agent@domain.com"
                  />
                  <PasswordField
                    label="Password"
                    icon={<Lock size={16} className="text-orange-600" />}
                    value={agent.agentPassword}
                    onChange={(e) =>
                      handleAgentChange(j, "agentPassword", e.target.value)
                    }
                    showPassword={showAgentPassword}
                    toggleShow={() =>
                      setShowAgentPassword(!showAgentPassword)
                    }
                  />
                  <InputField
                    label="Email Purchase Date"
                    icon={<Calendar size={16} className="text-green-600" />}
                    type="date"
                    value={agent.emailPurchaseDate || ""}
                    onChange={(e) =>
                      handleAgentChange(j, "emailPurchaseDate", e.target.value)
                    }
                  />
                  <InputField
                    label="Email Expiry Date"
                    icon={<Calendar size={16} className="text-red-600" />}
                    type="date"
                    value={agent.emailExpiryDate || ""}
                    onChange={(e) =>
                      handleAgentChange(j, "emailExpiryDate", e.target.value)
                    }
                  />
                </div>
              ))}

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={addAgent}
                  className="flex items-center text-sm text-orange-600 hover:text-orange-800"
                >
                  <PlusCircle size={16} className="mr-1" /> Add More Employee
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedAgentDomainIndex((prev) =>
                      prev < domains.length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-800"
                >
                  <PlusCircle size={18} /> Configure Next Domain
                </button>
              </div>
            </div>
          </div>

          {/* Partial Update Toggle */}
          {/* <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
            <input
              type="checkbox"
              id="partialUpdate"
              checked={partialUpdate}
              onChange={(e) => setPartialUpdate(e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="partialUpdate"
              className="text-blue-800 font-medium"
            >
              Save only required information (Hosting and Domain details). I'll
              add email hosting later.
            </label>
          </div> */}

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 disabled:opacity-70"
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  <Save size={20} /> Save Domain Info
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// UI Components
const Header = () => (
  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-6 overflow-hidden">
    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6 flex items-center gap-3">
      <Database className="text-white" size={28} />
      <div>
        <h1 className="text-3xl font-bold text-white">
          Domain Management System
        </h1>
        <p className="text-indigo-100 text-sm mt-1">
          Manage domains, hosting, and email configurations
        </p>
      </div>
    </div>
  </div>
);

const InputField = ({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  fullWidth,
  name,
  required,
}) => (
  <div className={`space-y-2 ${fullWidth ? "md:col-span-2" : ""}`}>
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
      {icon}
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
    />
  </div>
);

const PasswordField = ({
  label,
  icon,
  value,
  onChange,
  showPassword,
  toggleShow,
  required,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
      {icon}
      {label}
    </label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder="Secure password"
        required={required}
        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all"
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const SectionHeader = ({ icon, title, gradient }) => (
  <div className={`bg-gradient-to-r ${gradient} px-6 py-4 rounded-2xl`}>
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
  </div>
);
