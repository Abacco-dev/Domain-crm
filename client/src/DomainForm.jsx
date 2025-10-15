import { useState } from "react";
import { Save, Globe, Calendar, DollarSign, Server } from "lucide-react";

export default function DomainForm({ onSave }) {
    const [form, setForm] = useState({
        domainName: "",
        domainPurchaseDate: "",
        domainExpiryDate: "",
        domainEmailHost: "",
        emailHostPurchase: "",
        emailHostExpiry: "",
        emailCount: "",
        domainPrice: "",
        emailHostPrice: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(form);
        setForm({
            customerId: "",
            domainProvider: "",
            domainName: "",
            domainPurchaseDate: "",
            domainExpiryDate: "",
            domainEmailHost: "",
            emailHostPurchase: "",
            emailHostExpiry: "",
            emailCount: "",
            domainPrice: "",
            emailHostPrice: "",
        });
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Globe className="text-white" size={22} />
                        <h2 className="text-xl font-semibold text-white">Domain & Email Hosting Configuration</h2>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Globe size={16} className="text-blue-600" />Domain Provider
                        </label>
                        <input
                            name="domainProvider"
                            value={form.domainProvider}
                            onChange={handleChange}
                            placeholder="e.g. GoDaddy"
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Globe size={16} className="text-blue-600" />Customer Id
                        </label>
                        <input
                            name="customerId"
                            value={form.customerId}
                            onChange={handleChange}
                            placeholder="e.g. 12345"
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Globe size={16} className="text-blue-600" />Domain Name
                        </label>
                        <input
                            name="domainName"
                            value={form.domainName}
                            onChange={handleChange}
                            placeholder="e.g. example.com"
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Calendar size={16} className="text-blue-600" />Purchase Date
                        </label>
                        <input
                            type="date"
                            name="domainPurchaseDate"
                            value={form.domainPurchaseDate}
                            onChange={handleChange}
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Calendar size={16} className="text-red-600" />Expiry Date
                        </label>
                        <input
                            type="date"
                            name="domainExpiryDate"
                            value={form.domainExpiryDate}
                            onChange={handleChange}
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <DollarSign size={16} className="text-green-600" />Domain Price
                        </label>
                        <input
                            name="domainPrice"
                            value={form.domainPrice}
                            onChange={handleChange}
                            placeholder="e.g. 15.99"
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all"
                            required
                        />
                    </div>
                    <div></div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Server size={16} className="text-emerald-600" />Domain Email Host
                        </label>
                        <input
                            name="domainEmailHost"
                            value={form.domainEmailHost}
                            onChange={handleChange}
                            placeholder="e.g. Google Workspace"
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
                            required
                        />
                    </div>
                    <div></div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Calendar size={16} className="text-emerald-600" />Email Host Purchase Date
                        </label>
                        <input
                            type="date"
                            name="emailHostPurchase"
                            value={form.emailHostPurchase}
                            onChange={handleChange}
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Calendar size={16} className="text-red-600" />Email Host Expiry Date
                        </label>
                        <input
                            type="date"
                            name="emailHostExpiry"
                            value={form.emailHostExpiry}
                            onChange={handleChange}
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Server size={16} className="text-emerald-600" />Number of Email Accounts
                        </label>
                        <input
                            type="number"
                            name="emailCount"
                            value={form.emailCount}
                            onChange={handleChange}
                            placeholder="e.g. 10"
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <DollarSign size={16} className="text-green-600" />Email Host Price
                        </label>
                        <input
                            name="emailHostPrice"
                            value={form.emailHostPrice}
                            onChange={handleChange}
                            placeholder="e.g. 6.00"
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end p-6">
                    <button
                        type="submit"
                        className="group relative bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-cyan-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
                    >
                        <Save size={20} /> Save Domain & Email Config
                    </button>
                </div>
            </div>
        </form>
    );
}
