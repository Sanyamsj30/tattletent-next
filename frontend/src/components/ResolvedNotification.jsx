import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const ResolvedNotification = ({ resolvedComplaints, onDismiss }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (resolvedComplaints && resolvedComplaints.length > 0) {
      setNotifications(resolvedComplaints);
    }
  }, [resolvedComplaints]);

  const dismissNotification = (complaintId) => {
    setNotifications(prev => prev.filter(n => n.id !== complaintId));
    onDismiss(complaintId);
  };

  const dismissAll = () => {
    const allIds = notifications.map(n => n.id);
    setNotifications([]);
    allIds.forEach(id => onDismiss(id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 z-50 max-w-md space-y-3">
      {notifications.length > 1 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissAll}
            className="text-xs text-secondary-500 hover:text-secondary-700"
          >
            Dismiss All ({notifications.length})
          </Button>
        </div>
      )}
      
      {notifications.map((complaint) => (
        <div
          key={complaint.id}
          className="glass-effect rounded-lg p-4 border border-accent-200 shadow-strong animate-slide-up"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✅</span>
                <h3 className="font-semibold text-secondary-900">Complaint Resolved!</h3>
                <Badge variant="success" className="text-xs">
                  RESOLVED
                </Badge>
              </div>
              
              <h4 className="font-medium text-secondary-800 mb-1">
                {complaint.title}
              </h4>
              
              <p className="text-sm text-secondary-600 mb-3">
                {complaint.description.length > 100 
                  ? `${complaint.description.substring(0, 100)}...` 
                  : complaint.description}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-secondary-500">
                <span>📍 {complaint.location}</span>
                <span>🏷️ {complaint.type}</span>
                <span>📅 Resolved: {new Date().toLocaleDateString()}</span>
              </div>
              
              {complaint.resolutionNote && (
                <div className="mt-3 p-2 bg-accent-50 border border-accent-200 rounded">
                  <p className="text-sm text-accent-700">
                    <strong>Resolution:</strong> {complaint.resolutionNote}
                  </p>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissNotification(complaint.id)}
              className="text-secondary-400 hover:text-secondary-600 p-1 h-auto min-h-0 ml-2"
            >
              ✕
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResolvedNotification;