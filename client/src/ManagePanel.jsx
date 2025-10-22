// src/components/ManagePanel.jsx
import { useState } from "react";
import { Wrench, Users, Mail, Globe } from "lucide-react";

// ✅ Import sub-components
import DomainsManager from "./DomainsManager";
import EmailsManager from "./EmailsManager";
import EmployeesManager from "./EmployeesManager";

export default function ManagePanel() {
  const [activeSection, setActiveSection] = useState("domains");

  const sections = [
    { id: "domains", label: "Domains", icon: Globe },
    { id: "emails", label: "Email Accounts", icon: Mail },
    { id: "employees", label: "Employees", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-amber-800 flex items-center gap-2">
              <Wrench size={22} /> Management Panel
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeSection === id
                    ? "bg-amber-600 text-white shadow-md"
                    : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          {/* Content Section */}
          <div>
            {activeSection === "domains" && <DomainsManager />}
            {activeSection === "emails" && <EmailsManager />}
            {activeSection === "employees" && <EmployeesManager />}
          </div>
        </div>
      </div>
    </div>
  );
}
