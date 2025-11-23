import React from 'react';

const Rules = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 neon-text-cyan">Rules & Regulations</h1>
        
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 sm:p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">General Rules</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>All participants must be 18 years or older to participate in tournaments.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Participants must register with accurate information. False information may result in disqualification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>All team members must be registered before the tournament registration deadline.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Entry fees are non-refundable once registration is confirmed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Participants must join matches on time. Late entries will not be allowed.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">Gameplay Rules</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>No cheating, hacking, or use of unauthorized third-party software is allowed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Players must use their registered game IDs. Using someone else's account is prohibited.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Team members cannot be changed after registration deadline.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Disconnection during matches must be reported immediately to tournament administrators.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Any form of unsportsmanlike conduct will result in immediate disqualification.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">Prize Distribution</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Prizes will be distributed within 7-14 business days after tournament completion.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Winners must provide valid payment details for prize distribution.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Prize amounts are subject to change based on final registration numbers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Taxes on prizes are the responsibility of the winner.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">Disqualification</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Cheating or use of unauthorized software will result in permanent ban.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Violation of any tournament rules will lead to disqualification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lava-orange font-bold">•</span>
                <span>Disqualified participants will not receive any refunds.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-lava-orange mb-4">Contact</h2>
            <p className="text-gray-300">
              For any questions or clarifications regarding these rules, please contact our support team through the Contact page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Rules;

