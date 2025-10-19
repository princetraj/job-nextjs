import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms & Conditions | JobPortal',
  description: 'Read our terms and conditions for using JobPortal.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Terms & Conditions
        </h1>
        <p className="text-gray-600 mb-8">Last Updated: January 2025</p>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using JobPortal, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by the above,
              please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              2. Use License
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Permission is granted to temporarily use JobPortal for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a transfer of title,
              and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or public display</li>
              <li>Attempt to reverse engineer any software contained on JobPortal</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or mirror the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3. User Accounts
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              When you create an account with us, you must provide information that is accurate,
              complete, and current at all times. Failure to do so constitutes a breach of the
              Terms, which may result in immediate termination of your account.
            </p>
            <p className="text-gray-600 leading-relaxed">
              You are responsible for safeguarding the password that you use to access the service
              and for any activities or actions under your password.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              4. Job Postings and Applications
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Employers are responsible for ensuring their job postings are accurate, lawful,
              and do not discriminate on the basis of protected characteristics. Job seekers
              are responsible for the accuracy of information provided in their applications.
            </p>
            <p className="text-gray-600 leading-relaxed">
              JobPortal reserves the right to remove any job posting or user account that
              violates our policies or applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              5. Prohibited Activities
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              You may not use JobPortal for any of the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Posting false, inaccurate, or misleading information</li>
              <li>Impersonating any person or entity</li>
              <li>Harassment, abuse, or harm of another person</li>
              <li>Spamming or unsolicited advertising</li>
              <li>Collecting or storing personal data about other users</li>
              <li>Uploading viruses or malicious code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-gray-600 leading-relaxed">
              The service and its original content, features, and functionality are and will
              remain the exclusive property of JobPortal and its licensors. Our trademarks
              and trade dress may not be used without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              7. Disclaimer
            </h2>
            <p className="text-gray-600 leading-relaxed">
              The materials on JobPortal are provided on an &apos;as is&apos; basis. JobPortal makes
              no warranties, expressed or implied, and hereby disclaims and negates all other
              warranties including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              8. Limitations
            </h2>
            <p className="text-gray-600 leading-relaxed">
              In no event shall JobPortal or its suppliers be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business
              interruption) arising out of the use or inability to use JobPortal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              9. Termination
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or
              liability, for any reason whatsoever, including without limitation if you breach
              the Terms. Upon termination, your right to use the service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              10. Changes to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. We will provide
              notice of any significant changes by posting the new Terms on this page. Your
              continued use of JobPortal after any such changes constitutes your acceptance
              of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              11. Contact Information
            </h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms, please contact us at
              legal@jobportal.com.
            </p>
          </section>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
