import { BadgeCheck, Star } from 'lucide-react';
import { formatPrice } from '../lib/salonDetails';

interface SalonCardProps {
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  desde: number;
  tags: string[];
  photos?: string[];
  badges?: string[];
  imageClass?: string;
  verified?: boolean;
  promoted?: boolean;
  onSelect: () => void;
}

const SALON_IMAGES: Record<string, string> = {
  'salon-img-feromi': 'https://images.unsplash.com/photo-1562322140-8baeececf3df',
  'salon-img-lumiere': 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f',
  'salon-img-marcel': 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a',
  'salon-img-nuvo': 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b',
  'salon-img-aura': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874',
  'salon-img-glow': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937',
};

function buildImageUrl(baseUrl: string, width: number) {
  return `${baseUrl}?auto=format&fm=webp&fit=crop&w=${width}&q=72`;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

export default function SalonCard({
  name,
  location,
  distance,
  rating,
  reviews,
  desde,
  tags,
  photos,
  badges = [],
  imageClass = '',
  verified = false,
  promoted = false,
  onSelect,
}: SalonCardProps) {
  const photo = photos?.[0];
  const stockUrl = SALON_IMAGES[imageClass];
  const place = [location, distance].filter(Boolean).join(' · ');
  const price = desde > 0 ? formatPrice(desde) : null;

  return (
    <button className="salon-card" type="button" onClick={onSelect} aria-label={`Abrir ficha de ${name}`}>
      <div className={`salon-img ${photo ? '' : imageClass}`}>
        {photo ? (
          <img src={photo} alt={`Foto de ${name}`} loading="lazy" decoding="async" />
        ) : stockUrl ? (
          <img
            src={buildImageUrl(stockUrl, 360)}
            srcSet={`${buildImageUrl(stockUrl, 240)} 240w, ${buildImageUrl(stockUrl, 360)} 360w, ${buildImageUrl(stockUrl, 520)} 520w`}
            sizes="(max-width: 720px) 118px, (max-width: 1100px) 33vw, 25vw"
            alt={`Imagen de ${name}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="salon-img-initials" aria-hidden="true">{initials(name)}</span>
        )}
      </div>
      <div className="salon-info">
        <div className="salon-name">
          {name}
          {verified && <span className="salon-verified"><BadgeCheck size={15} /></span>}
        </div>
        {place && <div className="salon-loc">{place}</div>}
        {promoted && (
          <div className="salon-promoted" aria-label="Resultado patrocinado">
            <span className="salon-promoted-label">Patrocinado</span>
          </div>
        )}
        {!!badges.length && (
          <div className="salon-badges" aria-label="Estado del salón">
            {badges.slice(0, 2).map((badge) => <span key={badge}>{badge}</span>)}
          </div>
        )}
        <div className="salon-meta">
          {reviews > 0 ? (
            <>
              <span className="salon-rating">
                <Star size={13} fill="#F59E0B" color="#F59E0B" />
                {rating.toFixed(1)}
              </span>
              <span style={{ color: 'var(--fg-4)' }}>({reviews})</span>
            </>
          ) : (
            <span className="salon-new">Nuevo en Allop</span>
          )}
          {price && <span className="salon-price">Desde {price}</span>}
        </div>
        {!!tags.length && (
          <div className="salon-tags">
            {tags.slice(0, 3).map((tag) => <span key={tag} className="tag">{tag}</span>)}
          </div>
        )}
      </div>
    </button>
  );
}
