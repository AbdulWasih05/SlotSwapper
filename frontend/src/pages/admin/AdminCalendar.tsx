import { useEffect, useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAdminAppointmentStore } from '../../store/admin/adminAppointmentStore';
import { useAdminPatientStore } from '../../store/admin/adminPatientStore';
import AppointmentForm from '../../components/admin/AppointmentForm';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminAppointment, CreateAppointmentData, UpdateAppointmentData } from '../../types/admin';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: AdminAppointment;
}

export default function AdminCalendar() {
  const {
    calendarAppointments,
    isLoading,
    fetchCalendarAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAdminAppointmentStore();

  const { patients, fetchPatients } = useAdminPatientStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.WEEK);
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(null);
  const [defaultStartTime, setDefaultStartTime] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAppointments = useCallback((date: Date) => {
    const start = startOfMonth(subMonths(date, 1));
    const end = endOfMonth(addMonths(date, 1));
    fetchCalendarAppointments(start.toISOString(), end.toISOString());
  }, [fetchCalendarAppointments]);

  useEffect(() => {
    loadAppointments(currentDate);
    fetchPatients(1, 100); // Load all patients for the form
  }, []);

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
    loadAppointments(newDate);
  };

  const events: CalendarEvent[] = calendarAppointments.map((apt) => ({
    id: apt.id,
    title: `${apt.title} - ${apt.user?.name || 'Unknown'}`,
    start: new Date(apt.startTime),
    end: new Date(apt.endTime),
    resource: apt,
  }));

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedAppointment(event.resource);
    setDefaultStartTime(undefined);
    setShowForm(true);
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedAppointment(null);
    setDefaultStartTime(start);
    setShowForm(true);
  };

  const handleSubmit = async (data: CreateAppointmentData | UpdateAppointmentData) => {
    setIsSubmitting(true);
    try {
      if (selectedAppointment) {
        await updateAppointment(selectedAppointment.id, data as UpdateAppointmentData);
        toast.success('Appointment updated successfully');
      } else {
        await createAppointment(data as CreateAppointmentData);
        toast.success('Appointment created successfully');
      }
      loadAppointments(currentDate);
      setShowForm(false);
      setSelectedAppointment(null);
    } catch (err) {
      // Error handled in form
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAppointment) return;

    if (!confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      await deleteAppointment(selectedAppointment.id);
      toast.success('Appointment deleted successfully');
      loadAppointments(currentDate);
      setShowForm(false);
      setSelectedAppointment(null);
    } catch (err) {
      toast.error('Failed to delete appointment');
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3b82f6';
    if (event.resource.status === 'SWAPPABLE') {
      backgroundColor = '#059669';
    } else if (event.resource.status === 'SWAP_PENDING') {
      backgroundColor = '#d97706';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-500">Manage appointments</p>
        </div>
        <button
          onClick={() => {
            setSelectedAppointment(null);
            setDefaultStartTime(new Date());
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Appointment</span>
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className="text-slate-500">Busy</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-emerald-600"></div>
          <span className="text-slate-500">Swappable</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-amber-600"></div>
          <span className="text-slate-500">Swap Pending</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="calendar-clinical h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={(v) => setView(v)}
              date={currentDate}
              onNavigate={handleNavigate}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              components={{
                toolbar: ({ label, onNavigate }) => (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onNavigate('PREV')}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onNavigate('TODAY')}
                        className="px-3 py-1 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => onNavigate('NEXT')}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="text-lg font-semibold text-slate-900">{label}</span>
                    <div className="flex items-center space-x-2">
                      {[Views.MONTH, Views.WEEK, Views.DAY].map((v) => (
                        <button
                          key={v}
                          onClick={() => setView(v)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            view === v
                              ? 'bg-teal-600 text-white'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative">
            <AppointmentForm
              appointment={selectedAppointment}
              patients={patients}
              onSubmit={handleSubmit}
              onClose={() => {
                setShowForm(false);
                setSelectedAppointment(null);
              }}
              isLoading={isSubmitting}
              defaultStartTime={defaultStartTime}
            />
            {selectedAppointment && (
              <button
                onClick={handleDelete}
                className="absolute top-4 right-16 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                title="Delete appointment"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
