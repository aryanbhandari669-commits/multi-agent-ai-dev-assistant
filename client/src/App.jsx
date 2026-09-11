import { useState } from 'react';
import { MessageCircle, FileText, CheckSquare, Settings } from 'lucide-react';
import ChatPage from './pages/ChatPage';
import NotesPage from './pages/NotesPage';
import TasksPage from './pages/TasksPage';
import SettingsPage from './pages/SettingsPage';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('chat');

  const renderPage = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatPage />;
      case 'notes':
        return <NotesPage />;
      case 'tasks':
        return <TasksPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
