import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 neon-text-cyan">Privacy Policy</h1>
        
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 sm:p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">1. Information We Collect</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Personal information: name, email address, and contact details provided during registration.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Game information: game IDs, team details, and tournament participation data.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Payment information: processed securely through third-party payment providers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Usage data: information about how you interact with our platform.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">2. How We Use Your Information</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>To provide and maintain our tournament platform services.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>To process registrations and manage tournament participation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>To send important updates about tournaments and platform changes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>To improve our services and user experience.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">3. Data Protection</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>We implement appropriate security measures to protect your personal information.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Passwords are encrypted and stored securely.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>We use secure connections (HTTPS) for all data transmission.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">4. Information Sharing</h2>
            <p className="text-gray-300 mb-3">
              We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>With payment processors to complete transactions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>When required by law or to protect our rights and safety.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>With your explicit consent.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">5. Your Rights</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>You have the right to access your personal information.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>You can update or correct your information at any time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>You may request deletion of your account and associated data.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>You can opt-out of marketing communications at any time.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-300">
              We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">7. Children's Privacy</h2>
            <p className="text-gray-300">
              Our platform is not intended for users under the age of 18. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">8. Changes to Privacy Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">Contact Us</h2>
            <p className="text-gray-300 mb-2">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="text-gray-300">
              Email: <a href="mailto:official.arenaofchampions@gmail.com" className="text-lava-orange hover:text-fiery-yellow transition-colors">official.arenaofchampions@gmail.com</a>
            </p>
            <p className="text-gray-300 mt-2">
              Or visit our <a href="/contact" className="text-lava-orange hover:text-fiery-yellow transition-colors">Contact page</a>.
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

export default Privacy;

