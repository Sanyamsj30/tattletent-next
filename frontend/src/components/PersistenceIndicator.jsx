import React, { useState, useEffect } from 'react';

const PersistenceIndicator = ({ isActive }) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowSaved(true);
      const timer = setTimeout(() => {
        setShowSaved(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`transition-all duration-300 ${
          showSaved
            ? 'translate-y-0 opacity-100'
            : 'translate-y-2 opacity-0'
        }`}
      >
        <div className="glass-effect rounded-lg px-4 py-2 border border-accent-200">
          <div className="flex items-center gap-2 text-sm text-accent-700">
            <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
            <span>Data saved automatically</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersistenceIndicator;