import { MessageCircle, FileText, CheckSquare, Settings, LogOut, Menu } from 'lucide-react';
import useUIStore from '../store/uiStore';
import './Sidebar.css';

function Sidebar({ currentPage, onPageChange }) {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const menuItems = [
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg"
      >
        <Menu size={24} />
      </button>
      
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-950 border-r border-gray-800 flex flex-col transition-all duration-300 overflow-y-auto`}
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className={`text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent ${
            !sidebarOpen && 'hidden'
          }`}>
            AI Dev Assistant
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
