import { useEffect, useState } from 'react';
import { useAdminSettingsStore } from '../../store/admin/adminSettingsStore';
import CSVUploader from '../../components/admin/CSVUploader';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ClinicSettings } from '../../types/admin';

export default function AdminSettings() {
  const { settings, clinic, isLoading, fetchSettings, updateSettings, updateClinicName } =
    useAdminSettingsStore();

  const [clinicName, setClinicName] = useState('');
  const [localSettings, setLocalSettings] = useState<ClinicSettings>({
    swapApprovalMode: 'auto',
    swapWindowHours: 48,
    allowSameDaySwaps: false,
    maxSwapsPerDay: 5,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingClinic, setIsSavingClinic] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
    if (clinic) {
      setClinicName(clinic.name);
    }
  }, [settings, clinic]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClinicName = async () => {
    if (!clinicName.trim()) {
      toast.error('Clinic name is required');
      return;
    }
    setIsSavingClinic(true);
    try {
      await updateClinicName(clinicName.trim());
      toast.success('Clinic name updated');
    } catch (err) {
      toast.error('Failed to update clinic name');
    } finally {
      setIsSavingClinic(false);
    }
  };

  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Configure your clinic settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinic Settings */}
        <div className="space-y-6">
          {/* Clinic Name */}
          <div className="bg-[#111111] rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Clinic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Clinic Name
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your Clinic Name"
                  />
                  <button
                    onClick={handleSaveClinicName}
                    disabled={isSavingClinic}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSavingClinic ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Swap Settings */}
          <div className="bg-[#111111] rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Swap Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Swap Approval Mode
                </label>
                <select
                  value={localSettings.swapApprovalMode}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      swapApprovalMode: e.target.value as 'auto' | 'manual',
                    })
                  }
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="auto">Automatic (patients can swap directly)</option>
                  <option value="manual">Manual (admin approval required)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Choose whether swaps are automatically processed or require admin approval
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Swap Window (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={localSettings.swapWindowHours}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      swapWindowHours: parseInt(e.target.value) || 48,
                    })
                  }
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum hours before appointment that swaps are allowed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Swaps Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={localSettings.maxSwapsPerDay}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      maxSwapsPerDay: parseInt(e.target.value) || 5,
                    })
                  }
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum number of swaps a patient can make per day
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Allow Same-Day Swaps</p>
                  <p className="text-xs text-gray-500">
                    Allow patients to swap appointments on the same day
                  </p>
                </div>
                <button
                  onClick={() =>
                    setLocalSettings({
                      ...localSettings,
                      allowSameDaySwaps: !localSettings.allowSameDaySwaps,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.allowSameDaySwaps ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.allowSameDaySwaps ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div>
          <CSVUploader />
        </div>
      </div>
    </div>
  );
}
