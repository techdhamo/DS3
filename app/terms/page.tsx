'use client';

import { motion } from 'framer-motion';
import { FileText, Shield, CreditCard, Users } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4"
            >
              <FileText className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-sm">
            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-400" />
                  Acceptance of Terms
                </h2>
                <p>
                  By accessing and using DS3 World, you accept and agree to be bound by these Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                  Mystery Box Purchases
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All mystery box purchases are final and non-refundable</li>
                  <li>Item drop rates are transparently displayed on each product</li>
                  <li>Virtual items are delivered instantly to your inventory</li>
                  <li>Payments are processed securely through Razorpay</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-purple-400" />
                  User Responsibilities
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must be 18+ years old to make purchases</li>
                  <li>Maintain account security and password confidentiality</li>
                  <li>Use the platform responsibly and ethically</li>
                  <li>Do not exploit bugs or use unauthorized third-party tools</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Virtual Items</h2>
                <p>
                  All virtual items in DS3 World are digital goods with no real-world monetary value outside the platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Service Availability</h2>
                <p>
                  We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. 
                  We reserve the right to perform maintenance and updates.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
                <p>
                  For questions about these Terms of Service, contact us at:
                </p>
                <p className="mt-2 text-purple-400">
                  dhamo.developer@gmail.com
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
