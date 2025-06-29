import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  X, 
  CheckCircle, 
  FileText, 
  Calendar,
  MessageSquare,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

const FileUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [rulesPrompt, setRulesPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Only allow txt and json files
      if (file.type === 'text/plain' || file.type === 'application/json' || 
          file.name.endsWith('.txt') || file.name.endsWith('.json')) {
        
        const fileContent = await readFileContent(file);
        
        newFiles.push({
          id: `${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          content: fileContent
        });
      }
    }

    // Simulate upload delay
    setTimeout(() => {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setIsUploading(false);
    }, 1500);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.readAsText(file);
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadComplete(true);
    }, 2000);
  };

  const handleGenerateSummary = () => {
    setShowSummaryForm(true);
  };

  const handleSubmitSummary = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessingComplete(true);
    }, 3000);
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Initial upload state
  if (!uploadComplete && !showSummaryForm && !processingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">File Upload</h1>
            <p className="text-lg text-gray-600">Upload your TXT or JSON files to get started</p>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".txt,.json,text/plain,application/json"
                multiple
                className="hidden"
                id="file-upload"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-4"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isUploading ? 'Uploading files...' : 'Choose files to upload'}
                  </h3>
                  <p className="text-gray-600">
                    Drag and drop or click to select TXT and JSON files
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Multiple files supported
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* File Preview */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Uploaded Files ({uploadedFiles.length})</h2>
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{file.name}</h3>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Upload Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleUpload}
                  disabled={isUploading || uploadedFiles.length === 0}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto text-lg font-semibold"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Upload Files</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Upload success state
  if (uploadComplete && !showSummaryForm && !processingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Files Uploaded Successfully!</h1>
            <p className="text-lg text-gray-600 mb-8">
              All {uploadedFiles.length} files have been uploaded and processed successfully.
            </p>
            <button
              onClick={handleGenerateSummary}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto text-lg font-semibold"
            >
              <span>Generate Summary</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Summary form state
  if (showSummaryForm && !processingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Generate Summary</h1>
            <p className="text-lg text-gray-600">Configure your summary parameters</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-8">
              {/* Date Range */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Date Range
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Rules/Prompt */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  <MessageSquare className="w-5 h-5 inline mr-2" />
                  Rules / Prompt
                </label>
                <textarea
                  value={rulesPrompt}
                  onChange={(e) => setRulesPrompt(e.target.value)}
                  placeholder="Enter your summarization rules or prompts here..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Provide specific instructions for how you want the summary to be generated.
                </p>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-4">
                <button
                  onClick={handleSubmitSummary}
                  disabled={isProcessing || !dateRange.start || !dateRange.end || !rulesPrompt.trim()}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto text-lg font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Summary</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Processing complete state
  if (processingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Processing Completed!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Your summary has been generated successfully and is ready to view.
            </p>
            <button
              onClick={navigateToDashboard}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 mx-auto text-lg font-semibold"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FileUploadPage;