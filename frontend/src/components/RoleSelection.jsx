import React from 'react';
import { Button } from './ui/button';

const RoleSelection = ({ onRoleSelect }) => {
  const roles = [
    {
      id: 'citizen',
      title: 'Citizen Portal',
      description: 'Submit and track your grievances and complaints',
      icon: '👤',
      features: ['Submit complaints', 'Track status', 'View history', 'Get updates'],
      gradient: 'from-sky-600 to-sky-800',
      hoverGradient: 'hover:from-blue-700 hover:to-blue-900',
    },
    {
      id: 'staff',
      title: 'Staff Dashboard',
      description: 'Manage and resolve citizen complaints efficiently',
      icon: '👥',
      features: ['Manage complaints', 'Update status', 'Assign tasks', 'Generate reports'],
      gradient: 'from-secondary-600 to-secondary-800',
      hoverGradient: 'hover:from-secondary-700 hover:to-secondary-900',
    },
    {
      id: 'admin',
      title: 'Admin Panel',
      description: 'Comprehensive system administration and analytics',
      icon: '⚙️',
      features: ['System analytics', 'User management', 'Export data', 'Configure settings'],
      gradient: 'from-gold-600 to-gold-800',
      hoverGradient: 'hover:from-gold-700 hover:to-gold-900',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center p-4">
      
      <div className="max-w-6xl w-full">
        {/* Header */}
        <header className="px-8 py-5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center rounded-md bg-primary/10">
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M3 12 L12 4 L21 12 L3 12 Z" fill="#5b6bf7"/>
                                <rect x="6" y="12" width="12" height="7" rx="1" fill="#5b6bf7"/>
                              </svg>
                            </div>
                            <h1 className="text-xl font-extrabold tracking-tight text-primary">TattleTent</h1>
                          </div>
                  
                          <nav className="flex ">
                  
                            {/* Home Button */}
                            <Button
                              variant="primary"
                              className="rounded-lg text-sm font-medium bg-primary text-blue-700 hover:bg-blue-500"
                              onClick={() => (window.location.href = "/")}
                            >
                              Home
                            </Button>
                          </nav>
                        </header>
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="font-display text-6xl md:text-7xl font-bold text-gradient mb-6 text-shadow-soft">
            Grievance Management
          </h1>
          <p className="text-xl md:text-2xl text-secondary-600 font-medium max-w-3xl mx-auto leading-relaxed">
            A comprehensive platform for efficient complaint management and resolution
          </p>
          <div className="w-32 h-1 bg-gradient-primary mx-auto mt-8 rounded-full"></div>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {roles.map((role, index) => (
            <div
              key={role.id}
              className="group relative animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="glass-effect rounded-2xl p-8 text-center hover-lift cursor-pointer transition-all duration-500 group-hover:glass-dark">
                {/* Icon */}
                <div className="text-6xl mb-6 group-hover:animate-float">
                  {role.icon}
                </div>

                {/* Title */}
                <h3 className="font-display text-2xl font-bold text-secondary-900 mb-4 group-hover:text-white transition-colors duration-300">
                  {role.title}
                </h3>

                {/* Description */}
                <p className="text-secondary-600 mb-6 group-hover:text-secondary-200 transition-colors duration-300">
                  {role.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-8 text-sm">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center justify-center text-secondary-500 group-hover:text-secondary-300 transition-colors duration-300">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 group-hover:bg-primary-300"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Button
                  onClick={() => onRoleSelect(role.id)}
                  variant="primary"
                  size="lg"
                  className="w-full group-hover:bg-white group-hover:text-secondary-900 group-hover:border-white transition-all duration-300"
                >
                  Continue as {role.title.split(' ')[0]}
                </Button>

                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-90 rounded-2xl transition-opacity duration-500 -z-10`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="glass-effect rounded-xl p-6">
              <h3 className="font-semibold text-lg text-secondary-800 mb-3">
                🔒 Secure & Confidential
              </h3>
              <p className="text-secondary-600 text-sm leading-relaxed">
                Your data is protected with enterprise-grade security. All communications are encrypted, 
                and your privacy is our top priority.
              </p>
            </div>
            <div className="glass-effect rounded-xl p-6">
              <h3 className="font-semibold text-lg text-secondary-800 mb-3">
                💾 Auto-Save Enabled
              </h3>
              <p className="text-secondary-600 text-sm leading-relaxed">
                Your progress is automatically saved. You can close the browser and return later - 
                your role and complaint data will be restored.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-secondary-400 text-sm">
          <p>&copy; 2025 Grievance Management System. All rights reserved.</p>
        </div>
      </div>
   </div>
  );
};

export default RoleSelection;