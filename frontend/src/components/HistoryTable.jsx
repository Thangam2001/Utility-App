import './HistoryTable.css'

export const HistoryTable = ({ items = [] }) => {
  if (items.length === 0) {
    return (
      <div className="history-empty">
        <p>No history yet. Process an image to see your activity here.</p>
      </div>
    )
  }

  return (
    <div className="history-table-wrapper">
      <table className="history-table">
        <thead>
          <tr>
            <th>File name</th>
            <th>Operation</th>
            <th>Date</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <span className="file-name">{item.fileName}</span>
              </td>
              <td>
                <span className="chip">{item.operation}</span>
              </td>
              <td>{new Date(item.performedAt).toLocaleString()}</td>
              <td>
                {item.resultUrl ? (
                  <a href={item.resultUrl} target="_blank" rel="noreferrer">
                    Download
                  </a>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


