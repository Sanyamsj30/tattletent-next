import React from "react";

const LearnMorePage = () => {
  return (
    <div className="min-h-screen bg-[#FCF5EE] font-sans">
      {/* Header / Hero Section */}
      <header className="bg-orange-50 py-20 px-6 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-orange-700 mb-4">Welcome to TattleTent</h1>
        <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto">
          We are committed to building safer, cleaner, and better communities. Explore how we work and how you can be a part of it.
        </p>
        <div className="mt-8">
          <a href="#how-we-work" className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition font-semibold">
            Learn How We Work
          </a>
        </div>
      </header>

      {/* About Us Section */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-4xl font-bold text-orange-700 mb-6">Who We Are</h2>
        <p className="text-gray-700 max-w-4xl mx-auto text-lg leading-relaxed">
          YUS is a citizen-first platform that connects community needs with proactive staff members. We help identify issues, resolve complaints, and ensure that every community member’s voice is heard. Our team is dedicated, trained, and ready to make a difference in your neighborhood.
        </p>
      </section>

      {/* How We Work Section */}
      <section id="how-we-work" className="py-20 px-6 bg-[#FFF5E5]">
        <h2 className="text-4xl font-bold text-orange-700 text-center mb-12">How We Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:scale-105 transform transition">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-orange-600 mb-2">Report Complaints</h3>
            <p className="text-gray-700">
              Citizens can easily report issues in their area, ranging from water leaks to garbage management and electrical problems.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:scale-105 transform transition">
            <div className="text-6xl mb-4">🛠️</div>
            <h3 className="text-2xl font-bold text-orange-600 mb-2">Assign & Resolve</h3>
            <p className="text-gray-700">
              Admins assign complaints to staff who take immediate action. Status updates and solutions are tracked for transparency.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:scale-105 transform transition">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-orange-600 mb-2">Verified Completion</h3>
            <p className="text-gray-700">
              Once resolved, complaints are verified and citizens are notified. Performance and feedback are recorded to improve services.
            </p>
          </div>
        </div>
      </section>

      {/* Our Services / Features */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-4xl font-bold text-orange-700 mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[
            { icon: "🧹", title: "Garbage Management", description: "Timely collection and disposal of community waste." },
            { icon: "💡", title: "Electrical Maintenance", description: "Fixing streetlights, electrical hazards, and outages." },
            { icon: "🚰", title: "Water & Plumbing", description: "Immediate response to leaks, bursts, and water supply issues." },
            { icon: "🚧", title: "Roads & Pathways", description: "Repairing roads, tiles, and public infrastructure." },
          ].map((service, idx) => (
            <div key={idx} className="bg-[#FFF5E5] rounded-2xl shadow-lg p-6 hover:scale-105 transform transition">
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-orange-600 mb-2">{service.title}</h3>
              <p className="text-gray-700 text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-orange-50 text-center">
        <h2 className="text-3xl font-bold text-orange-700 mb-4">Join Us in Building Better Communities</h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">Become a citizen reporter or staff member and help improve your neighborhood.</p>
        <a href="/" className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition font-semibold">Back To Home</a>
      </section>
    </div>
  );
};

export default LearnMorePage;
