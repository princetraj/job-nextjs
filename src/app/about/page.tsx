import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About Us | JobPortal',
  description: 'Learn more about JobPortal and our mission to connect job seekers with employers.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us</h1>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              JobPortal is dedicated to connecting talented professionals with exciting career opportunities.
              We believe that finding the right job should be simple, efficient, and accessible to everyone.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What We Do</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We provide a comprehensive platform that bridges the gap between job seekers and employers.
              Our platform offers:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Advanced job search and filtering capabilities</li>
              <li>Easy application management for job seekers</li>
              <li>Efficient recruitment tools for employers</li>
              <li>Secure and user-friendly interface</li>
              <li>Personalized job recommendations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Innovation</h3>
                <p className="text-gray-600 text-sm">
                  We continuously improve our platform with the latest technology.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Trust</h3>
                <p className="text-gray-600 text-sm">
                  We maintain the highest standards of security and privacy.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Accessibility</h3>
                <p className="text-gray-600 text-sm">
                  We make job searching and hiring accessible to everyone.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Excellence</h3>
                <p className="text-gray-600 text-sm">
                  We strive for excellence in every aspect of our service.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Join Us</h2>
            <p className="text-gray-600 leading-relaxed">
              Whether you&apos;re looking for your next career move or searching for the perfect candidate,
              JobPortal is here to help you succeed. Join thousands of satisfied users who trust us
              with their career journey.
            </p>
          </section>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
