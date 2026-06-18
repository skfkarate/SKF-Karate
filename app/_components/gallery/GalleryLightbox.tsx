import Image from 'next/image'
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa'

type GalleryPhoto = {
  src: string
  title: string
  cat: string
}

export default function GalleryLightbox({
  closeLightbox,
  currentPhoto,
  displayedPhotos,
  goNext,
  goPrev,
  lightboxIdx,
}: {
  closeLightbox: () => void
  currentPhoto: GalleryPhoto | null
  displayedPhotos: GalleryPhoto[]
  goNext: () => void
  goPrev: () => void
  lightboxIdx: number
}) {
  if (!currentPhoto) return null

  return (
    <div className="gal-lightbox" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label={currentPhoto.title}>
      <div className="gal-lightbox__inner" onClick={(event) => event.stopPropagation()}>
        <button className="gal-lightbox__close" onClick={closeLightbox} aria-label="Close">
          <FaTimes />
        </button>

        <button className="gal-lightbox__nav gal-lightbox__nav--prev" onClick={goPrev} aria-label="Previous">
          <FaChevronLeft />
        </button>
        <button className="gal-lightbox__nav gal-lightbox__nav--next" onClick={goNext} aria-label="Next">
          <FaChevronRight />
        </button>

        <div className="gal-lightbox__img-wrap">
          <Image src={currentPhoto.src} alt={currentPhoto.title} className="gal-lightbox__img" fill sizes="100vw" style={{ objectFit: 'contain' }} priority />
        </div>

        <div className="gal-lightbox__caption">
          <span className="gal-item__cat">{currentPhoto.cat}</span>
          <p className="gal-lightbox__title">{currentPhoto.title}</p>
          <span className="gal-lightbox__counter">
            {lightboxIdx + 1} / {displayedPhotos.length}
          </span>
        </div>
      </div>
    </div>
  )
}
