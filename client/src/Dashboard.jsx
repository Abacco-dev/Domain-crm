import { useState, useEffect } from "react";
import { Globe, List, AlertTriangle, Plus, Menu, X, ChevronRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddDomainForm from "./AddDomainForm";
import AllInfo from "./AllInfo";
import ExpireInfo from "./ExpireInfo";
import ManagePanel from "./ManagePanel";

export default function Dashboard() {
  // Load the last selected tab from localStorage or default to "add"
  const [currentTab, setCurrentTab] = useState(() => {
    return localStorage.getItem("currentTab") || "add";
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false); // Added for expand/collapse
  const [isFlipping, setIsFlipping] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: "add", label: "Add Domain Info", icon: Plus, color: "text-green-600", bgColor: "bg-green-50", activeBg: "bg-green-100" },
    { id: "all", label: "All Information", icon: List, color: "text-indigo-600", bgColor: "bg-indigo-50", activeBg: "bg-indigo-100" },
    { id: "expire", label: "Expiry Dashboard", icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50", activeBg: "bg-red-100" },
    { id: "manage", label: "Management Panel", icon: Globe, color: "text-amber-600", bgColor: "bg-amber-50", activeBg: "bg-amber-100" },
  ];

  const getCurrentPageTitle = () => {
    const item = menuItems.find(item => item.id === currentTab);
    return item ? item.label : "Dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Example
    navigate("/");
  };

  // Update localStorage whenever the tab changes
  const handleTabClick = (tab) => {
    setCurrentTab(tab);
    localStorage.setItem("currentTab", tab);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition"
      >
        {sidebarOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}  // Added for expand
        onMouseLeave={() => setSidebarExpanded(false)}  // Added for collapse
        className={`
          fixed lg:sticky top-0 h-screen bg-white border-r border-slate-200 shadow-xl z-40
          transform transition-all duration-300 ease-in-out  // Added transition
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarExpanded ? 'lg:w-72' : 'lg:w-20'}  // Conditional width
          w-72
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-indigo-500 to-purple-600">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Globe className="w-7 h-7 text-indigo-600" />
              </div>
              <div className={`
                transition-all duration-300 overflow-hidden
                ${sidebarExpanded ? 'lg:opacity-100 lg:w-auto' : 'lg:opacity-0 lg:w-0'}
              `}>
                <h1 className="text-xl font-bold text-white whitespace-nowrap">Domain Manager</h1>
                <p className="text-xs text-indigo-100 whitespace-nowrap">Control Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-1 py-3 rounded-xl transition-all duration-200
                    group relative  // Added for tooltip
                    ${isActive
                      ? `${item.activeBg} shadow-sm border border-${item.color.split('-')[1]}-200`
                      : 'hover:bg-slate-50'
                    }
                  `}
                >
                  <div className={`
                    w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isActive ? item.bgColor : 'bg-slate-100'}
                    ${!sidebarExpanded && 'lg:mx-auto'}  // Center icon when collapsed
                  `}>
                    <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-slate-500'}`} />
                  </div>
                  <span className={`
                    font-medium whitespace-nowrap transition-all duration-300 overflow-hidden
                    ${sidebarExpanded ? 'lg:opacity-100 lg:w-auto' : 'lg:opacity-0 lg:w-0'}
                    ${isActive ? 'text-slate-900' : 'text-slate-600'}
                  `}>
                    {item.label}
                  </span>

                  {/* Tooltip for collapsed state */}
                  {!sidebarExpanded && (
                    <div className="
                      hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm 
                      rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 
                      transition-opacity duration-200 pointer-events-none shadow-lg z-50
                    ">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 
                        border-t-4 border-t-transparent 
                        border-r-4 border-r-gray-900 
                        border-b-4 border-b-transparent">
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 pb-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-1 py-3 bg-red-50 hover:bg-red-100 
                text-red-600 font-semibold rounded-xl transition group relative"
            >
              <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center bg-red-100 flex-shrink-0
                ${!sidebarExpanded && 'lg:mx-auto'}
              `}>
                <LogOut className="w-5 h-5" />
              </div>
              <span className={`
                whitespace-nowrap transition-all duration-300 overflow-hidden
                ${sidebarExpanded ? 'lg:opacity-100 lg:w-auto' : 'lg:opacity-0 lg:w-0'}
              `}>
                Logout
              </span>

              {/* Tooltip for collapsed state */}
              {!sidebarExpanded && (
                <div className="
                  hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm 
                  rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 
                  transition-opacity duration-200 pointer-events-none shadow-lg z-50
                ">
                  Logout
                  <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 
                    border-t-4 border-t-transparent 
                    border-r-4 border-r-gray-900 
                    border-b-4 border-b-transparent">
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 overflow-auto">
          {currentTab === "add" && <AddDomainForm />}
          {currentTab === "all" && <AllInfo />}
          {currentTab === "expire" && <ExpireInfo />}
          {currentTab === "manage" && <ManagePanel />}
        </div>
      </main>
    </div>
  );
}





// import { useState, useEffect } from "react";
// import { Globe, List, AlertTriangle, Plus, Menu, X, ChevronRight, LogOut } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import AddDomainForm from "./AddDomainForm";
// import AllInfo from "./AllInfo";
// import ExpireInfo from "./ExpireInfo";
// import ManagePanel from "./ManagePanel";


// export default function Dashboard() {
//   // Load the last selected tab from localStorage or default to "add"
//   const [currentTab, setCurrentTab] = useState(() => {
//     return localStorage.getItem("currentTab") || "add";
//   });

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isFlipping, setIsFlipping] = useState(false);
//   const navigate = useNavigate();

//   const menuItems = [
//     { id: "add", label: "Add Domain Info", icon: Plus, color: "text-green-600", bgColor: "bg-green-50", activeBg: "bg-green-100" },
//     { id: "all", label: "All Information", icon: List, color: "text-indigo-600", bgColor: "bg-indigo-50", activeBg: "bg-indigo-100" },
//     { id: "expire", label: "Expiry Dashboard", icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50", activeBg: "bg-red-100" },
//     { id: "manage", label: "Management Panel", icon: Globe, color: "text-amber-600", bgColor: "bg-amber-50", activeBg: "bg-amber-100" },
//   ];


//   const getCurrentPageTitle = () => {
//     const item = menuItems.find(item => item.id === currentTab);
//     return item ? item.label : "Dashboard";
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("authToken"); // Example
//     navigate("/");
//   };



//   // Update localStorage whenever the tab changes
//   const handleTabClick = (tab) => {
//     setCurrentTab(tab);
//     localStorage.setItem("currentTab", tab);
//     setSidebarOpen(false); // Close sidebar on mobile
//   };

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//       {/* Mobile Menu Button */}
//       <button
//         onClick={() => setSidebarOpen(!sidebarOpen)}
//         className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition"
//       >
//         {sidebarOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
//       </button>

//       {/* Overlay for mobile */}
//       {sidebarOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`
//           fixed lg:sticky top-0 h-screen w-72 bg-white border-r border-slate-200 shadow-xl z-40
//           transform transition-transform duration-300 ease-in-out
//           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
//         `}
//       >
//         <div className="flex flex-col h-full">
//           {/* Logo/Header */}
//           <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-indigo-500 to-purple-600">
//             <div className="flex items-center space-x-3">
//               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
//                 <Globe className="w-7 h-7 text-indigo-600" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-white">Domain Manager</h1>
//                 <p className="text-xs text-indigo-100">Control Panel</p>
//               </div>
//             </div>
//           </div>

//           {/* Navigation Menu */}
//           <nav className="flex-1 p-4 space-y-2">
//             <div></div>
//             {/* <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">Navigation</p> */}
//             {menuItems.map((item) => {
//               const Icon = item.icon;
//               const isActive = currentTab === item.id;

//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => handleTabClick(item.id)}
//                   className={`
//                     w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
//                     ${isActive
//                       ? `${item.activeBg} shadow-sm border border-${item.color.split('-')[1]}-200`
//                       : 'hover:bg-slate-50'
//                     }
//                   `}
//                 >
//                   <div className="flex items-center space-x-3">
//                     <div className={`
//                       w-9 h-9 rounded-lg flex items-center justify-center
//                       ${isActive ? item.bgColor : 'bg-slate-100'}
//                     `}>
//                       <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-slate-500'}`} />
//                     </div>
//                     <span className={`font-medium ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
//                       {item.label}
//                     </span>
//                   </div>
//                   {isActive && (
//                     <ChevronRight className={`w-4 h-4 ${item.color}`} />
//                   )}
//                 </button>
//               );
//             })}
//           </nav>

//           {/* Logout Button */}
//           <div className="p-4 pb-6">
//             <button
//               onClick={handleLogout}
//               className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
//             >
//               <LogOut className="w-4 h-4" />
//               <span>Logout</span>
//             </button>
//           </div>

//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 flex flex-col min-h-screen">
//         <div className="flex-1 overflow-auto">
//           {currentTab === "add" && <AddDomainForm />}
//           {currentTab === "all" && <AllInfo />}
//           {currentTab === "expire" && <ExpireInfo />}
//           {currentTab === "manage" && <ManagePanel />}

//         </div>
//       </main>
//     </div>
//   );
// }
