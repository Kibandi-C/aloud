import { Link } from 'react-router-dom';

/** Landing page stub — full marketing sections land in Stage 5. */
export default function Landing() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-24 text-center">
      <h1 className="max-w-3xl font-display text-4xl leading-tight text-paper sm:text-6xl">
        Turn anything you read into something you hear.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        Paste, upload, or photograph text. Press play. Listen along — free, entirely in your
        browser. No signup.
      </p>
      <Link
        to="/read"
        className="mt-10 rounded-card bg-accent px-6 py-3 text-base font-medium text-accent-ink transition-opacity hover:opacity-90"
      >
        Start listening
      </Link>
    </section>
  );
}
