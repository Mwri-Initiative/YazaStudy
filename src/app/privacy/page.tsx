'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Lock, Eye, Server, Bell, FileText, UserCheck, Database } from 'lucide-react'

const sections = [
  {
    icon: <Lock className="h-6 w-6 text-primary" />,
    title: "1. Information We Collect",
    content: "We collect personal information that you provide to us, including your name, email address, and phone number. This data is collected during account registration and when you make a purchase to facilitate the delivery of your study materials."
  },
  {
    icon: <Database className="h-6 w-6 text-accent" />,
    title: "2. How We Store Your Data",
    content: "Your account and profile information is securely stored using Supabase, a leading backend-as-a-service provider. This ensures your data is protected by industry-standard encryption and security protocols."
  },
  {
    icon: <Server className="h-6 w-6 text-secondary" />,
    title: "3. Secure Payment Processing",
    content: "All payments are processed through PayChangu. We do not store, see, or have access to your credit card numbers or mobile money PINs. PayChangu handles all financial data according to strict PCI compliance standards."
  },
  {
    icon: <UserCheck className="h-6 w-6 text-primary" />,
    title: "4. Use of Information",
    content: "We use your information only to: (a) Provide and maintain our service; (b) Process your transactions; (c) Authenticate your access to purchased materials; and (d) Send you important updates regarding your account."
  },
  {
    icon: <Eye className="h-6 w-6 text-accent" />,
    title: "5. Data Sharing & Third Parties",
    content: "We do not sell, trade, or otherwise transfer your personal information to outside parties. This does not include trusted third parties who assist us in operating our website (like Supabase and PayChangu), so long as those parties agree to keep this information confidential."
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-secondary" />,
    title: "6. Cookies & Tracking",
    content: "We use essential cookies to maintain your login session. These cookies do not track your activity on other websites and are necessary for the core functionality of the Yaza Study platform."
  }
]

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-24 px-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/30">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-display text-white mb-4">Privacy Policy</h1>
          <p className="text-xl text-text-muted">Effective Date: May 13, 2026</p>
        </motion.div>

        <div className="grid gap-8">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-3xl border border-white/10 hover:border-white/20 smooth-transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold font-display text-white">{section.title}</h2>
              </div>
              <p className="text-text-secondary leading-relaxed text-lg">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 p-8 glass-dark rounded-3xl border border-white/5"
        >
          <h2 className="text-2xl font-bold font-display text-white mb-4 flex items-center gap-3">
            <FileText className="h-6 w-6 text-accent" />
            Data Protection Rights
          </h2>
          <p className="text-text-secondary mb-4">
            Under data protection regulations, you have the right to access, rectify, or erase your personal data. You may request account deletion at any time by contacting us.
          </p>
          <p className="text-text-secondary">
            For any privacy-related questions, please contact our data protection officer at <a href="mailto:[emmanuelchinamwiri@gmail.com]">[emmanuelchinamwiri@gmail.com]</a>
            <br />
            <br /> Call us at <a href="tel:+265881779252">+265 881 779 252</a>
            <br /> Airtel 👇
            <br />
              WhatsApp us at <a href="https://wa.me/265980851937">+265 980 851 937</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
