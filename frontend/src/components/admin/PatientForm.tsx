import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { AdminPatient, CreatePatientData, UpdatePatientData } from '../../types/admin';

interface PatientFormProps {
  patient?: AdminPatient | null;
  onSubmit: (data: CreatePatientData | UpdatePatientData) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export default function PatientForm({
  patient,
  onSubmit,
  onClose,
  isLoading,
}: PatientFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isEditing = !!patient;

  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setEmail(patient.email);
      setPhone(patient.phone || '');
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    if (!isEditing && !password.trim()) {
      setError('Password is required for new patients');
      return;
    }

    try {
      if (isEditing) {
        await onSubmit({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
        });
      } else {
        await onSubmit({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          phone: phone.trim() || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save patient');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Edit Patient' : 'Add Patient'}
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
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="Patient name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="patient@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone (optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="+1 234 567 8900"
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                placeholder="Min 6 characters"
              />
            </div>
          )}

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
