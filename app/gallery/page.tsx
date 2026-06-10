import { GALLERY_CATEGORY_OPTIONS, getPublishedGalleryPhotos } from '@/lib/server/repositories/gallery-live'
import GalleryPageClient from './GalleryPageClient'

export default async function GalleryPage() {
  const photos = await getPublishedGalleryPhotos()

  return (
    <GalleryPageClient
      initialPhotos={photos}
      categoryOrder={GALLERY_CATEGORY_OPTIONS}
    />
  )
}
