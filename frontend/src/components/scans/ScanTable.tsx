import React, { useState } from 'react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Trash2 } from 'lucide-react'
import type { Scan } from '../../types'

const ITEMS_PER_PAGE = 20

const styles = {
  emptyCell: {
    textAlign: 'center' as const,
    padding: '4rem',
    color: 'var(--text-dim)',
  },
  deleteButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    color: 'var(--text-dim)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
  dateCell: { color: 'var(--text-main)' },
  targetCell: { fontFamily: 'monospace', color: 'var(--text-dim)' },
  countCell: { fontWeight: 600, color: 'var(--primary)' },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem',
    padding: '0 1.5rem 1.5rem 1.5rem',
  },
  pageLabel: { fontSize: '0.85rem', color: 'var(--text-dim)' },
  pageButtons: { display: 'flex', gap: '0.5rem' },
  pageButton: { padding: '0.5rem 1rem', fontSize: '0.85rem' },
  actionColumnHeader: { width: '80px' },
}

interface ScanTableProps {
  scans: Scan[]
  onScanClick: (scan: Scan) => void
  onDeleteClick: (scan: Scan) => void
}

const TableHeader: React.FC = () => (
  <thead>
    <tr>
      <th>Date / Time</th>
      <th>Target</th>
      <th>Devices Found</th>
      <th>Status</th>
      <th style={styles.actionColumnHeader} />
    </tr>
  </thead>
)

/** Displays the paginated list of scan history records. */
export const ScanTable: React.FC<ScanTableProps> = ({ scans, onScanClick, onDeleteClick }) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(scans.length / ITEMS_PER_PAGE)
  const currentScans = scans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (scans.length === 0) {
    return (
      <div className="table-container">
        <table>
          <TableHeader />
          <tbody>
            <tr>
              <td colSpan={5} style={styles.emptyCell}>
                No scan history found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table>
        <TableHeader />
        <tbody>
          {currentScans.map((scan) => (
            <tr
              key={scan.id}
              className="new-row"
              onClick={() => onScanClick(scan)}
              style={{ cursor: 'pointer' }}
            >
              <td style={styles.dateCell}>
                {new Date(scan.startedAt).toLocaleString()}
              </td>
              <td style={styles.targetCell}>{scan.target}</td>
              <td style={styles.countCell}>{scan.devicesFound}</td>
              <td>
                <Badge status={scan.status} isOnline={scan.status === 'completed'} />
              </td>
              <td>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteClick(scan) }}
                  style={styles.deleteButton}
                  title="Delete scan"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <span style={styles.pageLabel}>
            Page {currentPage} of {totalPages}
          </span>
          <div style={styles.pageButtons}>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={styles.pageButton}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={styles.pageButton}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
