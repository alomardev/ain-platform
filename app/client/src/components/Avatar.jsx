import { useState } from 'react';
import GenderIcon from './GenderIcon';

// Volunteer photo, falling back to the gender icon when there is no photo or it fails to load.
export default function Avatar({ photo, gender, alt = '', className = 'h-10 w-10', iconClassName = 'h-5 w-5' }) {
  const [failed, setFailed] = useState(null);
  if (photo && failed !== photo) {
    return (
      <img
        src={photo}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(photo)}
        className={`${className} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div className={`${className} rounded-full ain-accent-bg-soft ain-accent-text flex items-center justify-center shrink-0`}>
      <GenderIcon gender={gender} className={iconClassName} />
    </div>
  );
}
