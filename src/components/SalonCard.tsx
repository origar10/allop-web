import { BadgeCheck, Image, Star } from 'lucide-react';

interface SalonCardProps {
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  desde: number;
  tags: string[];
  verified?: boolean;
}

export default function SalonCard({ name, location, distance, rating, reviews, desde, tags, verified = true }: SalonCardProps) {
  return (
    <div className="salon-card">
      <div className="salon-img">
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
          {tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>
    </div>
  );
}
