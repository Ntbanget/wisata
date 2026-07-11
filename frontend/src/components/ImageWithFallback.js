import React, { useEffect, useState } from 'react';
import { Building2, Compass, Landmark, MapPin, Mountain, Palette, Sparkles, Waves } from 'lucide-react';

const categoryConfig = (type = 'default', category = '') => {
  const normalized = String(category || '').toLowerCase();

  if (type === 'hotel') {
    return {
      icon: Building2,
      gradient: 'from-slate-700 via-slate-600 to-slate-500',
    };
  }

  if (normalized.includes('beach')) {
    return {
      icon: Waves,
      gradient: 'from-cyan-600 via-sky-600 to-indigo-600',
    };
  }

  if (normalized.includes('nature') || normalized.includes('park')) {
    return {
      icon: Mountain,
      gradient: 'from-emerald-600 via-green-600 to-lime-600',
    };
  }

  if (normalized.includes('historical') || normalized.includes('monument')) {
    return {
      icon: Landmark,
      gradient: 'from-amber-600 via-orange-600 to-rose-600',
    };
  }

  if (normalized.includes('cultural') || normalized.includes('museum')) {
    return {
      icon: Palette,
      gradient: 'from-violet-600 via-fuchsia-600 to-purple-600',
    };
  }

  if (normalized.includes('religious')) {
    return {
      icon: Landmark,
      gradient: 'from-amber-700 via-yellow-600 to-orange-500',
    };
  }

  if (normalized.includes('adventure')) {
    return {
      icon: Compass,
      gradient: 'from-red-600 via-rose-600 to-pink-500',
    };
  }

  return {
    icon: MapPin,
    gradient: 'from-indigo-600 via-blue-600 to-cyan-500',
  };
};

const ImageWithFallback = ({
  src,
  alt = 'Image',
  category = '',
  type = 'default',
  className = '',
  fallbackClassName = '',
  ...imgProps
}) => {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const { icon: Icon, gradient } = categoryConfig(type, category);

  useEffect(() => {
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  const shouldShowFallback = !currentSrc || hasError;
  const wrapperClassName = `relative overflow-hidden ${fallbackClassName || className}`.trim();
  const fallbackClassNameValue = `flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${fallbackClassName || className}`.trim();

  return (
    <div className={wrapperClassName}>
      {shouldShowFallback && (
        <div
          className={fallbackClassNameValue}
          data-testid="image-fallback"
          aria-label={`Fallback for ${alt}`}
        >
          <Icon className="h-8 w-8 text-white/90" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        onError={() => setHasError(true)}
        className={`${className} ${shouldShowFallback ? 'hidden' : 'block'}`.trim()}
        style={{ display: shouldShowFallback ? 'none' : 'block' }}
        {...imgProps}
      />
    </div>
  );
};

export default ImageWithFallback;
