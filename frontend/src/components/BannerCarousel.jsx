import { useState, useEffect, useCallback } from 'react';
import { getActiveBanners } from '../services/bannerService';
import './BannerCarousel.css';

function BannerCarousel() {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    getActiveBanners()
      .then(setSlides)
      .catch(() => setSlides([]));
  }, []);

  const next = useCallback(() => {
    setIndex((prev) => (slides.length > 0 ? (prev + 1) % slides.length : 0));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="banner-carousel">
      <div className="banner-carousel__viewport">
        <div
          className="banner-carousel__track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide._id}
              className={`banner-carousel__slide ${slide.fullImage ? 'banner-carousel__slide--full-image' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {!slide.fullImage && (
                <>
                  <div className="banner-carousel__overlay"></div>
                  <div className="banner-carousel__content">
                    {slide.eyebrow && <p className="banner-carousel__eyebrow">{slide.eyebrow}</p>}
                    {slide.title && <h2 className="banner-carousel__title">{slide.title}</h2>}
                    {slide.subtitle && <p className="banner-carousel__subtitle">{slide.subtitle}</p>}
                    {slide.ctaLabel && slide.ctaLink && (
                      <a href={slide.ctaLink} className="banner-carousel__cta">{slide.ctaLabel}</a>
                    )}
                  </div>
                </>
              )}
              {slide.fullImage && slide.ctaLink && (
                <a href={slide.ctaLink} className="banner-carousel__full-link" aria-label="View offer"></a>
              )}
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="banner-carousel__dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`banner-carousel__dot ${i === index ? 'banner-carousel__dot--active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BannerCarousel;