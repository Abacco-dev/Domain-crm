import { useState } from "react";
import { Save, Globe, User, Lock, Database, Building2 } from "lucide-react";

export default function HostingForm({ onSave }) {
  const [form, setForm] = useState({
    domainHost: "",
    loginId: "",
    loginPass: "",
    customerId: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(form);
    setForm({ domainHost: "", loginId: "", loginPass: "", customerId: "" });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center gap-2">
            <Building2 className="text-white" size={22} />
            <h2 className="text-xl font-semibold text-white">Hosting Provider Details</h2>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Globe size={16} className="text-indigo-600" />Domain Hosting Provider
            </label>
            <input
              name="domainHost"
              value={form.domainHost}
              onChange={handleChange}
              placeholder="e.g. GoDaddy"
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User size={16} className="text-indigo-600" />Login ID / Username
            </label>
            <input
              name="loginId"
              value={form.loginId}
              onChange={handleChange}
              placeholder="Enter your login username"
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Lock size={16} className="text-indigo-600" />Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="loginPass"
                value={form.loginPass}
                onChange={handleChange}
                placeholder="Enter secure password"
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <Lock size={18} /> : <Lock size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Database size={16} className="text-indigo-600" />Customer ID
            </label>
            <input
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              placeholder="Enter customer ID"
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
              required
            />
          </div>
        </div>

        <div className="flex justify-end p-6">
          <button
            type="submit"
            className="group relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
          >
            <Save size={20} /> Save Hosting Details
          </button>
        </div>
      </div>
    </form>
  );
}
