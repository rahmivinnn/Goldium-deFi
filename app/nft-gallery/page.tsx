"use client"

import PageLayout from "@/components/PageLayout"
import NFTGalleryHeader from "@/components/nft-gallery/NFTGalleryHeader"
import NFTGalleryGrid from "@/components/nft-gallery/NFTGalleryGrid"

export default function NFTGalleryPage() {
  return (
    <PageLayout>
      <NFTGalleryHeader />
      <NFTGalleryGrid />
    </PageLayout>
  )
}
