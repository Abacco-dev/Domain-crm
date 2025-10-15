import { useState } from "react";
import { Save, User, Lock, AtSign, Database, Eye, EyeOff } from "lucide-react";

export default function AgentEmailCredentialsForm({ onSave }) {
  const [agents, setAgents] = useState([{ agentName: "", agentEmail: "", agentPassword: "", adminId: "" }]);
  const [showAgentPassword, setShowAgentPassword] = useState(false);

  const handleAgentChange = (index, field, value) => {
    const updatedAgents = [...agents];
    updatedAgents[index][field] = value;
    setAgents(updatedAgents);
  };

  const addMoreAgent = () => {
    setAgents((prev) => [...prev, { agentName: "", agentEmail: "", agentPassword: "", adminId: "" }]);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(agents);
    setAgents([{ agentName: "", agentEmail: "", agentPassword: "", adminId: "" }]);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-4">
          <div className="flex items-center gap-2">
            <User className="text-white" size={22} />
            <h2 className="text-xl font-semibold text-white">Agent Email Credentials</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {agents.map((agent, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Agent Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User size={16} className="text-orange-600" />Agent Name
                </label>
                <input
                  value={agent.agentName}
                  onChange={(e) => handleAgentChange(index, "agentName", e.target.value)}
                  placeholder="Full name"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Agent Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <AtSign size={16} className="text-orange-600" />Email Address
                </label>
                <input
                  value={agent.agentEmail}
                  onChange={(e) => handleAgentChange(index, "agentEmail", e.target.value)}
                  placeholder="agent@domain.com"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Agent Password */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Lock size={16} className="text-orange-600" />Password
                </label>
                <div className="relative">
                  <input
                    type={showAgentPassword ? "text" : "password"}
                    value={agent.agentPassword}
                    onChange={(e) => handleAgentChange(index, "agentPassword", e.target.value)}
                    placeholder="Secure password"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAgentPassword(!showAgentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showAgentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Admin Role */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Database size={16} className="text-orange-600" />Role
                </label>
                <select
                  value={agent.adminId}
                  onChange={(e) => handleAgentChange(index, "adminId", e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
            </div>
          ))}

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={addMoreAgent}
              className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-all"
            >
              Add More Agent
            </button>

            <button
              type="submit"
              className="bg-gradient-to-r from-orange-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Save size={18} /> Save Agents
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
