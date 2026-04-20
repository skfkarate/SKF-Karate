/**
 * Gallery Photo Data — re-exports from centralized data layer.
 * Components import from here for backward compatibility.
 */
import { galleryPhotos } from '@/data/seed/gallery'
import { GALLERY_CATEGORIES } from '@/data/constants/categories'

export const allPhotos = galleryPhotos
export const categoryOrder = [...GALLERY_CATEGORIES]
