'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'General',
    question: 'What is JobPortal?',
    answer:
      'JobPortal is a comprehensive job search and recruitment platform that connects job seekers with employers. We provide tools for job searching, application management, and recruitment.',
  },
  {
    category: 'General',
    question: 'Is JobPortal free to use?',
    answer:
      'Basic job searching and application submission are free for job seekers. Employers can choose from various pricing plans based on their hiring needs. Premium features are available for both job seekers and employers.',
  },
  {
    category: 'For Job Seekers',
    question: 'How do I create an account?',
    answer:
      'Click on the "Sign Up" button in the top right corner, select "Job Seeker," and fill in your details. You can also sign up using your social media accounts for faster registration.',
  },
  {
    category: 'For Job Seekers',
    question: 'How do I search for jobs?',
    answer:
      'Use the search bar on our homepage or the Jobs page. You can filter results by location, job type, salary range, industry, and more. Save your searches to receive notifications about new matching jobs.',
  },
  {
    category: 'For Job Seekers',
    question: 'Can I upload my resume?',
    answer:
      'Yes! You can upload your resume in PDF, DOC, or DOCX format. Your resume can be shared with employers when you apply for jobs. You can also create and edit your profile directly on our platform.',
  },
  {
    category: 'For Job Seekers',
    question: 'How do I track my applications?',
    answer:
      'All your job applications are visible in your dashboard. You can see the status of each application and receive notifications when employers review or respond to your applications.',
  },
  {
    category: 'For Job Seekers',
    question: 'What are the premium plans for job seekers?',
    answer:
      'Premium plans offer features like priority application placement, advanced search filters, unlimited job applications, resume review services, and career counseling. Check our pricing page for details.',
  },
  {
    category: 'For Employers',
    question: 'How do I post a job?',
    answer:
      'After creating an employer account, go to your dashboard and click "Post Job." Fill in the job details including title, description, requirements, and salary information. Your job will be reviewed and published within 24 hours.',
  },
  {
    category: 'For Employers',
    question: 'How many jobs can I post?',
    answer:
      'The number of active job postings depends on your subscription plan. Our basic plan includes 3 active job postings, while premium plans offer unlimited postings.',
  },
  {
    category: 'For Employers',
    question: 'Can I manage multiple job postings?',
    answer:
      'Yes, your employer dashboard provides a centralized location to manage all your job postings. You can edit, pause, or close job listings, and view all applications in one place.',
  },
  {
    category: 'For Employers',
    question: 'How do I review applications?',
    answer:
      'Applications for your jobs appear in your employer dashboard. You can filter, sort, and review candidate profiles, resumes, and cover letters. Use our built-in communication tools to contact candidates directly.',
  },
  {
    category: 'Account & Security',
    question: 'How do I reset my password?',
    answer:
      'Click on "Login" and then "Forgot Password." Enter your email address, and we&apos;ll send you instructions to reset your password. For security, password reset links expire after 24 hours.',
  },
  {
    category: 'Account & Security',
    question: 'Is my personal information secure?',
    answer:
      'Yes, we take data security seriously. We use industry-standard encryption and security measures to protect your personal information. Review our Privacy Policy for detailed information about how we handle your data.',
  },
  {
    category: 'Account & Security',
    question: 'Can I delete my account?',
    answer:
      'Yes, you can delete your account at any time from your account settings. Please note that this action is irreversible, and all your data will be permanently deleted.',
  },
  {
    category: 'Technical Support',
    question: 'What browsers are supported?',
    answer:
      'JobPortal works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.',
  },
  {
    category: 'Technical Support',
    question: 'I&apos;m having trouble uploading my resume. What should I do?',
    answer:
      'Ensure your resume file is in PDF, DOC, or DOCX format and under 5MB in size. Clear your browser cache and try again. If the problem persists, contact our support team.',
  },
  {
    category: 'Technical Support',
    question: 'How do I contact support?',
    answer:
      'You can reach our support team through the Contact Us page, by emailing support@jobportal.com, or by calling +1 (555) 123-4567 during business hours (Monday-Friday, 9 AM - 6 PM).',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqs.map((faq) => faq.category)))];

  const filteredFAQs =
    selectedCategory === 'All'
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 mb-8">
          Find answers to common questions about JobPortal
        </p>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase">
                    {faq.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1">
                    {faq.question}
                  </h3>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-500 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Contact Support
          </a>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
