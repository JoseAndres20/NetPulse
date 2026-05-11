import React, { useEffect, useState } from 'react';
import { NetworkMap } from './NetworkMap';
import { ErrorAlert } from '../domain/ErrorAlert';
import type { Scan, Device } from '../../types';
import { apiClient } from '../../lib/api-client';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

interface TopologyModalProps {
  scan: Scan | null;
  onClose: () => void;
}

export const TopologyModal: React.FC<TopologyModalProps> = ({ scan, onClose }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scan) return;
    
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        const res = await apiClient.get(`${apiUrl}/api/scans/${scan.id}/devices`);
        const json = await res.json();
        setDevices(json.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load devices');
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, [scan]);

  return (
    <Modal 
      isOpen={!!scan} 
      onClose={onClose} 
      title={`Network Topology: ${scan?.target}`}
    >
      <div style={{ minHeight: '500px' }}>
        {error && <ErrorAlert message={error} />}
        
        {loading ? (
          <div style={{ height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <Spinner size={40} color="var(--primary)" />
            <p style={{ color: 'var(--text-dim)' }}>Generating topology map...</p>
          </div>
        ) : devices.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                💡 <b>Tip:</b> Drag nodes to rearrange. The center node is the <b>Gateway</b>.
              </p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', background: 'var(--bg-surface)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }}></div>
                  <span>Known</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 5px #ef4444' }}></div>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>New/Unknown (Alert)</span>
                </div>
              </div>
            </div>
            <NetworkMap devices={devices} />
          </div>
        ) : (
          <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
            No devices found in this scan to map.
          </div>
        )}
      </div>
    </Modal>
  );
};
