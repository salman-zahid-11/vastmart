import { useState, useRef } from 'react';
import './ImageGallery.css';

function ImageGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);

  const displayImages = images.length > 0 ? images : ['https://via.placeholder.com/500'];

  const goTo = (index) => {
    if (index < 0) index = displayImages.length - 1;
    if (index >= displayImages.length) index = 0;
    setActiveIndex(index);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) goTo(activeIndex - 1);
    else if (deltaX < -50) goTo(activeIndex + 1);
    touchStartX.current = null;
  };

  return (
    <div className="image-gallery">
      <div
        className="image-gallery__main"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img src={displayImages[activeIndex]} alt={`Product image ${activeIndex + 1}`} />

        {displayImages.length > 1 && (
          <>
            <button
              className="image-gallery__nav image-gallery__nav--prev"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className="image-gallery__nav image-gallery__nav--next"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next image"
            >
              ›
            </button>
            <div className="image-gallery__counter">
              {activeIndex + 1} / {displayImages.length}
            </div>
          </>
        )}
      </div>

      {displayImages.length > 1 && (
        <div className="image-gallery__thumbs">
          {displayImages.map((src, i) => (
            <button
              key={i}
              className={`image-gallery__thumb ${i === activeIndex ? 'image-gallery__thumb--active' : ''}`}
              onClick={() => setActiveIndex(i)}
            >
              <img src={src} alt={`Thumbnail ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;