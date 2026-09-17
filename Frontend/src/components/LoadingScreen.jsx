import './loading-screen.scss';

export default function LoadingScreen({ label = 'Loading...' }) {
  return <main className="loading-screen" role="status" aria-live="polite">
    <span className="loading-screen__spinner" aria-hidden="true" />
    <p>{label}</p>
  </main>;
}
