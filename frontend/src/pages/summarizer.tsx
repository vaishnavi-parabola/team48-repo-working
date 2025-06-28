import React, { useState } from 'react';
import { 
  MessageCircle, Upload, Eye, Search, 
  FileText, Calendar, Users, CheckCircle, AlertCircle,
  RefreshCw, X, Package
} from 'lucide-react';
import Sidebar from '@/components/ui/sidebar';

interface WhatsAppGroup {
  id: string;
  name: string;
  hasExistingSummary: boolean;
  lastSummaryDate?: string;
  lastSummaryTime?: string;
  messageCount?: number;
  participantCount?: number;
  isProcessing?: boolean;
}

interface BulkUploadFile {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  groupName?: string;
}

const WhatsAppSummarizer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>({});
  const [uploadingGroups, setUploadingGroups] = useState<string[]>([]);
  const [bulkUploadFiles, setBulkUploadFiles] = useState<BulkUploadFile[]>([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [groups, setGroups] = useState<WhatsAppGroup[]>([
    {
      id: '1',
      name: 'GROUP A',
      hasExistingSummary: true,
      lastSummaryDate: '2024-12-28',
      lastSummaryTime: '2:30 PM',
      messageCount: 1247,
      participantCount: 15,
      isProcessing: false
    },
    {
      id: '2',
      name: 'GROUP B',
      hasExistingSummary: true,
      lastSummaryDate: '2024-12-27',
      lastSummaryTime: '4:15 PM',
      messageCount: 892,
      participantCount: 12,
      isProcessing: false
    },
    {
      id: '3',
      name: 'GROUP C',
      hasExistingSummary: true,
      lastSummaryDate: '2024-12-26',
      lastSummaryTime: '6:45 PM',
      messageCount: 345,
      participantCount: 10,
      isProcessing: false
    }
  ]);
  const [showPopup, setShowPopup] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleFileSelect = (groupId: string, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(prev => ({
        ...prev,
        [groupId]: fileArray
      }));
      setShowPopup(true); 
    }
  };

  const handleBulkFileSelect = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      const bulkFiles: BulkUploadFile[] = fileArray.map(file => ({
        file,
        id: `bulk-${Date.now()}-${Math.random()}`,
        status: 'pending',
        groupName: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ').toUpperCase()
      }));
      setBulkUploadFiles(bulkFiles);
      setShowBulkUpload(true);
    }
  };

  const removeBulkFile = (fileId: string) => {
    setBulkUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateBulkFileName = (fileId: string, newName: string) => {
    setBulkUploadFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, groupName: newName } : f)
    );
  };

  const processBulkUpload = async () => {
    setIsBulkProcessing(true);
    
    // Process files one by one with delays
    for (let i = 0; i < bulkUploadFiles.length; i++) {
      const file = bulkUploadFiles[i];
      
      // Update status to processing
      setBulkUploadFiles(prev => 
        prev.map(f => f.id === file.id ? { ...f, status: 'processing' } : f)
      );

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create new group for this file
      const newGroupId = `bulk-group-${Date.now()}-${i}`;
      const newGroup: WhatsAppGroup = {
        id: newGroupId,
        name: file.groupName || `GROUP ${groups.length + i + 1}`,
        hasExistingSummary: true,
        lastSummaryDate: new Date().toISOString().split('T')[0],
        lastSummaryTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        messageCount: 100 + Math.floor(Math.random() * 900),
        participantCount: 5 + Math.floor(Math.random() * 25),
        isProcessing: false
      };

      // Add group to the list
      setGroups(prev => [newGroup, ...prev]);

      // Update file status to completed
      setBulkUploadFiles(prev => 
        prev.map(f => f.id === file.id ? { ...f, status: 'completed' } : f)
      );
    }

    setIsBulkProcessing(false);
    
    // Auto-close after 2 seconds when all are completed
    setTimeout(() => {
      setShowBulkUpload(false);
      setBulkUploadFiles([]);
    }, 2000);
  };

  const handleGenerateSummary = (groupId: string) => {
    setShowPopup(false);
    const uploadedFiles = selectedFiles[groupId] || [];
    setUploadingGroups(prev => [...prev, groupId]);
    
    setTimeout(() => {
      const dummySummary = `
        **Summary for Uploaded Files (Generated on June 28, 2025, 11:11 PM IST):**
        - Total files processed: ${uploadedFiles.length}
        - Key topics discussed: Team coordination, project updates, and scheduling.
        - Action items: Follow up on task deadlines by July 5, 2025.
        - Sentiment: Mostly positive with some urgent concerns.
      `;
      setSummary(dummySummary);
      
      setGroups(prev =>
        prev.map(g =>
          g.id === groupId ? {
            ...g,
            hasExistingSummary: true,
            lastSummaryDate: new Date().toISOString().split('T')[0],
            lastSummaryTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            messageCount: 100 + Math.floor(Math.random() * 900),
            participantCount: 10 + Math.floor(Math.random() * 20)
          } : g
        )
      );
      setUploadingGroups(prev => prev.filter(id => id !== groupId));
    }, 2000);
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-500 bg-gray-100';
      case 'processing': return 'text-blue-500 bg-blue-100';
      case 'completed': return 'text-green-500 bg-green-100';
      case 'error': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp Group Summarizer</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span>Communication Analysis</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Bulk Upload Button */}
              <input
                type="file"
                accept=".txt,.zip"
                multiple
                className="hidden"
                id="bulk-upload"
                onChange={(e) => handleBulkFileSelect(e.target.files)}
              />
              <label
                htmlFor="bulk-upload"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>Bulk Upload</span>
              </label>
              
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {filteredGroups.length === 0 && !selectedFiles['upload-card'] ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
                <p className="text-gray-500">Try adjusting your search terms or add a new group.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Upload New Summary Card */}
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:shadow-md transition-all duration-200">
                  <div className="p-6 flex flex-col items-center justify-center h-full">
                    <input
                      type="file"
                      accept=".txt,.zip"
                      multiple
                      className="hidden"
                      id="upload-card-file"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          const newGroupId = `new-${Date.now()}`;
                          setSelectedFiles(prev => ({ ...prev, [newGroupId]: Array.from(files) }));
                          setGroups(prev => [
                            { id: newGroupId, name: `GROUP ${prev.length + 1}`, hasExistingSummary: false, isProcessing: false },
                            ...prev
                          ]);
                        }
                      }}
                    />
                    <label
                      htmlFor="upload-card-file"
                      className="cursor-pointer flex flex-col items-center space-y-2 text-center"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedFiles['upload-card'] && selectedFiles['upload-card'].length > 0
                          ? selectedFiles['upload-card'].map(f => f.name).join(', ')
                          : 'Click to upload or drag and drop'
                        }
                      </span>
                      <span className="text-xs text-gray-500">TXT or ZIP files only (multiple allowed)</span>
                    </label>
                    {selectedFiles['upload-card'] && selectedFiles['upload-card'].length > 0 && (
                      <button
                        onClick={() => handleGenerateSummary(`new-${Date.now()}`)}
                        className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Generate Summary</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Existing Groups */}
                {filteredGroups.map((group) => (
                  <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              {group.hasExistingSummary ? (
                                <span className="flex items-center space-x-1">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  <span>Summary Available</span>
                                </span>
                              ) : (
                                <span className="flex items-center space-x-1">
                                  <AlertCircle className="w-3 h-3 text-orange-500" />
                                  <span>No Summary</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {uploadingGroups.includes(group.id) && (
                          <div className="animate-spin">
                            <RefreshCw className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      {group.hasExistingSummary && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Messages</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {group.messageCount?.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Participants</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {group.participantCount}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Last Summary Info */}
                      {group.hasExistingSummary && group.lastSummaryDate && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-6">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Last Summary</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-blue-700">
                            <span>{group.lastSummaryDate}</span>
                            <span>•</span>
                            <span>{group.lastSummaryTime}</span>
                          </div>
                        </div>
                      )}

                      {/* File Upload Section */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload WhatsApp Chat Export
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            accept=".txt,.zip"
                            multiple
                            className="hidden"
                            id={`file-${group.id}`}
                            onChange={(e) => handleFileSelect(group.id, e.target.files)}
                          />
                          <label
                            htmlFor={`file-${group.id}`}
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {selectedFiles[group.id] && selectedFiles[group.id].length > 0
                                ? selectedFiles[group.id].map(f => f.name).join(', ')
                                : 'Click to upload or drag and drop'
                              }
                            </span>
                            <span className="text-xs text-gray-500">TXT or ZIP files only (multiple allowed)</span>
                          </label>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {group.hasExistingSummary && (
                          <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2">
                            <Eye className="w-4 h-4" />
                            <span>View Summary</span>
                          </button>
                        )}
                        {selectedFiles[group.id] && selectedFiles[group.id].length > 0 && (
                          <button
                            onClick={() => handleGenerateSummary(group.id)}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Generate Summary</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Package className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Bulk Upload ({bulkUploadFiles.length} files)</h3>
                </div>
                <button
                  onClick={() => setShowBulkUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isBulkProcessing}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* File List */}
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="space-y-3">
                  {bulkUploadFiles.map((bulkFile) => (
                    <div key={bulkFile.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{bulkFile.file.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(bulkFile.status)}`}>
                            {bulkFile.status.charAt(0).toUpperCase() + bulkFile.status.slice(1)}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={bulkFile.groupName || ''}
                          onChange={(e) => updateBulkFileName(bulkFile.id, e.target.value)}
                          placeholder="Group name..."
                          className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                          disabled={bulkFile.status !== 'pending'}
                        />
                      </div>
                      {bulkFile.status === 'pending' && !isBulkProcessing && (
                        <button
                          onClick={() => removeBulkFile(bulkFile.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {bulkFile.status === 'processing' && (
                        <div className="animate-spin">
                          <RefreshCw className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      {bulkFile.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {bulkUploadFiles.filter(f => f.status === 'completed').length} of {bulkUploadFiles.length} processed
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowBulkUpload(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={isBulkProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processBulkUpload}
                    disabled={isBulkProcessing || bulkUploadFiles.length === 0}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isBulkProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        <span>Process All</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Single Upload Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
              <ul className="mb-4 space-y-2">
                {Object.values(selectedFiles).flat().map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">{file.name}</li>
                ))}
              </ul>
              <button
                onClick={() => handleGenerateSummary(Object.keys(selectedFiles)[0])}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate Summary</span>
              </button>
              {summary && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Summary</h4>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">{summary}</pre>
                </div>
              )}
              <button
                onClick={() => setShowPopup(false)}
                className="mt-4 w-full bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppSummarizer;