import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Calendar, Clock, MapPin, Stethoscope, User } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const PatientAppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const res = await api.get(`/appointments/patient/${user.id}`);
        setAppointments(res.data);
      } catch (e) {
        console.error('Failed to load appointments', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAppointments();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-navy-950">Follow-Up Appointments</h2>
        <p className="text-xs text-slate-500">
          Scheduled hospital and outpatient check-ups explicitly entered in your discharge plan
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
          No appointments currently scheduled. Check with your attending physician.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{appt.doctorName}</h3>
                    <p className="text-xs text-slate-500">{appt.department}</p>
                  </div>
                </div>
                <Badge variant={appt.status === 'SCHEDULED' ? 'info' : 'success'}>
                  {appt.status}
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Date & Time:{' '}
                    <strong>{new Date(appt.scheduledDateTime).toLocaleString()}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Location: {appt.clinicLocation}</span>
                </div>
              </div>

              {appt.purpose && (
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Purpose:</span> {appt.purpose}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
