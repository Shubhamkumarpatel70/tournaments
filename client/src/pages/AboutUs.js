import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        {/* Our Story */}
        <section className="mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4 neon-text-cyan">About Tournament</h1>
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6 md:p-8 mt-6 sm:mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-lava-orange">Our Story</h2>
            <p className="text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
              Tournament was founded with a vision to create the most competitive and fair gaming platform 
              for battle royale enthusiasts. We recognized the need for a professional tournament system 
              that brings together players from all skill levels to compete, learn, and grow.
            </p>
            <p className="text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
              Our mission is to provide a transparent, secure, and exciting tournament experience where 
              every player has the opportunity to showcase their skills and win real prizes. We believe 
              in fair play, community building, and the spirit of competitive gaming.
            </p>
            
            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="text-center p-4 sm:p-6 bg-lava-black rounded-lg border border-lava-orange/20">
                <div className="text-3xl sm:text-4xl font-bold text-lava-orange mb-2">500+</div>
                <div className="text-gray-400 text-sm sm:text-base">Tournaments Hosted</div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-lava-black rounded-lg border border-lava-orange/20">
                <div className="text-3xl sm:text-4xl font-bold text-lava-orange mb-2">10,000+</div>
                <div className="text-gray-400 text-sm sm:text-base">Active Players</div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-lava-black rounded-lg border border-lava-orange/20">
                <div className="text-3xl sm:text-4xl font-bold text-lava-orange mb-2">₹50L+</div>
                <div className="text-gray-400 text-sm sm:text-base">Prize Money Distributed</div>
              </div>
            </div>
          </div>
        </section>

        {/* The Team */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 neon-text-cyan">The Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 text-center">
              <div className="w-32 h-32 bg-lava-gradient rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
                JD
              </div>
              <h3 className="text-2xl font-bold mb-2">John Doe</h3>
              <p className="text-lava-orange mb-2">Founder & CEO</p>
              <p className="text-gray-400 text-sm">
                Passionate gamer and entrepreneur with 10+ years in esports industry
              </p>
            </div>
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 text-center">
              <div className="w-32 h-32 bg-lava-gradient rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
                JS
              </div>
              <h3 className="text-2xl font-bold mb-2">Jane Smith</h3>
              <p className="text-lava-orange mb-2">Head of Operations</p>
              <p className="text-gray-400 text-sm">
                Expert in tournament organization and player management
              </p>
            </div>
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 text-center">
              <div className="w-32 h-32 bg-lava-gradient rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
                MK
              </div>
              <h3 className="text-2xl font-bold mb-2">Mike Kumar</h3>
              <p className="text-lava-orange mb-2">Community Manager</p>
              <p className="text-gray-400 text-sm">
                Building and nurturing our amazing gaming community
              </p>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section>
          <h2 className="text-4xl font-bold text-center mb-8 neon-text-cyan">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-2xl font-bold mb-2 text-lava-orange">Fair Play & Anti-Cheat</h3>
              <p className="text-gray-400">
                We use advanced anti-cheat systems and strict monitoring to ensure every match is fair 
                and competitive. Cheating is not tolerated.
              </p>
            </div>
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-bold mb-2 text-lava-orange">Community Focus</h3>
              <p className="text-gray-400">
                Our players are at the heart of everything we do. We listen, adapt, and grow together 
                as a community of passionate gamers.
              </p>
            </div>
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold mb-2 text-lava-orange">Professional Standards</h3>
              <p className="text-gray-400">
                Every tournament is organized with professional standards, clear rules, timely payouts, 
                and excellent support.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;

