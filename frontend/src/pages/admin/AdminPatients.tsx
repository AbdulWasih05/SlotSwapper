import { useEffect, useState } from 'react';
import { useAdminPatientStore } from '../../store/admin/adminPatientStore';
import DataTable from '../../components/admin/DataTable';
import PatientForm from '../../components/admin/PatientForm';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminPatient, CreatePatientData, UpdatePatientData } from '../../types/admin';

export default function AdminPatients() {
  const {
    patients,
    pagination,
    isLoading,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  } = useAdminPatientStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<AdminPatient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = () => {
    fetchPatients(1, 10, searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    fetchPatients(page, pagination?.limit || 10, searchTerm);
  };

  const handleSubmit = async (data: CreatePatientData | UpdatePatientData) => {
    setIsSubmitting(true);
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, data as UpdatePatientData);
        toast.success('Patient updated successfully');
      } else {
        await createPatient(data as CreatePatientData);
        toast.success('Patient created successfully');
      }
      setShowForm(false);
      setEditingPatient(null);
    } catch (err) {
      // Error is handled in the form
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (patient: AdminPatient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDelete = async (patient: AdminPatient) => {
    if (!confirm(`Are you sure you want to delete ${patient.name}? This will also delete all their appointments.`)) {
      return;
    }

    try {
      await deletePatient(patient.id);
      toast.success('Patient deleted successfully');
    } catch (err) {
      toast.error('Failed to delete patient');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (patient: AdminPatient) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold text-sm">
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-white">{patient.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (patient: AdminPatient) => patient.phone || '-',
    },
    {
      key: 'appointments',
      header: 'Appointments',
      render: (patient: AdminPatient) => patient._count?.events || 0,
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (patient: AdminPatient) =>
        new Date(patient.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      render: (patient: AdminPatient) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(patient);
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(patient);
            }}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Patients</h1>
          <p className="text-gray-400">Manage patient records</p>
        </div>
        <button
          onClick={() => {
            setEditingPatient(null);
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={patients}
        keyExtractor={(patient) => patient.id}
        pagination={
          pagination
            ? {
                page: pagination.page,
                totalPages: pagination.totalPages,
                onPageChange: handlePageChange,
              }
            : undefined
        }
        isLoading={isLoading}
        emptyMessage="No patients found"
      />

      {/* Form Modal */}
      {showForm && (
        <PatientForm
          patient={editingPatient}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
