import React from 'react';
import { Star } from 'lucide-react';

export interface RatingStarsProps {
  rating: number; // 0 to 5
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
  showCount?: boolean;
  reviewCount?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRate,
  showCount = false,
  reviewCount,
}) => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(rating);

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate && onRate(starValue)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5`}
            >
              <Star
                className={`${sizeMap[size]} ${
                  isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showCount && (
        <span className="text-xs font-medium text-slate-500 ml-1">
          {rating.toFixed(1)} {reviewCount !== undefined && `(${reviewCount})`}
        </span>
      )}
    </div>
  );
};
