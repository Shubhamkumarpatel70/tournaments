import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 neon-text-cyan">Terms of Service</h1>
        
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 sm:p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300">
              By accessing and using arenaofchampions, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">2. User Accounts</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>You are responsible for maintaining the confidentiality of your account and password.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>You agree to provide accurate and complete information when creating an account.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>You are responsible for all activities that occur under your account.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">3. Tournament Participation</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Entry fees are non-refundable once registration is confirmed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>We reserve the right to cancel or reschedule tournaments at any time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Participants must follow all tournament rules and regulations.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">4. Payment Terms</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>All payments must be made through approved payment methods.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Refunds are only available in cases of tournament cancellation by the platform.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Prize distribution is subject to verification and may take 7-14 business days.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">5. Prohibited Activities</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Cheating, hacking, or use of unauthorized software is strictly prohibited.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Harassment, abuse, or any form of unsportsmanlike conduct is not allowed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Attempting to manipulate tournament results is grounds for permanent ban.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-300">
              arenaofchampions shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform or participation in tournaments.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">7. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">Contact Information</h2>
            <p className="text-gray-300">
              For questions about these Terms of Service, please contact us through our Contact page.
            </p>
          </section>

          <p className="text-sm text-gray-400 mt-8">
            Last updated: {(() => {
              const date = new Date();
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = String(date.getFullYear()).slice(-2);
              return `${day}-${month}-${year}`;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;

