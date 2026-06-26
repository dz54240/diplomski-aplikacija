export interface AvatarProps {
  name?: string;
  size?: number;
}

export function Avatar({ name = 'Korisnik', size = 28 }: AvatarProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-ink text-white font-medium"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initials}
    </span>
  );
}
