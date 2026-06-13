import { Link } from 'react-router-dom';

/** "Aloud" logo wordmark with a small audio-bars mark (SPEC §5). */
export function Wordmark() {
  return (
    <Link to="/" className="group flex items-center gap-2" aria-label="Aloud — home">
      <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
        <span className="w-[3px] rounded-full bg-accent" style={{ height: '40%' }} />
        <span className="w-[3px] rounded-full bg-accent" style={{ height: '90%' }} />
        <span className="w-[3px] rounded-full bg-accent" style={{ height: '60%' }} />
      </span>
      <span className="font-display text-xl text-paper">Aloud</span>
    </Link>
  );
}
