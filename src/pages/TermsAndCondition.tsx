import React from "react";

const TermsAndCondition = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen text-gray-800 font-sans">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Main Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-4 tracking-tight">
            Varn Digihealth Provider Terms & Conditions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to Varn Digihealth. Please carefully review these terms, as
            they govern your use of our services.
          </p>
        </header>

        {/* Main content section with updated styling */}
        <section className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl border border-gray-200">
          {/* Section 1: Parties, Acceptance & Definitions */}
          <article className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-100">
              1. Parties, Acceptance & Definitions
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <span className="font-bold text-blue-800">Parties.</span> This
                Agreement is between Varn LLC, a Delaware limited liability
                company doing business as Varn Digihealth, with its principal
                business address at 16192 Coastal Hwy, Lewes, DE 19958 (“Varn
                Digihealth,” “we,” “us,” or “our”), and the healthcare provider
                or practice accepting these terms (“Provider,” “you,” or
                “your”).
              </p>
              <p>
                <span className="font-bold text-blue-800">Acceptance.</span> By
                clicking “I Agree,” creating an account, or accessing or using
                the Varn Digihealth electronic health record (EHR) system and
                related services (collectively, the “Services”), Provider
                confirms that they have read, understood and agreed to be bound
                by this Agreement and that they have authority to do so on
                behalf of themselves and any organization they represent. If
                Provider does not agree to these terms, Provider must not access
                or use the Services.
              </p>
              <p>
                <span className="font-bold text-blue-800">
                  Authorized User.
                </span>{" "}
                A natural person designated by Provider under Provider’s
                supervision who is given access credentials to use the Services
                (e.g., physicians, nurse practitioners, physician assistants, or
                administrative staff). Provider is solely responsible for
                designating Authorized Users and managing their access levels.
              </p>
              <p>
                <span className="font-bold text-blue-800">
                  Protected Health Information (PHI).
                </span>{" "}
                Individually identifiable health information as defined by the
                Health Insurance Portability and Accountability Act of 1996
                (HIPAA) and its regulations.
              </p>
            </div>
          </article>

          <hr className="my-8 border-gray-200" />

          {/* Section 2: Grant of Rights & Restrictions */}
          <article className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-100">
              2. Grant of Rights & Restrictions
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <span className="font-bold text-blue-800">License.</span> Varn
                Digihealth grants Provider a limited, revocable, non‑exclusive,
                non‑transferable, non‑sublicensable license to access and use
                the Services solely for Provider’s legitimate clinical, billing
                and administrative purposes during the term of this Agreement.
                Provider gains no ownership interest in the software or
                services.
              </p>
              <p>
                <span className="font-bold text-blue-800">Restrictions.</span>{" "}
                Provider shall not:
              </p>
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li>
                  Sell, rent, sublicense, assign, distribute or otherwise
                  transfer any part of the Services or information derived from
                  them.
                </li>
                <li>
                  Reverse engineer, decompile, disassemble, translate, or
                  attempt to discover the source code or algorithms, or use any
                  part of the Services to build a competing product or service.
                </li>
                <li>
                  Circumvent or disable any security or authentication
                  mechanism, or use bots, scrapers or other automated tools to
                  access the Services.
                </li>
                <li>
                  Provide or permit access to the Services by anyone other than
                  Authorized Users.
                </li>
              </ul>
            </div>
          </article>

          <hr className="my-8 border-gray-200" />

          {/* Section 3: Provider Responsibilities */}
          <article className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-100">
              3. Provider Responsibilities
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <span className="font-bold text-blue-800">
                  Data Accuracy & Backup.
                </span>{" "}
                Provider is responsible for entering and maintaining accurate,
                complete and current data in the Services and for backing up and
                preserving its records.
              </p>
              <p>
                <span className="font-bold text-blue-800">
                  Authorized Users.
                </span>
              </p>
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li>
                  Provider must designate and manage Authorized Users and ensure
                  each has appropriate access levels. Provider warrants that
                  each Authorized User is legally permitted to access PHI and
                  will comply with applicable laws and this Agreement.
                </li>
                <li>
                  Each Authorized User must use unique credentials and may not
                  share or reassign them.
                </li>
                <li>
                  Provider is liable for all acts and omissions of Authorized
                  Users and must promptly revoke access when an Authorized User
                  leaves Provider’s workforce or no longer requires access.
                </li>
              </ul>
              <p>
                <span className="font-bold text-blue-800">
                  Security & HIPAA Compliance.
                </span>{" "}
                Provider will implement administrative, physical and technical
                safeguards to protect information accessed through the Services,
                consistent with federal, state and local requirements, including
                HIPAA’s Privacy and Security Rules. Provider will:
              </p>
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li>
                  Maintain security over all credentials and devices used to
                  access the Services.
                </li>
                <li>
                  Immediately notify Varn Digihealth of any suspected or actual
                  security incident or unauthorized access and cooperate in
                  investigating and mitigating such incidents.
                </li>
                <li>
                  Ensure compliance with all laws governing privacy, data
                  security, telehealth, and communications.
                </li>
              </ul>
              <p>
                <span className="font-bold text-blue-800">
                  Regulatory & Professional Compliance.
                </span>{" "}
                Provider is solely responsible for ensuring its use of the
                Services (including communications with patients or other
                providers) complies with all applicable laws and professional
                standards.
              </p>
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li>
                  Varn Digihealth does not warrant that use of the Services will
                  ensure compliance.
                </li>
              </ul>
            </div>
          </article>

          <hr className="my-8 border-gray-200" />

          {/* Section 4: Confidentiality & Data Use */}
          <article className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-100">
              4. Confidentiality & Data Use
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <span className="font-bold text-blue-800">
                  Confidential Information.
                </span>{" "}
                Each party may receive non‑public business, technical or
                financial information of the other party (“Confidential
                Information”). Each party will protect the other’s Confidential
                Information with at least reasonable care and use it only for
                purposes of performing this Agreement.
              </p>
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li>
                  Confidential Information does not include information that is
                  publicly available or independently developed without
                  reference to the other party’s information.
                </li>
              </ul>
              <p>
                <span className="font-bold text-blue-800">
                  Protected Health Information.
                </span>
              </p>
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li>
                  Varn Digihealth will not use or disclose Provider’s PHI except
                  as permitted by this Agreement or required by law and will
                  implement safeguards required by HIPAA.
                </li>
                <li>
                  Varn Digihealth will promptly report unauthorized uses or
                  disclosures of PHI and will require subcontractors handling
                  PHI to agree to similar restrictions.
                </li>
                <li>
                  Upon termination, Varn Digihealth will make Provider’s PHI
                  available and will return or securely destroy PHI where
                  feasible, continuing to protect any retained PHI if
                  destruction is infeasible.
                </li>
              </ul>
              <p>
                <span className="font-bold text-blue-800">
                  De‑Identified & Aggregate Data.
                </span>{" "}
                Varn Digihealth may create de‑identified or aggregate data from
                Provider’s information for analytics, research and improvement
                of the Services, provided that such data does not identify
                Provider or any individual patient.
              </p>
            </div>
          </article>

          <hr className="my-8 border-gray-200" />

          {/* Section 5: Prohibited Conduct */}
          <article className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-100">
              5. Prohibited Conduct
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>Provider and its Authorized Users agree not to:</p>
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li>
                  Use the Services for time‑sharing or service bureau purposes
                  or to process data for third parties.
                </li>
                <li>
                  Attempt to gain unauthorized access to any portion of the
                  Services, other users’ data, or systems connected to the
                  Services.
                </li>
                <li>
                  Transmit, upload or store any viruses or malicious code on the
                  Services.
                </li>
                <li>
                  Use the Services in a manner that infringes intellectual
                  property or privacy rights, or violates any applicable law.
                </li>
              </ul>
            </div>
          </article>

          <hr className="my-8 border-gray-200" />

          {/* Section 6: Disclaimers & Professional Responsibility */}
          <article className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-100">
              6. Disclaimers & Professional Responsibility
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <span className="font-bold text-blue-800">
                  No Medical Advice.
                </span>{" "}
                The Services are tools to support Provider’s practice. Varn
                Digihealth does not provide medical, legal or professional
                advice or recommendations, and is not responsible for the
                completeness, accuracy or utility of any information in the
                Services.
              </p>
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li>
                  Provider is solely responsible for clinical and professional
                  decisions.
                </li>
              </ul>
              <p>
                <span className="font-bold text-blue-800">
                  Warranty Disclaimer.
                </span>{" "}
                The Services, documentation and any data are provided “as‑is”
                and “as‑available,” with all faults. Varn Digihealth disclaims
                all warranties, express or implied, including implied warranties
                of merchantability, fitness for a particular purpose and
                non‑infringement.
              </p>
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li>
                  Varn Digihealth does not guarantee that the Services will be
                  uninterrupted, error‑free or secure.
                </li>
              </ul>
              <p>
                <span className="font-bold text-blue-800">
                  Limitation of Liability.
                </span>{" "}
                To the fullest extent permitted by law, Varn Digihealth shall
                not be liable for indirect, incidental, special, consequential
                or punitive damages arising out of or relating to this Agreement
                or the Services, even if advised of the possibility of such
                damages. Varn Digihealth’s total liability for any direct
                damages shall not exceed the fees paid by Provider to Varn
                Digihealth in the twelve (12) months preceding the claim. Varn
                Digihealth is not responsible for acts or omissions of third
                parties or for internet service interruptions.
              </p>
            </div>
          </article>

          <hr className="my-8 border-gray-200" />

          {/* Section 7: AI & Machine-Learning Features */}
          <article className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-100">
              7. AI & Machine‑Learning Features
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <span className="font-bold text-blue-800">
                  AI Functionality.
                </span>{" "}
                Certain features of the Services may employ artificial
                intelligence (“AI”) or machine‑learning algorithms to analyze
                data and provide insights, predictive analytics, suggestions or
                decision‑support. These AI features are optional and intended
                solely to assist Provider in clinical or administrative
                workflows.
              </p>
              <p>
                <span className="font-bold text-blue-800">
                  Informational Use Only.
                </span>{" "}
                Outputs generated by AI features are provided for informational
                purposes and do not constitute medical advice. Provider
                acknowledges that AI‑generated suggestions may be incomplete or
                inaccurate, and Varn Digihealth does not warrant the accuracy or
                reliability of such outputs.
              </p>
              <p>
                <span className="font-bold text-blue-800">
                  Provider Responsibility.
                </span>{" "}
                Provider remains solely responsible for verifying the accuracy
                of AI outputs and for all clinical, diagnostic and treatment
                decisions. Provider agrees not to rely solely on AI features and
                to exercise professional judgment in all patient care and
                administrative decisions. This reinforces the Service’s existing
                disclaimer that Varn Digihealth does not provide professional or
                medical advice.
              </p>
              <p>
                <span className="font-bold text-blue-800">
                  Limitation of Liability.
                </span>{" "}
                Varn Digihealth disclaims any liability arising from Provider’s
                use or reliance on AI‑generated outputs. The general warranty
                disclaimer and limitation of liability provisions in these Terms
                apply equally to AI features.
              </p>
            </div>
          </article>

          <hr className="my-8 border-gray-200" />

          {/* Section 8: Indemnification */}
          <article className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-100">
              8. Indemnification
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Provider agrees to indemnify, defend and hold harmless Varn
                Digihealth and its affiliates, officers, directors, employees
                and agents from any claims, damages, losses and expenses
                (including reasonable attorneys’ fees) arising out of or related
                to (a) Provider’s or its Authorized Users’ use or misuse of the
                Services, (b) any breach of this Agreement, (c) any violation of
                applicable law, or (d) any negligence or misconduct by Provider
                or its Authorized Users.
              </p>
            </div>
          </article>

          <hr className="my-8 border-gray-200" />

          {/* Section 9: Term & Termination */}
          <article className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-100">
              9. Term & Termination
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <span className="font-bold text-blue-800">Term.</span> This
                Agreement begins upon Provider’s acceptance and continues until
                terminated by either party as set forth herein.
              </p>
              <p>
                <span className="font-bold text-blue-800">
                  Termination by Provider.
                </span>{" "}
                Provider may terminate this Agreement by giving written notice
                to Varn Digihealth and ceasing all use of the Services.
              </p>
              <p>
                <span className="font-bold text-blue-800">
                  Termination by Varn Digihealth.
                </span>{" "}
                Varn Digihealth may suspend or terminate Provider’s access to
                the Services immediately if Provider breaches a material term of
                this Agreement (including security obligations or prohibited
                conduct) and fails to cure the breach within thirty (30) days of
                receiving notice, or immediately if cure is not possible.
              </p>
              <p>
                <span className="font-bold text-blue-800">
                  Effect of Termination.
                </span>{" "}
                Upon termination, Provider and its Authorized Users must cease
                all access to and use of the Services and return or delete all
                Confidential Information belonging to Varn Digihealth. Sections
                dealing with confidentiality, data use, indemnification, AI
                functionality, and limitations of liability survive termination.
              </p>
            </div>
          </article>

          <hr className="my-8 border-gray-200" />

          {/* Section 10: Governing Law & Miscellaneous */}
          <article className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-100">
              10. Governing Law & Miscellaneous
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <span className="font-bold text-blue-800">Governing Law.</span>{" "}
                This Agreement is governed by the laws of the State of Delaware
                (or another state specified in a separate written agreement),
                without regard to its conflicts of law rules.
              </p>
              <p>
                <span className="font-bold text-blue-800">Notices.</span>{" "}
                Notices required under this Agreement must be in writing and
                sent to Varn Digihealth at 16192 Coastal Hwy, Lewes, DE 19958,
                and to Provider at the address provided during registration, or
                to such other addresses as either party may designate in
                writing.
              </p>
              <p>
                <span className="font-bold text-blue-800">Assignment.</span>{" "}
                Provider may not assign or transfer this Agreement or its rights
                or obligations without Varn Digihealth’s prior written consent.
                Varn Digihealth may assign this Agreement to a successor,
                affiliate or in connection with a merger or sale of
                substantially all its assets.
              </p>
              <p>
                <span className="font-bold text-blue-800">Amendments.</span>{" "}
                Varn Digihealth may modify these Terms by posting an updated
                version and providing reasonable notice. Provider’s continued
                use of the Services after notice constitutes acceptance of the
                updated terms.
              </p>
              <p>
                <span className="font-bold text-blue-800">
                  Entire Agreement.
                </span>{" "}
                This Agreement constitutes the entire agreement between the
                parties regarding the Services and supersedes any prior or
                contemporaneous agreements. If any provision is held
                unenforceable, the remainder of the Agreement shall continue in
                full force.
              </p>
            </div>
          </article>

          {/* I Agree button and footer */}
        </section>
      </div>
    </div>
  );
};

export default TermsAndCondition;
