import { useState, useEffect } from "react";
import { Mail, Server, User, AlertTriangle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EmailsManager() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/agents/emails/inactive`);
      const data = await res.json();
      setEmails(data || []);
    } catch (err) {
      console.error("❌ Error fetching inactive emails:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-2 mb-5">
        <Mail className="text-blue-600 w-5 h-5" />
        <h2 className="font-semibold text-lg sm:text-xl text-blue-800">
          Inactive Email Accounts
        </h2>
      </div>

      {/* ===== TABLE ===== */}
      <div className="overflow-x-auto bg-white border border-blue-200 rounded-xl shadow-sm">
        <table className="w-full text-sm table-fixed border-collapse">
          <thead className="bg-blue-50 border-b border-blue-200">
            <tr>
              <th className="w-[20%] text-left px-6 py-3 text-blue-700 font-semibold">Email</th>
              <th className="w-[20%] text-left px-6 py-3 text-blue-700 font-semibold">Domain</th>
              <th className="w-[20%] text-left px-6 py-3 text-blue-700 font-semibold">Domain Host</th>
              <th className="w-[20%] text-left px-6 py-3 text-blue-700 font-semibold">Assigned To</th>
              <th className="w-[20%] text-left px-6 py-3 text-blue-700 font-semibold">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-blue-700 italic">
                  Loading inactive email accounts...
                </td>
              </tr>
            ) : emails.length > 0 ? (
              emails.map((email) => (
                <tr
                  key={email.id}
                  className="hover:bg-blue-50 transition border-b border-blue-100"
                >
                  {/* EMAIL */}
                  <td className="px-6 py-3 text-blue-700 font-medium truncate align-middle">
                    {email.email}
                  </td>

                  {/* DOMAIN */}
                  <td className="px-6 py-3 text-slate-700 truncate align-middle">
                    {email.domain?.domainName || "—"}
                  </td>

                  {/* DOMAIN HOST */}
                  <td className="px-6 py-3 text-slate-700 align-middle">
                    <span className="inline-flex items-center gap-1">
                      <Server className="w-4 h-4 text-slate-500" />
                      {email.domain?.hostAccount?.domainHost || "—"}
                    </span>
                  </td>

                  {/* ASSIGNED TO */}
                  <td className="px-6 py-3 text-slate-700 align-middle">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-4 h-4 text-slate-500" />
                      {email.agent?.agentName || "—"}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-3 text-red-600 align-middle">
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Inactive
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-blue-700 italic">
                  No inactive email accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
