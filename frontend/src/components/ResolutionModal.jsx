import React, { useState } from 'react';
import { Button } from './ui/button';
import { TextArea } from './ui/input';
import { Badge } from './ui/badge';

const ResolutionModal = ({ complaint, isOpen, onClose, onResolve }) => {
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNote.trim()) return;

    setIsSubmitting(true);
    
    // Simulate brief processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onResolve(complaint.id, resolutionNote.trim());
    setResolutionNote('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen || !complaint) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-secondary-900 mb-2">
                Resolve Complaint
              </h2>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="warning">
                  {complaint.status}
                </Badge>
                <Badge variant={complaint.priority === 'high' ? 'danger' : complaint.priority === 'medium' ? 'warning' : 'success'}>
                  {complaint.priority.toUpperCase()} PRIORITY
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Complaint Details */}
          <div className="bg-secondary-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-secondary-900 mb-2">
              {complaint.title}
            </h3>
            <p className="text-secondary-700 mb-3">
              {complaint.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-secondary-500">
              <span>📍 {complaint.location}</span>
              <span>🏷️ {complaint.type}</span>
              <span>📅 {complaint.formattedDate}</span>
            </div>
          </div>

          {/* Resolution Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Resolution Details *
              </label>
              <TextArea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Please provide details about how this complaint was resolved. This information will be shared with the complainant."
                rows={4}
                required
                className="w-full"
              />
              <p className="text-xs text-secondary-500 mt-1">
                This note will be visible to the citizen who submitted the complaint.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={!resolutionNote.trim() || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Resolving...
                  </div>
                ) : (
                  'Mark as Resolved'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResolutionModal;