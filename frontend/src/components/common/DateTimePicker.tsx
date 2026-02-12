import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

interface DateTimePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  label: string;
  minDate?: Date;
  id?: string;
  required?: boolean;
  placeholder?: string;
}

export default function DateTimePicker({
  selected,
  onChange,
  label,
  minDate,
  id,
  required = false,
  placeholder = 'Select date and time',
}: DateTimePickerProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <Calendar className="w-5 h-5 text-slate-400" />
        </div>
        <DatePicker
          id={id}
          selected={selected}
          onChange={onChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
          minDate={minDate}
          placeholderText={placeholder}
          required={required}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 placeholder-slate-400 transition-all cursor-pointer"
          wrapperClassName="w-full"
        />
      </div>
    </div>
  );
}
