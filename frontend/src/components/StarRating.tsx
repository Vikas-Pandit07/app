import { Star } from '../lib/icons';

interface StarRatingProps {
  rating: number;
  reviews?: number;
  size?: number;
}

export default function StarRating({ rating, reviews, size = 14 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 text-yellow-400">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            size={size}
            className={value <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}
          />
        ))}
      </div>
      <span className="text-xs text-text-muted">
        {rating.toFixed(1)}{typeof reviews === 'number' ? ` (${reviews})` : ''}
      </span>
    </div>
  );
}
