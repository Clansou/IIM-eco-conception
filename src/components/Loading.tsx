function Loading({ text = 'Chargement...' }: { text?: string }) {
  return (
    <div className="loading-container">
      <div className="pokeball-loader" />
      <p className="loading-text">{text}</p>
    </div>
  )
}

export default Loading
