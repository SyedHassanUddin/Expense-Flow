import React from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  Calendar, 
  BarChart3, 
  Bell, 
  Settings, 
  TrendingUp,
  X,
  Menu
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onAddExpense }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Calendar, label: 'Schedule Reminder' },
    { icon: BarChart3, label: 'Reports' },
    { icon: Bell, label: 'Notifications' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                <TrendingUp size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">ExpenseFlow</span>
            </div>
            <button 
              onClick={onClose}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">
            Menu
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`sidebar-item ${item.active ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Add Expense Button */}
        <div className="p-4 mt-auto">
          <button
            onClick={onAddExpense}
            className="w-full btn-primary justify-center"
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <span className="text-white font-semibold text-sm">MP</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">
                Mathew Perry
              </div>
              <div className="text-xs text-slate-500 truncate">
                mathewperry@xyz.com
              </div>
            </div>
            <button className="p-1 hover:bg-slate-100 rounded">
              <Menu size={16} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;