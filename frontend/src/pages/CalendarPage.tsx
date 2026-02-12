import { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useEventStore } from '../store/eventStore';
import { Event as EventType } from '../types';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import DateTimePicker from '../components/common/DateTimePicker';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

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
  resource: EventType;
}

export default function CalendarPage() {
  const { events, fetchEvents, createEvent, updateEvent, deleteEvent, toggleEventStatus } = useEventStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    startTime: null as Date | null,
    endTime: null as Date | null,
  });

  // Responsive default view
  const defaultView = typeof window !== 'undefined' && window.innerWidth < 640 ? Views.DAY : Views.WEEK;

  useEffect(() => {
    fetchEvents();
  }, []);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      resource: event,
    }));
  }, [events]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      startTime: start,
      endTime: end,
    });
    setShowModal(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setFormData({
      title: event.resource.title,
      startTime: new Date(event.resource.startTime),
      endTime: new Date(event.resource.endTime),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startTime || !formData.endTime) {
      toast.error('Please select both start and end times');
      return;
    }

    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, {
          title: formData.title,
          startTime: formData.startTime.toISOString(),
          endTime: formData.endTime.toISOString(),
        });
        toast.success('Event updated successfully', {
          id: `update-${selectedEvent.id}`,
        });
      } else {
        await createEvent({
          title: formData.title,
          startTime: formData.startTime.toISOString(),
          endTime: formData.endTime.toISOString(),
        });
        toast.success('Event created successfully', {
          id: 'create-event',
        });
      }
      setShowModal(false);
      setFormData({ title: '', startTime: null, endTime: null });
    } catch (error) {
      toast.error('Failed to save event');
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      await deleteEvent(selectedEvent.id);
      toast.success('Event deleted successfully', {
        id: `delete-${selectedEvent.id}`,
      });
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedEvent) return;
    const newStatus = selectedEvent.status === 'BUSY' ? 'SWAPPABLE' : 'BUSY';
    try {
      await toggleEventStatus(selectedEvent.id, newStatus);
      const message = newStatus === 'SWAPPABLE'
        ? 'Event is now available for swapping!'
        : 'Event marked as BUSY';
      toast.success(message, {
        id: `status-${selectedEvent.id}`,
      });
      setSelectedEvent({ ...selectedEvent, status: newStatus });
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource.status;
    let backgroundColor = '#3b82f6'; // blue for BUSY
    if (status === 'SWAPPABLE') backgroundColor = '#059669'; // emerald
    if (status === 'SWAP_PENDING') backgroundColor = '#d97706'; // amber

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Calendar</h1>
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                <span className="text-xs sm:text-sm text-slate-500">Busy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
                <span className="text-xs sm:text-sm text-slate-500">Swappable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-amber-600 rounded-sm"></div>
                <span className="text-xs sm:text-sm text-slate-500">Pending</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedEvent(null);
              setFormData({ title: '', startTime: null, endTime: null });
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white
                       px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg text-sm sm:text-base font-medium
                       hover:bg-teal-700 active:bg-teal-800 transition-all shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>New Event</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-3 sm:p-4 lg:p-6 calendar-clinical" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            defaultView={defaultView}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            selectable
            popup
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedEvent ? 'Edit Event' : 'New Event'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 placeholder-slate-400 transition-all"
                  placeholder="Event title"
                />
              </div>

              <DateTimePicker
                label="Start Time"
                selected={formData.startTime}
                onChange={(date) => setFormData({ ...formData, startTime: date })}
                required
                id="startTime"
              />

              <DateTimePicker
                label="End Time"
                selected={formData.endTime}
                onChange={(date) => setFormData({ ...formData, endTime: date })}
                minDate={formData.startTime || undefined}
                required
                id="endTime"
              />

              {selectedEvent && (
                <div className="border-t border-slate-200 pt-5">
                  <p className="text-sm font-medium text-slate-700 mb-2">Status</p>
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    disabled={selectedEvent.status === 'SWAP_PENDING'}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      selectedEvent.status === 'SWAPPABLE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : selectedEvent.status === 'SWAP_PENDING'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed'
                        : 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                    }`}
                  >
                    {selectedEvent.status === 'SWAP_PENDING'
                      ? 'Swap Pending'
                      : selectedEvent.status === 'SWAPPABLE'
                      ? 'Click to mark as BUSY'
                      : 'Click to mark as SWAPPABLE'}
                  </button>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 active:bg-teal-800 transition-all shadow-sm"
                >
                  {selectedEvent ? 'Update' : 'Create'}
                </button>
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-50 text-red-600 border border-red-200 py-3 px-4 rounded-lg font-medium hover:bg-red-100 transition-all"
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
