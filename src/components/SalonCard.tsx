import { BadgeCheck, Image, Star } from 'lucide-react';

interface SalonCardProps {
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  desde: number;
  tags: string[];
  nextSlot?: string;
  badges?: string[];
  imageClass?: string;
  verified?: boolean;
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

export default function SalonCard({
  name,
  location,
  distance,
  rating,
  reviews,
  desde,
  tags,
  nextSlot,
  badges = [],
  imageClass = '',
  verified = true,
  onSelect,
}: SalonCardProps) {
  const imageUrl = SALON_IMAGES[imageClass];

  return (
    <button className="salon-card" type="button" onClick={onSelect} aria-label={`Abrir ficha de ${name}`}>
      <div className={`salon-img ${imageClass}`}>
        {imageUrl ? (
          <img
            src={buildImageUrl(imageUrl, 360)}
            srcSet={`${buildImageUrl(imageUrl, 240)} 240w, ${buildImageUrl(imageUrl, 360)} 360w, ${buildImageUrl(imageUrl, 520)} 520w`}
            sizes="(max-width: 720px) 118px, (max-width: 1100px) 33vw, 25vw"
            alt={`Imagen de ${name}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <Image size={32} strokeWidth={1.5} />
        )}
      </div>
      <div className="salon-info">
        <div className="salon-name">
          {name}
          {verified && <span className="salon-verified"><BadgeCheck size={15} /></span>}
        </div>
        <div className="salon-loc">{location} · {distance}</div>
        {!!badges.length && (
          <div className="salon-badges" aria-label="Estado del salon">
            {badges.slice(0, 2).map((badge) => <span key={badge}>{badge}</span>)}
          </div>
        )}
        <div className="salon-meta">
          <span className="salon-rating">
            <Star size={13} fill="#F59E0B" color="#F59E0B" />
            {rating.toFixed(1)}
          </span>
          <span style={{ color: 'var(--fg-4)' }}>({reviews})</span>
          <span className="salon-price">Desde {desde} €</span>
        </div>
        {nextSlot && <div className="salon-slot">Próximo hueco: {nextSlot}</div>}
        <div className="salon-tags">
          {tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </div>
      </div>
    </button>
  );
}
