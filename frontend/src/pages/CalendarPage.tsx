import { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
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
        ? '✨ Event is now available for swapping!'
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
    if (status === 'SWAPPABLE') backgroundColor = '#10b981'; // green
    if (status === 'SWAP_PENDING') backgroundColor = '#f59e0b'; // orange

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
    <div className="p-8 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">My Calendar</h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-400">Busy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-400">Swappable</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm text-gray-400">Swap Pending</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedEvent(null);
              setFormData({ title: '', startTime: null, endTime: null });
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>New Event</span>
          </button>
        </div>

        <div className="bg-[#111111] rounded-xl shadow-lg border border-gray-800 p-6 calendar-dark" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            selectable
            popup
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] rounded-2xl max-w-md w-full p-6 border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedEvent ? 'Edit Event' : 'New Event'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
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
                <div className="border-t border-gray-800 pt-5">
                  <p className="text-sm font-medium text-gray-300 mb-2">Status</p>
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    disabled={selectedEvent.status === 'SWAP_PENDING'}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      selectedEvent.status === 'SWAPPABLE'
                        ? 'bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-600/30'
                        : selectedEvent.status === 'SWAP_PENDING'
                        ? 'bg-orange-600/20 text-orange-400 border border-orange-600/50 cursor-not-allowed'
                        : 'bg-blue-600/20 text-blue-400 border border-blue-600/50 hover:bg-blue-600/30'
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
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  {selectedEvent ? 'Update' : 'Create'}
                </button>
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
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
