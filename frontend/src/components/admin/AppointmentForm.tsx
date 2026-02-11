import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { AdminAppointment, AdminPatient, CreateAppointmentData, UpdateAppointmentData } from '../../types/admin';

interface AppointmentFormProps {
  appointment?: AdminAppointment | null;
  patients: AdminPatient[];
  onSubmit: (data: CreateAppointmentData | UpdateAppointmentData) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
  defaultStartTime?: Date;
}

export default function AppointmentForm({
  appointment,
  patients,
  onSubmit,
  onClose,
  isLoading,
  defaultStartTime,
}: AppointmentFormProps) {
  const [userId, setUserId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState<'BUSY' | 'SWAPPABLE'>('BUSY');
  const [error, setError] = useState('');

  const isEditing = !!appointment;

  useEffect(() => {
    if (appointment) {
      setUserId(appointment.userId);
      setTitle(appointment.title);
      setStartTime(formatDateTimeLocal(new Date(appointment.startTime)));
      setEndTime(formatDateTimeLocal(new Date(appointment.endTime)));
      setStatus(appointment.status === 'SWAP_PENDING' ? 'BUSY' : appointment.status);
    } else if (defaultStartTime) {
      setStartTime(formatDateTimeLocal(defaultStartTime));
      const end = new Date(defaultStartTime);
      end.setHours(end.getHours() + 1);
      setEndTime(formatDateTimeLocal(end));
    }
  }, [appointment, defaultStartTime]);

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!isEditing && !userId) {
      setError('Patient is required');
      return;
    }

    if (!startTime || !endTime) {
      setError('Start and end times are required');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      setError('End time must be after start time');
      return;
    }

    try {
      if (isEditing) {
        await onSubmit({
          title: title.trim(),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          status,
          ...(userId && { userId: Number(userId) }),
        });
      } else {
        await onSubmit({
          userId: Number(userId),
          title: title.trim(),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          status,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save appointment');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Edit Appointment' : 'Add Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Patient
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="">Select a patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="Appointment title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'BUSY' | 'SWAPPABLE')}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="BUSY">Busy</option>
              <option value="SWAPPABLE">Swappable</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update' : 'Create'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
