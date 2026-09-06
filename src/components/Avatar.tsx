import React, { useState } from 'react';

interface AvatarProps {
  /** "Now" profile photo. Falls back to initials when absent or broken. */
  url?: string | null;
  initials: string;
  fullName?: string;
  /** Rendered diameter in px. Initials scale with it. */
  size?: number;
  /** Ring colour, used to separate overlapping avatars in a stack. */
  ringColor?: string;
  className?: string;
}

// The initials sit at ~38% of the diameter. The old hard-coded 10px label size
// was nearly half the height of a 20px circle, which is what made the batch
// initials look oversized on the album cards.
const initialsSize = (size: number) => Math.max(7, Math.round(size * 0.38));

export const Avatar: React.FC<AvatarProps> = ({
  url,
  initials,
  fullName,
  size = 20,
  ringColor,
  className = '',
}) => {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(url) && !failed;

  return (
    <span
      className={`rounded-full grid place-items-center overflow-hidden flex-shrink-0 bg-tertiary text-on-tertiary font-bold leading-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: initialsSize(size),
        boxShadow: ringColor ? `0 0 0 2px ${ringColor}` : undefined,
      }}
      title={fullName}
    >
      {showPhoto ? (
        <img
          src={url as string}
          alt={fullName ? `${fullName}'s photo` : ''}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
};

interface AvatarStackProps {
  people: { initials: string; fullName: string; nowPhotoUrl?: string | null }[];
  /** Total people represented, when it exceeds `people.length` — renders a +N chip. */
  total?: number;
  size?: number;
  ringColor?: string;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
  people,
  total,
  size = 20,
  ringColor = 'var(--color-surface-container-lowest, #fff)',
}) => {
  if (people.length === 0) return null;
  const overflow = Math.max(0, (total ?? people.length) - people.length);
  const overlap = -Math.round(size * 0.3);

  return (
    <div className="flex items-center">
      {people.map((person, i) => (
        <span key={`${person.fullName}-${i}`} style={{ marginLeft: i === 0 ? 0 : overlap }} className="flex">
          <Avatar
            url={person.nowPhotoUrl}
            initials={person.initials}
            fullName={person.fullName}
            size={size}
            ringColor={ringColor}
          />
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="rounded-full grid place-items-center bg-outline text-surface font-bold leading-none flex-shrink-0"
          style={{
            width: size,
            height: size,
            marginLeft: overlap,
            fontSize: initialsSize(size),
            boxShadow: `0 0 0 2px ${ringColor}`,
          }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
};
