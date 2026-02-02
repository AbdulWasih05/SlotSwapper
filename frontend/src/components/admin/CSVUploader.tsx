import { useState, useRef } from 'react';
import { Upload, FileText, X, Check, AlertCircle, Download } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import type { CSVAppointmentRow, ImportResult } from '../../types/admin';

interface CSVUploaderProps {
  onSuccess?: () => void;
}

export default function CSVUploader({ onSuccess }: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVAppointmentRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (content: string): CSVAppointmentRow[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const data: CSVAppointmentRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      if (values.length >= 4) {
        const row: any = {};
        headers.forEach((header, index) => {
          if (header === 'patientemail') row.patientEmail = values[index];
          else if (header === 'title') row.title = values[index];
          else if (header === 'starttime') row.startTime = values[index];
          else if (header === 'endtime') row.endTime = values[index];
        });
        if (row.patientEmail && row.title && row.startTime && row.endTime) {
          data.push(row);
        }
      }
    }

    return data;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError('');
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const data = parseCSV(content);
      if (data.length === 0) {
        setError('No valid data found in CSV file');
        setParsedData([]);
      } else {
        setParsedData(data);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    setIsUploading(true);
    setError('');

    try {
      const response = await adminApi.importAppointments(parsedData);
      setResult(response.results);
      if (response.results.success > 0) {
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to import appointments');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setParsedData([]);
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    window.open(adminApi.getImportTemplateDownloadUrl(), '_blank');
  };

  return (
    <div className="bg-[#111111] rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Import Appointments</h3>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300"
        >
          <Download className="w-4 h-4" />
          <span>Download Template</span>
        </button>
      </div>

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-600 transition-colors"
        >
          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-600">CSV file only</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">{parsedData.length} rows found</p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview */}
          {parsedData.length > 0 && !result && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-3 py-2 text-left text-gray-400">Patient Email</th>
                    <th className="px-3 py-2 text-left text-gray-400">Title</th>
                    <th className="px-3 py-2 text-left text-gray-400">Start</th>
                    <th className="px-3 py-2 text-left text-gray-400">End</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b border-gray-800/50">
                      <td className="px-3 py-2 text-gray-300">{row.patientEmail}</td>
                      <td className="px-3 py-2 text-gray-300">{row.title}</td>
                      <td className="px-3 py-2 text-gray-400 text-xs">{row.startTime}</td>
                      <td className="px-3 py-2 text-gray-400 text-xs">{row.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 5 && (
                <p className="text-sm text-gray-500 mt-2 px-3">
                  ... and {parsedData.length - 5} more rows
                </p>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <Check className="w-5 h-5" />
                  <span>{result.success} imported</span>
                </div>
                {result.failed > 0 && (
                  <div className="flex items-center space-x-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{result.failed} failed</span>
                  </div>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-400 font-medium mb-2">Errors:</p>
                  <ul className="text-sm text-red-300 space-y-1">
                    {result.errors.slice(0, 5).map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>... and {result.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          {!result && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || parsedData.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isUploading ? (
                  <span>Importing...</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Import {parsedData.length} rows</span>
                  </>
                )}
              </button>
            </div>
          )}

          {result && (
            <button
              onClick={handleClear}
              className="w-full px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              Import Another File
            </button>
          )}
        </div>
      )}
    </div>
  );
}
