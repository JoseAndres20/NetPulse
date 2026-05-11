import React, { useEffect, useState } from 'react';
import { ScanTable } from '../components/scans/ScanTable';
import { TopologyModal } from '../components/topology/TopologyModal';
import { ErrorAlert } from '../components/domain/ErrorAlert';
import type { Scan } from '../types';
import { apiClient } from '../lib/api-client';
import { Share2, Activity } from 'lucide-react';

export const TopologyPage: React.FC = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        const res = await apiClient.get(`${apiUrl}/api/scans`);
        const json = await res.json();
        setScans(json.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scan history');
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            backgroundColor: 'var(--primary-glow)', 
            padding: '12px', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Share2 size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Network Topology</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Visualize your network infrastructure through historical scans</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ borderBottom: '1px solid var(--border)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Select a scan to view map</h2>
        </div>
        
        {error && <ErrorAlert message={error} />}
        
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Activity className="pulsing-icon" size={32} color="var(--primary)" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-dim)' }}>Loading scan history...</p>
          </div>
        ) : (
          <ScanTable 
            scans={scans} 
            onScanClick={(scan) => setSelectedScan(scan)}
          />
        )}
      </div>

      <TopologyModal 
        scan={selectedScan} 
        onClose={() => setSelectedScan(null)} 
      />
    </div>
  );
};
