'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAiTutor = pathname === '/ai-tutor'

  return (
    <>
      {!isAiTutor && <Header />}
      <main>{children}</main>
      {!isAiTutor && <Footer />}
    </>
  )
}
