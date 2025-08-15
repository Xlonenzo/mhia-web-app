import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Calendar, Droplets } from 'lucide-react';

interface DataImporterProps {
  onClose: () => void;
  onImport?: (files: ImportedFile[]) => void;
}

interface ImportedFile {
  name: string;
  type: 'meteorological' | 'observed_flow' | 'streamflow' | 'groundwater' | 'basin_data';
  file: File;
  preview?: any[];
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

const DataImporter: React.FC<DataImporterProps> = ({ onClose, onImport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [importedFiles, setImportedFiles] = useState<ImportedFile[]>([]);
  const [processing, setProcessing] = useState(false);

  // File type configurations
  const fileTypeConfigs = {
    meteorological: {
      label: 'Meteorological Data',
      description: 'Daily precipitation, temperature, humidity data',
      expectedColumns: ['date', 'precipitation_mm', 'temperature_c', 'humidity_percent'],
      icon: Calendar,
      color: 'blue'
    },
    observed_flow: {
      label: 'Observed Flow Data',
      description: 'River/stream flow measurements',
      expectedColumns: ['date', 'flow_cms', 'water_level_m'],
      icon: Droplets,
      color: 'cyan'
    },
    streamflow: {
      label: 'Streamflow Data',
      description: 'Historical streamflow records',
      expectedColumns: ['date', 'discharge', 'stage'],
      icon: Droplets,
      color: 'green'
    },
    groundwater: {
      label: 'Groundwater Data',
      description: 'Groundwater level and quality measurements',
      expectedColumns: ['date', 'water_level_m', 'quality_index'],
      icon: Droplets,
      color: 'purple'
    },
    basin_data: {
      label: 'Basin Characteristics',
      description: 'Spatial data for basin parameters',
      expectedColumns: ['parameter', 'value', 'unit', 'source'],
      icon: FileText,
      color: 'orange'
    }
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Process selected files
  const handleFiles = async (files: File[]) => {
    const newFiles: ImportedFile[] = files.map(file => ({
      name: file.name,
      type: detectFileType(file.name),
      file,
      status: 'pending'
    }));

    setImportedFiles(prev => [...prev, ...newFiles]);

    // Process files
    for (const fileData of newFiles) {
      await processFile(fileData);
    }
  };

  // Detect file type based on filename
  const detectFileType = (filename: string): ImportedFile['type'] => {
    const lower = filename.toLowerCase();
    if (lower.includes('meteo') || lower.includes('weather') || lower.includes('climate')) {
      return 'meteorological';
    } else if (lower.includes('flow') || lower.includes('discharge')) {
      return 'observed_flow';
    } else if (lower.includes('stream')) {
      return 'streamflow';
    } else if (lower.includes('groundwater') || lower.includes('gw')) {
      return 'groundwater';
    } else if (lower.includes('basin') || lower.includes('characteristics')) {
      return 'basin_data';
    }
    return 'meteorological'; // Default
  };

  // Process individual file
  const processFile = async (fileData: ImportedFile) => {
    setImportedFiles(prev => 
      prev.map(f => 
        f.name === fileData.name 
          ? { ...f, status: 'processing' }
          : f
      )
    );

    try {
      // Read file content
      const content = await readFileContent(fileData.file);
      const preview = parseCSVPreview(content);
      
      // Validate file format
      const validation = validateFileFormat(fileData.type, preview);
      
      if (validation.isValid) {
        setImportedFiles(prev => 
          prev.map(f => 
            f.name === fileData.name 
              ? { ...f, status: 'success', preview: preview.slice(0, 5) }
              : f
          )
        );
      } else {
        setImportedFiles(prev => 
          prev.map(f => 
            f.name === fileData.name 
              ? { ...f, status: 'error', error: validation.error }
              : f
          )
        );
      }
    } catch (error) {
      setImportedFiles(prev => 
        prev.map(f => 
          f.name === fileData.name 
            ? { ...f, status: 'error', error: 'Failed to process file' }
            : f
        )
      );
    }
  };

  // Read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Parse CSV for preview
  const parseCSVPreview = (content: string): any[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
  };

  // Validate file format
  const validateFileFormat = (type: ImportedFile['type'], data: any[]): { isValid: boolean; error?: string } => {
    if (!data || data.length === 0) {
      return { isValid: false, error: 'File appears to be empty or invalid CSV format' };
    }

    const config = fileTypeConfigs[type];
    const headers = Object.keys(data[0] || {});
    
    // Check if at least some expected columns are present
    const hasRequiredColumns = config.expectedColumns.some(col => 
      headers.some(header => header.toLowerCase().includes(col.toLowerCase().split('_')[0]))
    );

    if (!hasRequiredColumns) {
      return { 
        isValid: false, 
        error: `Expected columns like: ${config.expectedColumns.join(', ')}. Found: ${headers.join(', ')}` 
      };
    }

    return { isValid: true };
  };

  // Change file type
  const changeFileType = (fileName: string, newType: ImportedFile['type']) => {
    setImportedFiles(prev => 
      prev.map(f => 
        f.name === fileName 
          ? { ...f, type: newType, status: 'pending' }
          : f
      )
    );
    
    // Reprocess file with new type
    const fileData = importedFiles.find(f => f.name === fileName);
    if (fileData) {
      processFile({ ...fileData, type: newType });
    }
  };

  // Remove file
  const removeFile = (fileName: string) => {
    setImportedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  // Handle import
  const handleImport = async () => {
    if (!onImport) return;
    
    const validFiles = importedFiles.filter(f => f.status === 'success');
    if (validFiles.length === 0) {
      alert('No valid files to import');
      return;
    }

    setProcessing(true);
    try {
      // In a real implementation, this would upload files to the backend
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload
      onImport(validFiles);
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Import Data</h2>
            <p className="text-gray-400">Upload CSV files for hydrological modeling</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 mb-6 transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-400/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Drop files here or click to browse
              </h3>
              <p className="text-gray-400 mb-4">
                Supports CSV files for meteorological data, streamflow, groundwater, and basin characteristics
              </p>
              <input
                type="file"
                multiple
                accept=".csv,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors inline-block"
              >
                Browse Files
              </label>
            </div>
          </div>

          {/* File List */}
          {importedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Imported Files</h3>
              
              {importedFiles.map((file, index) => {
                const config = fileTypeConfigs[file.type];
                const IconComponent = config.icon;
                
                return (
                  <div key={index} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`w-5 h-5 text-${config.color}-400`} />
                        <div>
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-gray-400 text-sm">{config.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Status Icon */}
                        {file.status === 'processing' && (
                          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                        )}
                        {file.status === 'success' && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                        
                        {/* File Type Selector */}
                        <select
                          value={file.type}
                          onChange={(e) => changeFileType(file.name, e.target.value as ImportedFile['type'])}
                          className="px-3 py-1 bg-slate-600 text-white rounded text-sm"
                          disabled={file.status === 'processing'}
                        >
                          {Object.entries(fileTypeConfigs).map(([key, config]) => (
                            <option key={key} value={key}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removeFile(file.name)}
                          className="p-1 hover:bg-slate-600 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Error Message */}
                    {file.status === 'error' && file.error && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded p-3 mb-3">
                        <p className="text-red-400 text-sm">{file.error}</p>
                      </div>
                    )}
                    
                    {/* File Preview */}
                    {file.status === 'success' && file.preview && (
                      <div className="bg-slate-800 rounded p-3">
                        <p className="text-gray-400 text-sm mb-2">Preview (first 5 rows):</p>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-600">
                                {Object.keys(file.preview[0] || {}).map((header, i) => (
                                  <th key={i} className="text-left py-1 px-2 text-gray-300 font-medium">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {file.preview.map((row, i) => (
                                <tr key={i} className="border-b border-slate-700/50">
                                  {Object.values(row).map((value, j) => (
                                    <td key={j} className="py-1 px-2 text-gray-400">
                                      {String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700">
          <div className="text-sm text-gray-400">
            {importedFiles.filter(f => f.status === 'success').length} of {importedFiles.length} files ready to import
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={processing || importedFiles.filter(f => f.status === 'success').length === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
            >
              {processing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Importing...
                </>
              ) : (
                'Import Files'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImporter;