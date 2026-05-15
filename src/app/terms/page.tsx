'use client'

import { motion } from 'framer-motion'
import { FileText, Scale, Zap, Ban, Copyright, AlertCircle, ShieldCheck, Globe } from 'lucide-react'

const terms = [
  {
    icon: <Scale className="h-6 w-6 text-primary" />,
    title: "1. Acceptance of Terms",
    content: "By creating an account or using the Yaza Study platform, you agree to be bound by these Terms of Service and all applicable laws and regulations in Malawi. These terms constitute a legally binding agreement between you and Yaza Study."
  },
  {
    icon: <Zap className="h-6 w-6 text-secondary" />,
    title: "2. Digital Products & Refunds",
    content: "All study materials (PDFs, guides, and practice papers) are digital products. Access is granted immediately upon successful payment confirmation. Due to the irrevocable nature of digital downloads, all purchases are final and non-refundable once the material has been accessed or downloaded."
  },
  {
    icon: <Copyright className="h-6 w-6 text-accent" />,
    title: "3. Intellectual Property",
    content: "All materials provided are the intellectual property of Yaza Study. Upon purchase, you are granted a non-exclusive, non-transferable license for personal, non-commercial study use only. Reselling, redistributing, or sharing access to these materials is strictly prohibited and may result in legal action."
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    title: "4. Account Responsibilities",
    content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to terminate accounts that violate our security policies."
  },
  {
    icon: <Globe className="h-6 w-6 text-secondary" />,
    title: "5. Payments & Pricing",
    content: "All transactions are processed in Malawi Kwacha (MWK) through PayChangu. Prices are subject to change without notice. We are not responsible for any mobile money or bank fees incurred during the transaction."
  },
  {
    icon: <Ban className="h-6 w-6 text-primary" />,
    title: "6. Prohibited Conduct",
    content: "You may not use our service to: (a) reverse engineer or scrape content; (b) share your account with others; (c) attempt to bypass payment systems; or (d) use materials for classroom teaching without a commercial license."
  }
]

export default function TermsOfService() {
  return (
    <div className="min-h-screen py-24 px-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-secondary/30">
            <FileText className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-display text-white mb-4">Terms of Service</h1>
          <p className="text-xl text-text-muted">Effective Date: May 13, 2026</p>
        </motion.div>

        <div className="grid gap-8">
          {terms.map((term, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-3xl border border-white/10 hover:border-white/20 smooth-transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  {term.icon}
                </div>
                <h2 className="text-2xl font-bold font-display text-white">{term.title}</h2>
              </div>
              <p className="text-text-secondary leading-relaxed text-lg">
                {term.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 p-8 glass-dark rounded-3xl border border-white/5 bg-red-500/5"
        >
          <h2 className="text-2xl font-bold font-display text-white mb-4 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-400" />
            Disclaimer of Warranties
          </h2>
          <p className="text-text-secondary mb-4">
            Yaza Study provides materials "as is" for educational purposes only. While we strive for accuracy, we do not warrant that materials are error-free, nor do we guarantee specific academic outcomes or exam results.
          </p>
          <p className="text-text-secondary">
            For legal inquiries or licensing questions, please contact us at <a href="mailto:[EMAIL_ADDRESS]">[EMAIL_ADDRESS]</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
} 
