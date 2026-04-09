import { Home, FileText, Settings, CheckCircle } from "lucide-react";
import { MdDashboard } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 h-screen w-20 md:w-64 p-3 md:p-4 bg-sidebar text-sidebar-foreground overflow-hidden border-r border-sidebar-border" aria-label="Primary">
      <div className="flex flex-col items-center md:items-start gap-4 h-full">
        <div className="flex items-center gap-3 md:pl-2 pt-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-sky-400 flex items-center justify-center text-white font-bold">AI</div>
          <div className="hidden md:block">
            <div className="font-semibold text-sm">AI Resume</div>
            <div className="text-xs muted">Build resumes fast</div>
          </div>
        </div>

        <div className="w-full">
          <button title="Home" onClick={() => navigate('/')} className="nav-btn animate-pop" style={{transitionDelay: '40ms'}}>
            <Home className="w-5 h-5" />
            <span className="hidden md:inline">Home</span>
          </button>
          <button title="Dashboard" onClick={() => navigate('/db')} className="nav-btn mt-2 animate-pop" style={{transitionDelay: '60ms'}}>
            <MdDashboard className="w-5 h-5" />
            <span className="hidden md:inline">Dashboard</span>
          </button>
          <button title="Create Resume" onClick={() => navigate('/resume')} className="nav-btn mt-2 animate-pop" style={{transitionDelay: '80ms'}}>
            <FileText className="w-5 h-5" />
            <span className="hidden md:inline">Create Resume</span>
          </button>
          <button title="ATS Checker" onClick={() => navigate('/ats')} className="nav-btn mt-2 animate-pop" style={{transitionDelay: '100ms'}}>
            <CheckCircle className="w-5 h-5" />
            <span className="hidden md:inline">ATS Checker</span>
          </button>
          <button title="Settings" onClick={() => navigate('/setting')} className="nav-btn mt-2 animate-pop" style={{transitionDelay: '120ms'}}>
            <Settings className="w-5 h-5" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;