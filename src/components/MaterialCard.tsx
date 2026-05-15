'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { StudyMaterial } from '@/types'
import { ShoppingCart, Eye, Download } from 'lucide-react'

interface MaterialCardProps {
  material: StudyMaterial
  onPurchase?: (material: StudyMaterial) => void
  onPreview?: (material: StudyMaterial) => void
  isPurchased?: boolean
}

export default function MaterialCard({ 
  material, 
  onPurchase, 
  onPreview, 
  isPurchased = false 
}: MaterialCardProps) {
  const router = useRouter()

  const handlePurchaseClick = () => {
    router.push(`/payment?materialId=${material.id}`)
  }

  return (
    <Card className="glass rounded-[32px] hover-lift group smooth-transition border-white/10 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg text-text line-clamp-2 group-hover:text-primary smooth-transition font-display leading-tight">
              {material.title}
            </CardTitle>
            <CardDescription className="text-text-muted mt-2 group-hover:text-text-secondary smooth-transition font-body text-xs leading-relaxed">
              {material.description}
            </CardDescription>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-secondary">
              {material.price === 0 ? 'FREE' : `MWK ${material.price.toLocaleString()}`}
            </div>
            <div className="inline-flex mt-1 px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-text-muted group-hover:text-text-secondary smooth-transition uppercase tracking-wider">
              {material.type}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {material.pages && (
              <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {material.pages} pages
              </span>
            )}
            {material.duration && (
              <span className="px-2.5 py-1 bg-accent/10 text-accent rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {material.duration}
              </span>
            )}
            <span className="px-2.5 py-1 bg-secondary/10 text-secondary rounded-lg text-[10px] font-bold uppercase tracking-wider">
              {material.difficulty}
            </span>
            {material.price === 0 && (
              <span className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] font-bold uppercase tracking-wider animate-pulse border border-green-500/20">
                LIFETIME
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-3">
          {material.previewUrl && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPreview?.(material)}
              className="flex-1 glass border-white/10 hover:bg-white/5 smooth-transition text-xs font-bold"
            >
              <Eye className="mr-2 h-3.5 w-3.5" />
              Preview
            </Button>
          )}
          
          {isPurchased || material.price === 0 ? (
            <Button 
              className="flex-1 bg-accent hover:bg-accent/90 text-white font-bold shadow-lg shadow-accent/20 text-xs"
              onClick={() => window.open(material.downloadUrl)}
            >
              <Download className="mr-2 h-3.5 w-3.5" />
              Download
            </Button>
          ) : (
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 text-xs"
              onClick={handlePurchaseClick}
            >
              <ShoppingCart className="mr-2 h-3.5 w-3.5" />
              Purchase
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
