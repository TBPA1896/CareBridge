import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { AuditLogItem } from '../../types/admin';
import { Shield, Clock, User, Filter } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        const res = await adminApi.getAuditLogs();
        setLogs(res);
      } catch (e) {
        console.error('Failed to load audit logs', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-navy-950">System Audit Trail</h2>
        <p className="text-xs text-slate-500">
          Immutable audit records of user authentication, clinical plan verifications, adherence logs, and alert actions
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
          No audit logs recorded yet.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{log.userEmail}</span>
                      <span className="block text-[10px] text-slate-400">({log.userRole})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="purple">{log.action}</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {log.entityName}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
