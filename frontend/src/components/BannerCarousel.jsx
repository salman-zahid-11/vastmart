import { useState, useEffect, useCallback } from 'react';
import './BannerCarousel.css';
import heroImage from '../assets/hero.png';
import cartImage from '../assets/banners/cartpic.jpg';
import pic from '../assets/banners/pic_1.png';

const SLIDES = [
  {
    eyebrow: "Bangladesh's next-generation marketplace",
    title: 'Discover the vast in VastMart.',
    subtitle: 'Thousands of sellers, one seamless storefront.',
    cta: 'Start exploring',
    href: '#products',
    image: heroImage,
  },
  {
    eyebrow: 'Flash Sale',
    title: 'Up to 40% off electronics.',
    subtitle: 'Limited stock — while it lasts.',
    cta: 'Shop the sale',
    href: '/?search=Electronics',
    image: cartImage,
  },
  {
    //eyebrow: 'New sellers welcome',
    //title: 'Start selling on VastMart today.',
    //subtitle: 'Reach thousands of buyers across Bangladesh.',
    //cta: 'Become a seller',
    //href: '/register',
    image: pic,
    fullImage: true,
    
  },
];

function BannerCarousel() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="banner-carousel">
  <div className="banner-carousel__viewport">
    <div
      className="banner-carousel__track"
      style={{ transform: `translateX(-${index * 100}%)` }}
    >
      {SLIDES.map((slide, i) => (
  <div
    key={i}
    className={`banner-carousel__slide ${
      slide.fullImage ? 'banner-carousel__slide--full-image' : ''
    }`}
    style={{ backgroundImage: `url(${slide.image})` }}
  >

    {!slide.fullImage && (
      <>
        <div className="banner-carousel__overlay"></div>

        <div className="banner-carousel__content">
          <p className="banner-carousel__eyebrow">
            {slide.eyebrow}
          </p>

          <h2 className="banner-carousel__title">
            {slide.title}
          </h2>

          <p className="banner-carousel__subtitle">
            {slide.subtitle}
          </p>

          <a
            href={slide.href}
            className="banner-carousel__cta"
          >
            {slide.cta}
          </a>
        </div>
      </>
    )}

  </div>
))}
    </div>
  </div>

  <div className="banner-carousel__dots">
    {SLIDES.map((_, i) => (
      <button
        key={i}
        className={`banner-carousel__dot ${
          i === index
            ? 'banner-carousel__dot--active'
            : ''
        }`}
        onClick={() => setIndex(i)}
        aria-label={`Go to slide ${i + 1}`}
      />
    ))}
  </div>
</div>
  );
}

export default BannerCarousel;