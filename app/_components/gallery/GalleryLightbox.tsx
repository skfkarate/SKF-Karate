import Image from 'next/image'
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa'

export default function GalleryLightbox({
  closeLightbox,
  currentPhoto,
  displayedPhotos,
  goNext,
  goPrev,
  lightboxIdx,
}) {
  if (!currentPhoto) return null

  return (
    <div className="gal-lightbox" onClick={closeLightbox}>
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
          <Image src={currentPhoto.src} alt={currentPhoto.title} className="gal-lightbox__img" fill style={{ objectFit: 'contain' }} />
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
