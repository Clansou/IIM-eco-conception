function Loading({ text = 'Chargement...' }: { text?: string }) {
  return (
    <div className="loading-container" role="status" aria-live="polite" aria-busy="true">
      <div className="pokeball-loader" aria-hidden="true" />
      <p className="loading-text">{text}</p>
    </div>
  )
}

export default Loading
