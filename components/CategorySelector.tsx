import React from 'react';
import { ServiceCategory, ServiceItem } from '../types';
import { Check, Plus, Trash2, Star } from 'lucide-react';

interface CategorySelectorProps {
  categories: ServiceCategory[];
  onChange: (categories: ServiceCategory[]) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, onChange }) => {

  const toggleService = (catIndex: number, serviceIndex: number) => {
    const newCats = [...categories];
    newCats[catIndex].services[serviceIndex].selected = !newCats[catIndex].services[serviceIndex].selected;
    onChange(newCats);
  };

  const removeCategory = (index: number) => {
    const newCats = [...categories];
    newCats.splice(index, 1);
    onChange(newCats);
  };

  const togglePrimary = (index: number) => {
    const newCats = categories.map((c, i) => ({
      ...c,
      isPrimary: i === index
    }));
    onChange(newCats);
  };

  const addCategory = () => {
    const newCategory: ServiceCategory = {
      name: "New Category",
      isPrimary: false,
      services: []
    };
    onChange([...categories, newCategory]);
  };

  const updateCategoryName = (index: number, name: string) => {
    const newCats = [...categories];
    newCats[index].name = name;
    onChange(newCats);
  };

  const addService = (catIndex: number) => {
    const newCats = [...categories];
    newCats[catIndex].services.push({ name: "New Service", selected: true });
    onChange(newCats);
  };

  const updateServiceName = (catIndex: number, serviceIndex: number, name: string) => {
    const newCats = [...categories];
    newCats[catIndex].services[serviceIndex].name = name;
    onChange(newCats);
  };

  const removeService = (catIndex: number, serviceIndex: number) => {
    const newCats = [...categories];
    newCats[catIndex].services.splice(serviceIndex, 1);
    onChange(newCats);
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800 mb-4">
        <strong>AI Scanned Results:</strong> We found {categories.reduce((acc, c) => acc + c.services.length, 0)} potential services across {categories.length} categories. Please uncheck any that do not apply.
      </div>

      <div className="grid grid-cols-1 gap-6">
        {categories.map((category, catIndex) => (
          <div key={catIndex} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${category.isPrimary ? 'border-brand-orange ring-1 ring-brand-orange shadow-md' : 'border-gray-200'}`}>
            {/* Category Header */}
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => togglePrimary(catIndex)}
                  className={`p-1.5 rounded-full transition-colors ${category.isPrimary ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                  title="Set as Primary Category"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                  className="font-semibold text-gray-900 text-lg bg-transparent border-none focus:ring-0 p-0 w-full hover:bg-white focus:bg-white transition-colors rounded px-2"
                />
                {category.isPrimary && <span className="text-xs font-bold text-brand-orange bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">Primary GBP Category</span>}
              </div>
              <button onClick={() => removeCategory(catIndex)} className="text-gray-400 hover:text-red-500 p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Services Grid */}
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.services.map((service, servIndex) => (
                  <div
                    key={servIndex}
                    className={`
                      group flex items-center gap-3 p-3 rounded-lg border transition-all
                      ${service.selected
                        ? 'bg-brand-orange/5 border-brand-orange/30 text-gray-900'
                        : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}
                    `}
                  >
                    <button
                      onClick={() => toggleService(catIndex, servIndex)}
                      className={`
                        w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0
                        ${service.selected ? 'bg-brand-orange border-brand-orange' : 'bg-white border-gray-300'}
                      `}
                    >
                      {service.selected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                    
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => updateServiceName(catIndex, servIndex, e.target.value)}
                      className="text-sm font-medium bg-transparent border-none focus:ring-0 p-0 w-full"
                    />

                    <button 
                      onClick={() => removeService(catIndex, servIndex)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity p-1"
                      title="Remove service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                
                {/* Add Service Button */}
                <button
                  onClick={() => addService(catIndex)}
                  className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:text-brand-orange hover:border-brand-orange hover:bg-orange-50 transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Service
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addCategory}
        className="flex items-center gap-2 text-brand-orange font-medium hover:underline text-sm"
      >
        <Plus className="w-4 h-4" />
        Add Custom Category
      </button>
    </div>
  );
};

export default CategorySelector;