import React, { useState } from 'react';
import { ServiceCategory } from '../types';
import { X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface ImportCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (categories: ServiceCategory[]) => void;
}

const ImportCategoriesModal: React.FC<ImportCategoriesModalProps> = ({ isOpen, onClose, onImport }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcess = () => {
    setError(null);
    try {
      const blocks = text.split(/\n\s*\n/);
      const newCategories: ServiceCategory[] = [];

      blocks.forEach(block => {
        // Skip empty blocks
        if (!block.trim()) return;

        // Try to find the colon separating title and content
        const colonIndex = block.indexOf(':');
        
        // If no colon, treat the whole line as a category name (if it's short) or ignore
        // For robustness, let's assume the format "Name:\nContent" or "Name: Content"
        if (colonIndex === -1) {
           // Fallback: If the block is just lines, maybe it's just a list of services? 
           // But we need a category name. 
           // Let's stick to the requirement: "Category: Services"
           return;
        }

        const name = block.substring(0, colonIndex).trim();
        const content = block.substring(colonIndex + 1).trim();

        // Skip "Categories" summary block if it's likely just a list of category names
        // Heuristic: If content has no commas but newlines, or if the name is specifically "Categories"
        if (name.toLowerCase() === 'categories') return;

        const serviceNames = content.split(/[\,\n]/).map(s => s.trim()).filter(s => s.length > 0);

        if (serviceNames.length > 0) {
          newCategories.push({
            name,
            isPrimary: false,
            services: serviceNames.map(s => ({ name: s, selected: true }))
          });
        }
      });

      if (newCategories.length === 0) {
        setError("No valid categories found. Please ensure format is 'Category Name: Service 1, Service 2...'");
        return;
      }

      onImport(newCategories);
      setText('');
      onClose();
    } catch (e) {
      setError("Failed to parse text. Please check the format.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh] border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-xl">
          <div>
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <div className="bg-brand-orange/10 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-brand-orange" />
              </div>
              Import Categories
            </h3>
            <p className="text-xs text-gray-500 mt-1 ml-11">Bulk add categories and services from text</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-auto">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 text-sm text-blue-800 flex gap-3">
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
             <div>
               <strong>Format Instructions:</strong>
               <p className="mt-1">Separate categories with double newlines. List services after the colon.</p>
               <pre className="bg-white/50 p-2 rounded mt-2 text-xs overflow-x-auto border border-blue-200">
{`Category Name:
Service 1, Service 2, Service 3

Another Category:
Service A, Service B, Service C`}
               </pre>
             </div>
          </div>

          <textarea
            className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange font-mono text-sm leading-relaxed"
            placeholder="Paste your content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          {error && (
            <div className="mt-3 text-red-600 text-sm flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex justify-between items-center">
          <div className="text-xs text-gray-400">
            Supports comma or newline separated services
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleProcess}
              className="px-5 py-2.5 bg-brand-orange text-white font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm flex items-center gap-2"
              disabled={!text.trim()}
            >
              <CheckCircle className="w-4 h-4" />
              Process Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCategoriesModal;
