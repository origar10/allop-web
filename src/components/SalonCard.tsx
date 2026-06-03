import { BadgeCheck, Image, Star } from 'lucide-react';

interface SalonCardProps {
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  desde: number;
  tags: string[];
  imageClass?: string;
  verified?: boolean;
  onSelect: () => void;
}

export default function SalonCard({
  name,
  location,
  distance,
  rating,
  reviews,
  desde,
  tags,
  imageClass = '',
  verified = true,
  onSelect,
}: SalonCardProps) {
  return (
    <button className="salon-card" type="button" onClick={onSelect} aria-label={`Abrir ficha de ${name}`}>
      <div className={`salon-img ${imageClass}`}>
        <Image size={32} strokeWidth={1.5} />
      </div>
      <div className="salon-info">
        <div className="salon-name">
          {name}
          {verified && <span className="salon-verified"><BadgeCheck size={15} /></span>}
        </div>
        <div className="salon-loc">{location} · {distance}</div>
        <div className="salon-meta">
          <span className="salon-rating">
            <Star size={13} fill="#F59E0B" color="#F59E0B" />
            {rating.toFixed(1)}
          </span>
          <span style={{ color: 'var(--fg-4)' }}>({reviews})</span>
          <span className="salon-price">Desde {desde} €</span>
        </div>
        <div className="salon-tags">
          {tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </div>
      </div>
    </button>
  );
}
