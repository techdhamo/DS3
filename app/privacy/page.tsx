'use client';

import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye } from 'lucide-react';

export default function PrivacyPolicy() {
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
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Privacy Policy
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
                  <Eye className="w-6 h-6 text-purple-400" />
                  Information We Collect
                </h2>
                <p className="mb-4">
                  DS3 World collects minimal information necessary to provide our mystery box gaming platform:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email address for account creation and authentication</li>
                  <li>Profile information (name, avatar) from Google OAuth</li>
                  <li>Purchase history and transaction data</li>
                  <li>Game statistics and inventory items</li>
                  <li>Technical data for service improvement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-purple-400" />
                  How We Use Your Information
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our gaming platform</li>
                  <li>Process payments and manage purchases</li>
                  <li>Authenticate users and secure accounts</li>
                  <li>Send important service notifications</li>
                  <li>Improve user experience and platform features</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Mail className="w-6 h-6 text-purple-400" />
                  Data Protection
                </h2>
                <p className="mb-4">
                  We take data protection seriously:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All data is encrypted using industry-standard protocols</li>
                  <li>Payment information is processed securely through Razorpay</li>
                  <li>We never sell or share your personal information</li>
                  <li>You can request data deletion at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at:
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
