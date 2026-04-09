import React from "react";
import ThemeToggle from "../ui/ThemeToggle";

function Navbar() {
  return (
    <div className="sticky top-0 z-50 bg-background shadow-sm px-4 md:px-8 py-3 md:py-4 animate-fade">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-sky-400 flex items-center justify-center text-white font-bold animate-pop">AI</div>
          <div>
            <div className="text-base font-semibold">AI Resume Builder</div>
            <div className="text-sm muted">Generate polished resumes in seconds</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export default Navbar;