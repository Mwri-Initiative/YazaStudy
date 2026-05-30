'use client'

import { motion } from 'framer-motion'
import { FileText, Scale, Zap, Ban, Copyright, AlertCircle, ShieldCheck, Globe } from 'lucide-react'

const terms = [
  {
    icon: <Scale className="h-6 w-6 text-primary" />,
    title: "1. Acceptance and Scope",
    content: "By accessing or using Yaza Study (the “Service”) you agree to these Terms of Service (this “Agreement”). This Agreement applies to all users, visitors, learners, and customers of Yaza Study. If you do not agree, do not use the Service."
  },
  {
    icon: <Zap className="h-6 w-6 text-secondary" />,
    title: "2. Digital Content, Delivery & Refunds",
    content: "Study materials, practice papers, and other digital resources are delivered electronically. Access is granted after successful payment. Because digital products can be copied and downloaded, purchases are final once access is granted; refunds are only issued at our discretion for proven technical errors or billing mistakes."
  },
  {
    icon: <Copyright className="h-6 w-6 text-accent" />,
    title: "3. Intellectual Property & Limited License",
    content: "All content on the Service (text, images, PDFs, designs, and code) is owned or licensed by Yaza Study. When you purchase content you receive a limited, non-exclusive, non-transferable license for personal, non-commercial educational use only. Reuse, redistribution, resale, or public performance requires our prior written permission."
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    title: "4. Accounts, Security & Responsible Use",
    content: "You are responsible for maintaining the confidentiality of account credentials and for all activity performed under your account. Do not share accounts. Notify us immediately of suspected unauthorized access. We may suspend or terminate accounts that violate these Terms or that present security risks."
  },
  {
    icon: <Globe className="h-6 w-6 text-secondary" />,
    title: "5. Payments, Billing & Subscription",
    content: "Payments are processed using third-party providers (for example, PayChangu). You agree to pay applicable fees shown at checkout. Subscription cancellations follow the rules disclosed at purchase; we may change prices but will honor active subscriptions until renewal. We are not responsible for fees charged by payment providers or banks."
  },
  {
    icon: <Ban className="h-6 w-6 text-primary" />,
    title: "6. Acceptable Use and Prohibited Conduct",
    content: "You must not: (a) copy, scrape, or reuse content at scale; (b) share your account credentials; (c) attempt to bypass payment controls; (d) use content commercially without a license; or (e) post illegal, defamatory, or harmful content via the Service. Violations may result in account termination."
  },
  {
    icon: <AlertCircle className="h-6 w-6 text-red-400" />,
    title: "7. Disclaimers & No Guarantee of Results",
    content: "Materials are provided for educational purposes only and are offered “as is.” We do not guarantee specific exam outcomes or scores. While we aim for accuracy, errors can occur; you are responsible for verifying important information."
  },
  {
    icon: <FileText className="h-6 w-6 text-accent" />,
    title: "8. Privacy & Data",
    content: "We process personal data according to our Privacy Policy. By using the Service you consent to that processing, including the use of analytics and third-party services. Sensitive payment data is handled by the payment processor; we do not store raw card data."
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    title: "9. Limitation of Liability",
    content: "To the fullest extent permitted by law, Yaza Study and its affiliates are not liable for indirect, incidental, or consequential damages arising from your use of the Service. Our total liability for direct damages is limited to the amount you paid for the relevant product or service in the 12 months before the claim."
  },
  {
    icon: <Globe className="h-6 w-6 text-secondary" />,
    title: "10. Termination & Suspension",
    content: "We may suspend or terminate access for violations of these Terms or applicable law. Upon termination, your rights under this Agreement end and you must stop using the Service. Certain data may persist where required for legal or accounting reasons."
  },
  {
    icon: <Scale className="h-6 w-6 text-primary" />,
    title: "11. Changes to Terms",
    content: "We may update these Terms from time to time. Material changes will be communicated via the Service or email. Continued use after publication constitutes acceptance of the updated Terms."
  },
  {
    icon: <FileText className="h-6 w-6 text-accent" />,
    title: "12. Contact & Legal",
    content: "For questions, legal notices, or licensing inquiries contact: Emmanuel Chinamwiri — emmanuelchinamwiri@gmail.com. These Terms are governed by the laws applicable to the Service operator."
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
          <p className="text-xl text-text-muted">Effective Date: May 30, 2026</p>
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
            For legal inquiries or licensing questions, please contact us at <a href="mailto:[EMAIL_ADDRESS]">[emmanuelchinamwiri@gmail.com]</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
} 
