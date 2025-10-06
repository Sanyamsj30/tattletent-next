import React, { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input, TextArea } from "./components/ui/input";
import { Select, SelectItem } from "./components/ui/select";
import { Badge } from "./components/ui/badge";
import RoleSelection from "./components/RoleSelection";
//import CanvasBackground from "./components/CanvasBackground";
import WelcomeNotification from "./components/WelcomeNotification";
import PersistenceIndicator from "./components/PersistenceIndicator";
import ResolvedNotification from "./components/ResolvedNotification";
import ResolutionModal from "./components/ResolutionModal";

// Professional complaint categories
const complaintTypes = [
  "Infrastructure & Roads",
  "Water & Sanitation",
  "Waste Management",
  "Public Safety",
  "Transportation",
  "Healthcare Services",
  "Education",
  "Other"
];

// LocalStorage keys
const STORAGE_KEYS = {
  CURRENT_VIEW: 'grievance_app_current_view',
  USER_ROLE: 'grievance_app_user_role',
  COMPLAINTS: 'grievance_app_complaints',
  FORM_DATA: 'grievance_app_form_data',
  RESOLVED_NOTIFICATIONS: 'grievance_app_resolved_notifications'
};

// Helper functions for localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export default function GrievanceApp() {
  // Initialize state with localStorage data or defaults
  const [currentView, setCurrentView] = useState(() =>
    loadFromStorage(STORAGE_KEYS.CURRENT_VIEW, "roleSelection")
  );
  const [role, setRole] = useState(() =>
    loadFromStorage(STORAGE_KEYS.USER_ROLE, null)
  );
  const [complaints, setComplaints] = useState(() =>
    loadFromStorage(STORAGE_KEYS.COMPLAINTS, [])
  );
  const [form, setForm] = useState(() =>
    loadFromStorage(STORAGE_KEYS.FORM_DATA, { title: "", description: "", type: "", location: "", priority: "medium", photo: null })
  );
  const [showPersistenceIndicator, setShowPersistenceIndicator] = useState(false);
  const [resolvedNotifications, setResolvedNotifications] = useState(() =>
    loadFromStorage(STORAGE_KEYS.RESOLVED_NOTIFICATIONS, [])
  );
  const [resolutionModal, setResolutionModal] = useState({ isOpen: false, complaint: null });

  // Persist state changes to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_VIEW, currentView);
  }, [currentView]);

  useEffect(() => {
    if (role !== null) {
      saveToStorage(STORAGE_KEYS.USER_ROLE, role);
      setShowPersistenceIndicator(true);
    }
  }, [role]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaints);
    if (complaints.length > 0) {
      setShowPersistenceIndicator(true);
    }
  }, [complaints]);

  useEffect(() => {
    // Only show indicator for meaningful form changes (not empty form)
    if (form.title || form.description || form.type || form.location) {
      saveToStorage(STORAGE_KEYS.FORM_DATA, form);
      setShowPersistenceIndicator(true);
    } else {
      saveToStorage(STORAGE_KEYS.FORM_DATA, form);
    }
  }, [form]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RESOLVED_NOTIFICATIONS, resolvedNotifications);
  }, [resolvedNotifications]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setCurrentView("dashboard");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Required fields check
    if (!form.title || !form.description || !form.type || !form.location) return;

    const newComplaint = {
      id: Date.now(),
      ...form, // includes photo if selected
      status: "OPEN",
      createdAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString(),
      assignee: null,
    };

    // Add new complaint to the list
    setComplaints([newComplaint, ...complaints]);

    // Reset form, including photo
    const defaultForm = { title: "", description: "", type: "", location: "", photo: null };
    setForm(defaultForm);
  };


  const handleLogout = () => {
    // Clear all stored data
    /* Object.values(STORAGE_KEYS).forEach(key => {
       localStorage.removeItem(key);
     });*/

    // Clear session storage too
    //sessionStorage.clear();

    // Reset state to defaults
    setCurrentView("roleSelection");
    setRole(null);
    /* setComplaints([]);
     setForm({ title: "", description: "", type: "", location: "", priority: "medium" });
     setResolvedNotifications([]);
     setResolutionModal({ isOpen: false, complaint: null });*/
  };

  const handleSwitchRole = () => {
    setCurrentView("roleSelection");
    setRole(null);
    // Keep complaints and form data, just switch role
  };

  const updateStatus = (id, newStatus) => {
    if (newStatus === "RESOLVED") {
      // Open resolution modal instead of directly updating
      const complaint = complaints.find(c => c.id === id);
      if (complaint) {
        setResolutionModal({ isOpen: true, complaint });
      }
    } else {
      setComplaints(complaints.map(c =>
        c.id === id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c
      ));
    }
  };

  const handleResolveComplaint = (id, resolutionNote) => {
    const complaint = complaints.find(c => c.id === id);
    if (complaint) {
      // Update complaint status
      const resolvedComplaint = {
        ...complaint,
        status: "RESOLVED",
        resolutionNote,
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Update complaints list
      setComplaints(complaints.map(c =>
        c.id === id ? resolvedComplaint : c
      ));

      // Add to resolved notifications for citizen
      setResolvedNotifications(prev => {
        const exists = prev.some(n => n.id === id);
        if (!exists) {
          return [resolvedComplaint, ...prev];
        }
        return prev;
      });

      setShowPersistenceIndicator(true);
    }
  };

  const dismissResolvedNotification = (complaintId) => {
    setResolvedNotifications(prev => prev.filter(n => n.id !== complaintId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN": return "danger";
      case "IN PROGRESS": return "warning";
      case "RESOLVED": return "success";
      default: return "default";
    }
  };





  // Check if user is returning (has existing data)
  const isReturningUser = role && currentView === "roleSelection";

  if (currentView === "roleSelection" && !isReturningUser) {
    return (
      <>

        <RoleSelection onRoleSelect={handleRoleSelect} />
      </>
    );
  }

  // If user has a saved role but is on role selection, redirect them
  if (isReturningUser) {
    setCurrentView("dashboard");
  }


  return (
    <>

      <WelcomeNotification role={role} complaintsCount={complaints.length} />
      <PersistenceIndicator isActive={showPersistenceIndicator} />
      {role === "citizen" && (
        <ResolvedNotification
          resolvedComplaints={resolvedNotifications}
          onDismiss={dismissResolvedNotification}
        />
      )}
      <ResolutionModal
        complaint={resolutionModal.complaint}
        isOpen={resolutionModal.isOpen}
        onClose={() => setResolutionModal({ isOpen: false, complaint: null })}
        onResolve={handleResolveComplaint}
      />
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-secondary-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GM</span>
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-secondary-900">
                    Grievance Management
                  </h1>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-secondary-500 capitalize">{role} Portal</p>
                    {complaints.length > 0 && (
                      <span className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                        {complaints.length} saved complaint{complaints.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Badge variant="primary" className="capitalize">
                  {role}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSwitchRole}
                    title="Switch to a different role"
                  >
                    Switch Role
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Clear all data and logout"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Citizen Portal */}
          {role === "citizen" && (
            <div className="space-y-8">
              {/* Submit Complaint Form */}
              <Card variant="elevated" className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-center font-display text-2xl text-secondary-900">
                    Submit New Complaint
                  </CardTitle>
                  <p className="text-center text-black-600 mt-2">
                    Provide detailed information about your concern for faster resolution
                  </p>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    encType="multipart/form-data"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Complaint Title *
                        </label>
                        <Input
                          placeholder="Brief description of the issue"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          required
                        />
                        <div className="grid md:grid-cols-2 gap-10">
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                              Location *
                            </label>
                            <Input
                              placeholder="Where is this issue located?"
                              value={form.location}
                              onChange={(e) => setForm({ ...form, location: e.target.value })}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                              Upload Photo (optional)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) setForm({ ...form, photo: file });
                              }}
                              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />

                            {form.photo && (
                              <p className="text-xs text-secondary-600 mt-1">
                                Selected file: {form.photo.name}
                              </p>
                            )}
                          </div>
                        </div>
                        </div>
                        </div>


                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                              Category *
                            </label>
                            <Select
                              value={form.type}
                              onValueChange={(val) => setForm({ ...form, type: val })}
                              placeholder="Select complaint category"
                            >
                              {complaintTypes.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </Select>
                          </div>

                        </div>

                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Detailed Description *
                          </label>
                          <TextArea
                            placeholder="Please provide detailed information about the issue, including any relevant context or urgency..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={4}
                            required
                          />
                        </div>

                        <div className="flex justify-center pt-4">
                          <Button type="submit" variant="primary" size="lg" className="px-12">
                            Submit Complaint
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Complaints List */}
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="font-display text-3xl font-bold text-secondary-900 mb-2">
                        My Complaints
                      </h2>
                      <p className="text-secondary-600">Track the progress of your submitted complaints</p>
                    </div>

                    {complaints.length === 0 ? (
                      <Card className="text-center py-16">
                        <CardContent>
                          <div className="text-6xl mb-6 opacity-50">📋</div>
                          <h3 className="text-xl font-semibold text-secondary-700 mb-2">No complaints submitted</h3>
                          <p className="text-secondary-500">Your submitted complaints will appear here for tracking.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-8">
                        {/* Active Complaints */}
                        {complaints.filter(c => c.status !== 'RESOLVED').length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Active Complaints</h3>
                            <div className="grid gap-6">
                              {complaints.filter(c => c.status !== 'RESOLVED').map((complaint) => (
                                <Card key={complaint.id} variant="elevated">
                                  <CardContent>
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                          <h3 className="font-semibold text-lg text-secondary-900">
                                            {complaint.title}
                                          </h3>
                                          <div className="flex gap-2">
                                            <Badge variant={getPriorityColor(complaint.priority)}>
                                              {complaint.priority.toUpperCase()}
                                            </Badge>
                                            <Badge variant={getStatusColor(complaint.status)}>
                                              {complaint.status}
                                            </Badge>
                                          </div>
                                        </div>
                                        <p className="text-secondary-600 mb-4">{complaint.description}</p>
                                        <div className="flex flex-wrap gap-4 text-sm text-secondary-500">
                                          <span className="flex items-center gap-1">
                                            <span className="w-4 h-4">📅</span>
                                            {complaint.formattedDate}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <span className="w-4 h-4">📍</span>
                                            {complaint.location}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <span className="w-4 h-4">🏷️</span>
                                            {complaint.type}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resolved Complaints */}
                        {complaints.filter(c => c.status === 'RESOLVED').length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                              ✅ Resolved Complaints
                              <Badge variant="success">{complaints.filter(c => c.status === 'RESOLVED').length}</Badge>
                            </h3>
                            <div className="grid gap-6">
                              {complaints.filter(c => c.status === 'RESOLVED').map((complaint) => (
                                <Card key={complaint.id} variant="elevated" className="border-accent-200">
                                  <CardContent>
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                          <h3 className="font-semibold text-lg text-secondary-900">
                                            {complaint.title}
                                          </h3>
                                          <div className="flex gap-2">

                                            <Badge variant="success">
                                              ✅ RESOLVED
                                            </Badge>
                                          </div>
                                        </div>
                                        <p className="text-secondary-600 mb-4">{complaint.description}</p>

                                        {/* Resolution Note */}
                                        {complaint.resolutionNote && (
                                          <div className="bg-accent-50 border border-accent-200 rounded-lg p-3 mb-4">
                                            <h4 className="font-medium text-accent-800 mb-1">Resolution Details:</h4>
                                            <p className="text-sm text-accent-700">{complaint.resolutionNote}</p>
                                          </div>
                                        )}

                                        <div className="flex flex-wrap gap-4 text-sm text-secondary-500">
                                          <span className="flex items-center gap-1">
                                            <span className="w-4 h-4">📅</span>
                                            Submitted: {complaint.formattedDate}
                                          </span>
                                          {complaint.resolvedAt && (
                                            <span className="flex items-center gap-1">
                                              <span className="w-4 h-4">✅</span>
                                              Resolved: {new Date(complaint.resolvedAt).toLocaleDateString()}
                                            </span>
                                          )}
                                          <span className="flex items-center gap-1">
                                            <span className="w-4 h-4">📍</span>
                                            {complaint.location}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <span className="w-4 h-4">🏷️</span>
                                            {complaint.type}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
          )}

                {/* Staff Dashboard */}
                {role === "staff" && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <h2 className="font-display text-3xl font-bold text-secondary-900 mb-2">
                        Staff Dashboard
                      </h2>
                      <p className="text-secondary-600">Manage and update complaint statuses efficiently</p>
                      <div className="flex justify-center gap-4 mt-4 text-sm">
                        <span className="text-secondary-600">
                          Active: <span className="font-semibold text-primary-600">{complaints.filter(c => c.status !== 'RESOLVED').length}</span>
                        </span>
                        <span className="text-secondary-600">
                          Resolved: <span className="font-semibold text-accent-600">{complaints.filter(c => c.status === 'RESOLVED').length}</span>
                        </span>
                      </div>
                    </div>

                    {complaints.filter(c => c.status !== 'RESOLVED').length === 0 ? (
                      <Card className="text-center py-16">
                        <CardContent>
                          <div className="text-6xl mb-6 opacity-50">📋</div>
                          <h3 className="text-xl font-semibold text-secondary-700 mb-2">No active complaints</h3>
                          <p className="text-secondary-500">
                            {complaints.length > 0
                              ? "All complaints have been resolved! Great work."
                              : "New complaints from citizens will appear here for management."}
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        {complaints.filter(c => c.status !== 'RESOLVED').map((complaint) => (
                          <Card key={complaint.id} variant="elevated">
                            <CardContent>
                              <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-4">
                                    <h3 className="font-semibold text-xl text-secondary-900">
                                      {complaint.title}
                                    </h3>
                                    <div className="flex gap-2">

                                      <Badge variant={getStatusColor(complaint.status)}>
                                        {complaint.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  <p className="text-secondary-600 mb-4">{complaint.description}</p>
                                  <div className="flex flex-wrap gap-4 text-sm text-secondary-500">
                                    <span>📅 {complaint.formattedDate}</span>
                                    <span>📍 {complaint.location}</span>
                                    <span>🏷️ {complaint.type}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 lg:w-48">
                                  <p className="text-sm font-medium text-secondary-700 mb-2">Update Status:</p>
                                  {["OPEN", "IN PROGRESS", "RESOLVED"].map((status) => (
                                    <Button
                                      key={status}
                                      size="sm"
                                      variant={complaint.status === status ? "primary" : "outline"}
                                      onClick={() => updateStatus(complaint.id, status)}
                                      className="justify-start"
                                    >
                                      {status}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Dashboard */}
                {role === "admin" && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <h2 className="font-display text-3xl font-bold text-secondary-900 mb-2">
                        Admin Dashboard
                      </h2>
                      <p className="text-secondary-600">System analytics and data management</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                      <Card variant="glass">
                        <CardContent className="text-center py-6">
                          <div className="text-3xl font-bold text-red-600 mb-2">
                            {complaints.filter(c => c.status === 'OPEN').length}
                          </div>
                          <p className="text-sm text-secondary-600">Open Complaints</p>
                        </CardContent>
                      </Card>
                      <Card variant="glass">
                        <CardContent className="text-center py-6">
                          <div className="text-3xl font-bold text-gold-600 mb-2">
                            {complaints.filter(c => c.status === 'IN PROGRESS').length}
                          </div>
                          <p className="text-sm text-secondary-600">In Progress</p>
                        </CardContent>
                      </Card>
                      <Card variant="glass">
                        <CardContent className="text-center py-6">
                          <div className="text-3xl font-bold text-accent-600 mb-2">
                            {complaints.filter(c => c.status === 'RESOLVED').length}
                          </div>
                          <p className="text-sm text-secondary-600">Resolved</p>
                        </CardContent>
                      </Card>
                      <Card variant="glass">
                        <CardContent className="text-center py-6">
                          <div className="text-3xl font-bold text-primary-600 mb-2">
                            {complaints.length}
                          </div>
                          <p className="text-sm text-secondary-600">Total Complaints</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Action Cards */}
                    <div className="grid md:grid-cols-2 gap-8">
                      <Card variant="elevated">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">📊</span>
                            Analytics & Reports
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-secondary-600">Generate comprehensive reports and analytics</p>
                          <div className="space-y-3">
                            <Button variant="primary" className="w-full">
                              Generate Performance Report
                            </Button>
                            <Button variant="secondary" className="w-full">
                              View Trend Analysis
                            </Button>
                            <Button variant="outline" className="w-full">
                              Custom Report Builder
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card variant="elevated">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">💾</span>
                            Data Export
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-secondary-600">Export complaint data in multiple formats</p>
                          <div className="space-y-3">
                            <Button variant="accent" className="w-full">
                              Export as CSV
                            </Button>
                            <Button variant="gold" className="w-full">
                              Export as PDF Report
                            </Button>
                            <Button variant="outline" className="w-full">
                              Export as Excel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </main>
            </div>
    </>
        );
}
