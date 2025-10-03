import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';

const WelcomeNotification = ({ role, complaintsCount }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if this is a returning session
    const sessionStart = sessionStorage.getItem('grievance_session_start');
    const now = Date.now();
    
    if (!sessionStart) {
      // First time this session, check if user has saved data
      sessionStorage.setItem('grievance_session_start', now.toString());
      if (role || complaintsCount > 0) {
        setShouldShow(true);
        setIsVisible(true);
      }
    }
  }, [role, complaintsCount]);

  useEffect(() => {
    if (isVisible) {
      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldShow || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm animate-slide-up">
      <div className="glass-effect rounded-lg p-4 border border-primary-200 shadow-strong">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👋</span>
              <h3 className="font-semibold text-secondary-900">Welcome back!</h3>
            </div>
            <p className="text-sm text-secondary-600">
              Your session has been restored as a {role}.
              {complaintsCount > 0 && (
                <span className="block text-primary-600 font-medium mt-1">
                  {complaintsCount} complaint{complaintsCount !== 1 ? 's' : ''} recovered
                </span>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-secondary-400 hover:text-secondary-600 p-1 h-auto min-h-0"
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeNotification;