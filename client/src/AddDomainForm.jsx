import { useState } from "react";
import { Save, Database, Globe, Mail, User, Eye, EyeOff,
  Calendar, Building2, Lock, AtSign, Server, DollarSign } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function AddDomainForm() {
  const [form, setForm] = useState({
    domainHost: "",
    loginId: "",
    loginPass: "",
    customerId: "",
    domainName: "",
    domainPurchaseDate: "",
    domainExpiryDate: "",
    domainPrice: "",
    domainEmailHost: "",
    emailHostPurchase: "",
    emailHostExpiry: "",
    emailPrice: "",
    emailCount: "",
    emailAddresses: "",
  });

  const [agents, setAgents] = useState([{ agentName: "", empId:"", agentEmail: "", agentPassword: "", adminId: "" }]);
  const [showPassword, setShowPassword] = useState(false);
  const [showAgentPassword, setShowAgentPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [agentErrors, setAgentErrors] = useState([]);

  // Handle main form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Adjust agent inputs based on emailCount
    if (name === "emailCount") {
      const count = parseInt(value) || 1;
      setAgents(prev => {
        const newAgents = [...prev];
        while (newAgents.length < count) newAgents.push({ agentName: "", empId:"", agentEmail: "", agentPassword: "", adminId: "" });
        return newAgents.slice(0, count);
      });
    }
  };

  // Handle agent field change
  const handleAgentChange = (index, field, value) => {
    const updatedAgents = [...agents];
    updatedAgents[index][field] = value;
    setAgents(updatedAgents);

    const newErrors = [...agentErrors];
    if (newErrors[index]) newErrors[index] = "";
    setAgentErrors(newErrors);
  };

  // Form submission
// Form submission
const handleAdd = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setMessage({ type: "", text: "" });

  try {
    const formattedAgents = agents.map(a => ({
      agentName: a.agentName.trim(),
      empId: a.empId.trim(),
      agentEmail: a.agentEmail.trim(),
      agentPassword: a.agentPassword.trim(),
      adminId: a.adminId === "Admin" ? "1" : "0",
    }));

    // ✅ wrap all domain fields inside a "domain" object
    const payload = {
      domain: {
        domainHost: form.domainHost.trim(),
        loginId: form.loginId.trim(),
        loginPass: form.loginPass.trim(),
        customerId: form.customerId.trim(),
        domainName: form.domainName.trim(),
        domainPurchaseDate: form.domainPurchaseDate || null,
        domainExpiryDate: form.domainExpiryDate || null,
        domainPrice: Number(form.domainPrice) || 0,
        domainEmailHost: form.domainEmailHost.trim(),
        emailHostPurchase: form.emailHostPurchase || null,
        emailHostExpiry: form.emailHostExpiry || null,
        emailPrice: Number(form.emailPrice) || 0,
        emailCount: Number(form.emailCount) || formattedAgents.length,
        emailAddresses: formattedAgents.map(a => a.agentEmail).join(","),
      },
      agents: formattedAgents,
    };

    console.log("📦 Payload sent to backend:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/domains`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Backend error response:", data);
      throw new Error(data.error || data.message || "Failed to create domain");
    }

    console.log("✅ Created:", data);
    setMessage({ type: "success", text: "Domain and agents added successfully!" });

    setForm({
      domainHost: "",
      loginId: "",
      loginPass: "",
      customerId: "",
      domainName: "",
      domainPurchaseDate: "",
      domainExpiryDate: "",
      domainPrice: "",
      domainEmailHost: "",
      emailHostPurchase: "",
      emailHostExpiry: "",
      emailPrice: "",
      emailCount: "",
      emailAddresses: "",
    });
    setAgents([{ agentName: "", empId: "", agentEmail: "", agentPassword: "", adminId: "" }]);
  } catch (err) {
    console.error("❌ Error:", err);
    setMessage({ type: "error", text: err.message });
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Database className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Domain Management System</h1>
                <p className="text-indigo-100 text-sm mt-1">Manage domains, hosting, and email configurations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={(e) => handleAdd(e)} className="space-y-6">

          {/* Hosting */}
          <SectionHeader icon={<Building2 size={22} />} title="Hosting Provider Details" gradient="from-purple-500 to-indigo-600" />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Domain Hosting Provider" icon={<Globe size={16} className="text-indigo-600" />} name="domainHost" value={form.domainHost} onChange={handleChange} placeholder="e.g. GoDaddy" />
            <InputField label="Login ID / Username" icon={<User size={16} className="text-indigo-600" />} name="loginId" value={form.loginId} onChange={handleChange} placeholder="Enter your login username" />
            <PasswordField label="Password" icon={<Lock size={16} className="text-indigo-600" />} value={form.loginPass} onChange={(e) => handleChange({ target: { name: "loginPass", value: e.target.value } })} showPassword={showPassword} toggleShow={() => setShowPassword(!showPassword)} />
            <InputField label="Customer ID" icon={<Database size={16} className="text-indigo-600" />} name="customerId" value={form.customerId} onChange={handleChange} placeholder="Enter customer ID" />
          </div>

          {/* Domain Configuration */}
          <SectionHeader icon={<Globe size={22} />} title="Domain Configuration" gradient="from-blue-500 to-cyan-600" />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Domain Name" icon={<Globe size={16} className="text-blue-600" />} name="domainName" value={form.domainName} onChange={handleChange} placeholder="e.g. example.com" fullWidth />
            <InputField label="Purchase Date" icon={<Calendar size={16} className="text-blue-600" />} type="date" name="domainPurchaseDate" value={form.domainPurchaseDate} onChange={handleChange} />
            <InputField label="Expiry Date" icon={<Calendar size={16} className="text-red-600" />} type="date" name="domainExpiryDate" value={form.domainExpiryDate} onChange={handleChange} />
            <InputField label="Domain Price" icon={<DollarSign size={16} className="text-red-600" />} type="number" name="domainPrice" value={form.domainPrice} onChange={handleChange} />
          </div>

          {/* Email Hosting */}
          <SectionHeader icon={<Mail size={22} />} title="Email Hosting Configuration" gradient="from-emerald-500 to-teal-600" />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Domain Email Host" icon={<Server size={16} className="text-emerald-600" />} name="domainEmailHost" value={form.domainEmailHost} onChange={handleChange} placeholder="e.g. Google Workspace" />
            <InputField label="Number of Email Accounts" icon={<Database size={16} className="text-emerald-600" />} type="number" name="emailCount" value={form.emailCount} onChange={handleChange} />
            <InputField label="Email Host Purchase Date" icon={<Calendar size={16} className="text-emerald-600" />} type="date" name="emailHostPurchase" value={form.emailHostPurchase} onChange={handleChange} />
            <InputField label="Email Host Expiry Date" icon={<Calendar size={16} className="text-red-600" />} type="date" name="emailHostExpiry" value={form.emailHostExpiry} onChange={handleChange} />
            <InputField label="Email Price" icon={<DollarSign size={16} className="text-red-600" />} type="number" name="emailPrice" value={form.emailPrice} onChange={handleChange} />
          </div>

          {/* Agent Credentials */}
          <SectionHeader icon={<User size={22} />} title="Agent Email Credentials" gradient="from-orange-500 to-pink-600" />
          <div className="p-6 space-y-6">
            {agents.map((agent, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InputField label="Agent Name" icon={<User size={16} className="text-orange-600" />} value={agent.agentName} onChange={(e) => handleAgentChange(index, "agentName", e.target.value)} placeholder="Full name" />
                <InputField label="Employee Id" icon={<User size={16} className="text-orange-600" />} value={agent.empId} onChange={(e) => handleAgentChange(index, "empId", e.target.value)} placeholder="Empyloee Id" />
                <InputField label="Email Address" icon={<AtSign size={16} className="text-orange-600" />} value={agent.agentEmail} onChange={(e) => handleAgentChange(index, "agentEmail", e.target.value)} placeholder="agent@domain.com" />
                <PasswordField label="Password" icon={<Lock size={16} className="text-orange-600" />} value={agent.agentPassword} onChange={(e) => handleAgentChange(index, "agentPassword", e.target.value)} showPassword={showAgentPassword} toggleShow={() => setShowAgentPassword(!showAgentPassword)} />
                <SelectField label="Role" icon={<Database size={16} className="text-orange-600" />} value={agent.adminId} onChange={(e) => handleAgentChange(index, "adminId", e.target.value)} options={["Admin", "Normal"]} />
                {agentErrors[index] && <span className="md:col-span-4 text-red-600 text-sm">{agentErrors[index]}</span>}
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="group relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
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

// --- Reusable Components ---
const InputField = ({ label, icon, name, value, onChange, placeholder, type = "text", fullWidth }) => (
  <div className={`space-y-2 ${fullWidth ? "md:col-span-2" : ""}`}>
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">{icon}{label}</label>
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all" 
      required 
    />
  </div>
);

const PasswordField = ({ label, icon, value, onChange, showPassword, toggleShow }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">{icon}{label}</label>
    <div className="relative">
      <input 
        type={showPassword ? "text" : "password"} 
        value={value} 
        onChange={onChange} 
        placeholder="Secure password" 
        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all" 
        required 
      />
      <button type="button" onClick={toggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const SelectField = ({ label, icon, value, onChange, options }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">{icon}{label}</label>
    <select 
      value={value} 
      onChange={onChange} 
      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all" 
      required
    >
      <option value="">Select Role</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
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
