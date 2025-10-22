import { useEffect, useState } from "react";
import { Users, Loader2, ToggleLeft, ToggleRight } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EmployeesManager() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // 🔹 Fetch all agents
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees`);
      const data = await res.json();

      // 🧠 Sort: Inactive first, Active next
      const sorted = data.sort((a, b) => a.isActive - b.isActive);
      setEmployees(sorted || []);
    } catch (err) {
      console.error("❌ Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 🔹 Toggle employee active/inactive
  const handleToggle = async (id, currentStatus) => {
    setTogglingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/${id}/toggle`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Failed to toggle employee status");

      alert(`✅ Employee ${currentStatus ? "deactivated" : "activated"} successfully!`);
      fetchEmployees();
    } catch (err) {
      console.error("❌ Toggle error:", err);
      alert("Failed to update employee status.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Users className="text-red-600 w-6 h-6" />
        <h2 className="font-semibold text-lg sm:text-xl text-amber-800">
          Employee Controls
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-amber-200 rounded-xl shadow-sm">
        <table className="w-full text-sm table-fixed border-collapse">
          <thead className="bg-red-50 border-b border-amber-300">
            <tr>
              <th className="w-[40%] text-left px-6 py-3 text-amber-800 font-semibold">
                Employee Name
              </th>
              <th className="w-[30%] text-left px-6 py-3 text-amber-800 font-semibold">
                Employee ID
              </th>
              <th className="w-[15%] text-left px-6 py-3 text-amber-800 font-semibold">
                Status
              </th>
              <th className="w-[15%] text-center px-6 py-3 text-amber-800 font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-amber-700">
                  <Loader2 className="w-5 h-5 inline-block animate-spin mr-2" />
                  Loading employees...
                </td>
              </tr>
            ) : employees.length > 0 ? (
              employees.map((emp) => (
                <tr
                  key={emp.id}
                  className={`border-b border-amber-100 hover:bg-amber-50 transition ${
                    emp.isActive ? "" : "bg-red-50/40"
                  }`}
                >
                  {/* Agent Name */}
                  <td className="px-6 py-3 font-medium text-slate-800 truncate">
                    {emp.agentName || "—"}
                  </td>

                  {/* Employee ID */}
                  <td className="px-6 py-3 text-slate-700 truncate">
                    {emp.empId || "—"}
                  </td>

                  {/* Status */}
                  <td
                    className={`px-6 py-3 font-medium ${
                      emp.isActive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {emp.isActive ? "Active" : "Inactive"}
                  </td>

                  {/* Toggle Button */}
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => handleToggle(emp.id, emp.isActive)}
                      disabled={togglingId === emp.id}
                      className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-amber-100 transition disabled:opacity-50"
                    >
                      {togglingId === emp.id ? (
                        <Loader2 className="w-5 h-5 text-amber-700 animate-spin" />
                      ) : emp.isActive ? (
                        <ToggleRight className="w-6 h-6 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-red-600" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-6 text-center text-amber-700 italic">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
