/** Renders a string, turning **text** into a highlighted <b>. */
export default function Rich({ text }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? (
      <b key={i} className="highlight font-semibold">
        {part}
      </b>
    ) : (
      part
    ),
  )
}
