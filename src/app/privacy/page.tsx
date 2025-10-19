import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | JobPortal',
  description: 'Learn how JobPortal collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: January 2025</p>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to JobPortal. We respect your privacy and are committed to protecting
              your personal data. This privacy policy will inform you about how we look after
              your personal data and tell you about your privacy rights and how the law
              protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              2. Information We Collect
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We collect and process the following types of information:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>
                <strong>Identity Data:</strong> Name, username, title, date of birth, and gender
              </li>
              <li>
                <strong>Contact Data:</strong> Email address, telephone numbers, and billing address
              </li>
              <li>
                <strong>Profile Data:</strong> Resume/CV, work history, education, skills, and preferences
              </li>
              <li>
                <strong>Technical Data:</strong> IP address, browser type, time zone setting, and location data
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you use our website and services
              </li>
              <li>
                <strong>Marketing Data:</strong> Your preferences in receiving marketing from us
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>To register you as a new user and manage your account</li>
              <li>To process and facilitate job applications</li>
              <li>To match job seekers with relevant job opportunities</li>
              <li>To communicate with you about our services</li>
              <li>To improve our website, products, and services</li>
              <li>To ensure the security of our platform</li>
              <li>To send you marketing communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              4. Data Sharing and Disclosure
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We may share your personal data with:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>
                <strong>Employers:</strong> When you apply for jobs, your profile and application
                information will be shared with the relevant employers
              </li>
              <li>
                <strong>Service Providers:</strong> Third-party vendors who provide services on our behalf
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to protect our rights
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              We will never sell your personal data to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We have implemented appropriate security measures to prevent your personal data
              from being accidentally lost, used, or accessed in an unauthorized way. We limit
              access to your personal data to employees and partners who have a business need
              to know. They will only process your personal data on our instructions and are
              subject to a duty of confidentiality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              6. Data Retention
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We will only retain your personal data for as long as necessary to fulfill the
              purposes we collected it for, including for the purposes of satisfying any legal,
              accounting, or reporting requirements. When your account is no longer active, we
              will either delete or anonymize your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              7. Your Rights
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Under data protection laws, you have rights including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>
                <strong>Right to Access:</strong> Request access to your personal data
              </li>
              <li>
                <strong>Right to Rectification:</strong> Request correction of inaccurate data
              </li>
              <li>
                <strong>Right to Erasure:</strong> Request deletion of your personal data
              </li>
              <li>
                <strong>Right to Object:</strong> Object to processing of your personal data
              </li>
              <li>
                <strong>Right to Data Portability:</strong> Request transfer of your data
              </li>
              <li>
                <strong>Right to Withdraw Consent:</strong> Withdraw consent at any time
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our service
              and store certain information. You can instruct your browser to refuse all cookies
              or to indicate when a cookie is being sent. However, if you do not accept cookies,
              you may not be able to use some portions of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              9. Third-Party Links
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for
              the privacy practices or the content of these third-party sites. We encourage you
              to read the privacy policy of every website you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              10. Children&apos;s Privacy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our service is not intended for individuals under the age of 18. We do not
              knowingly collect personal data from children. If you are a parent or guardian
              and believe your child has provided us with personal data, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the &quot;Last
              Updated&quot; date. You are advised to review this Privacy Policy periodically for
              any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy or wish to exercise your
              rights, please contact us at:
            </p>
            <ul className="list-none text-gray-600 mt-3 space-y-1">
              <li>Email: privacy@jobportal.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Business Street, Suite 100, City, State 12345</li>
            </ul>
          </section>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
