import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { User, Role } from '../../types/auth';
import { Badge } from '../../components/common/Badge';
import { Users, Search, Shield, Ban, CheckCircle, Mail, Phone } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getUsers(roleFilter === 'ALL' ? undefined : roleFilter);
      setUsers(res);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminApi.updateUserStatus(userId, newStatus);
      setSuccessMessage(`User status changed to ${newStatus}.`);
      loadUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e) {
      console.error('Failed to update user status', e);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="purple">Administrator</Badge>;
      case 'CLINICIAN':
        return <Badge variant="success">Clinician / Doctor</Badge>;
      case 'CAREGIVER':
        return <Badge variant="warning">Caregiver</Badge>;
      default:
        return <Badge variant="info">Patient</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy-950">User Directory & Roles</h2>
          <p className="text-xs text-slate-500">
            System account provisioning, role-based authorization, and account status controls
          </p>
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'PATIENT', 'CAREGIVER', 'CLINICIAN', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                roleFilter === r
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500 shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
          No users found.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-bold flex items-center justify-center shrink-0">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <span>{u.fullName}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{getRoleBadge(u.role)}</td>
                    <td className="py-4 px-4 text-slate-500">{u.phone || '—'}</td>
                    <td className="py-4 px-4">
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleStatusToggle(u.id, u.status)}
                          className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
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
