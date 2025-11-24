import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const TeamMemberCard = ({ member }) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'TM';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 text-center">
      {member.image && !imageError ? (
        <img
          src={member.image}
          alt={member.name}
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-2 border-lava-orange/30"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-32 h-32 bg-lava-gradient rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
          {getInitials(member.name)}
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
      <p className="text-lava-orange mb-2">{member.position}</p>
      {member.description && (
        <p className="text-gray-400 text-sm mb-3">
          {member.description}
        </p>
      )}
      {member.socialLinks && member.socialLinks.length > 0 && (
        <div className="flex justify-center gap-3 mt-3">
          {member.socialLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lava-orange hover:text-fiery-yellow transition-colors text-sm"
              title={link.platform}
            >
              {link.platform}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const AboutUs = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const res = await api.get('/teams');
      // Sort by order in descending order (higher order first, then by createdAt descending)
      const sorted = (res.data || []).sort((a, b) => {
        if (b.order !== a.order) {
          return b.order - a.order; // Descending order
        }
        return new Date(b.createdAt) - new Date(a.createdAt); // Newer first if same order
      });
      setTeamMembers(sorted);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

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
                <div className="text-3xl sm:text-4xl font-bold text-lava-orange mb-2">50+</div>
                <div className="text-gray-400 text-sm sm:text-base">Tournaments Hosted</div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-lava-black rounded-lg border border-lava-orange/20">
                <div className="text-3xl sm:text-4xl font-bold text-lava-orange mb-2">100+</div>
                <div className="text-gray-400 text-sm sm:text-base">Active Players</div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-lava-black rounded-lg border border-lava-orange/20">
                <div className="text-3xl sm:text-4xl font-bold text-lava-orange mb-2">₹5000+</div>
                <div className="text-gray-400 text-sm sm:text-base">Prize Money Distributed</div>
              </div>
            </div>
          </div>
        </section>

        {/* The Team */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 neon-text-cyan">The Team</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading team members...</div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No team members to display</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {teamMembers.map((member) => (
                <TeamMemberCard key={member._id} member={member} />
              ))}
            </div>
          )}
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

