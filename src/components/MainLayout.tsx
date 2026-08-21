'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAiTutor = pathname === '/ai-tutor'
  const isOfflineLibrary = pathname === '/offline-library'

  return (
    <>
      {!isAiTutor && <Header />}
      <main>{children}</main>
      {!isAiTutor && !isOfflineLibrary && <Footer />}
    </>
  )
}
