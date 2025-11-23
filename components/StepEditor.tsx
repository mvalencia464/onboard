import React, { useState } from 'react';
import { OnboardingData } from '../types';
import { Building2, Palette, MapPin, Hammer, Briefcase, MessageSquare, Layers, Save, ArrowRight, Globe, Star, Plus, Trash2 } from 'lucide-react';
import CategorySelector from './CategorySelector';

interface StepEditorProps {
  data: OnboardingData;
  onChange: (data: OnboardingData) => void;
  onComplete: () => void;
  onSaveDraft: () => void;
}

type Tab = 'info' | 'branding' | 'seo' | 'services' | 'portfolio' | 'social' | 'reviews';

const StepEditor: React.FC<StepEditorProps> = ({ data, onChange, onComplete, onSaveDraft }) => {
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const updateField = (key: keyof OnboardingData, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const updateSocial = (key: keyof OnboardingData['socials'], value: string) => {
    onChange({
      ...data,
      socials: { ...data.socials, [key]: value }
    });
  };

  const TabButton = ({ id, icon: Icon, label }: { id: Tab; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === id ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-600 hover:bg-gray-50'
        }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-brand-orange rounded-lg flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Onboarding</h1>
            <p className="text-xs text-gray-500">Reviewing: {data.businessName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSaveDraft}
            className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button
            onClick={onComplete}
            className="bg-brand-orange hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
          >
            Finalize Onboarding <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-4 gap-1 overflow-y-auto">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Core Data</div>
          <TabButton id="info" icon={Building2} label="Business Info" />
          <TabButton id="branding" icon={Palette} label="Branding" />
          <TabButton id="seo" icon={MapPin} label="Localization & SEO" />
          <div className="h-px bg-gray-100 my-2"></div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Content</div>
          <TabButton id="services" icon={Hammer} label="Services Structure" />
          <TabButton id="portfolio" icon={Layers} label="Portfolio" />
          <TabButton id="social" icon={MessageSquare} label="Social Media" />
          <TabButton id="reviews" icon={Star} label="Reviews" />
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden w-full bg-white border-b border-gray-200 overflow-x-auto flex p-2 gap-2">
          <TabButton id="info" icon={Building2} label="Info" />
          <TabButton id="services" icon={Hammer} label="Services" />
          <TabButton id="seo" icon={MapPin} label="SEO" />
          <TabButton id="branding" icon={Palette} label="Brand" />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 max-w-5xl mx-auto w-full">

          {activeTab === 'info' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Identity</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Company Name</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.businessName} onChange={(e) => updateField('businessName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tagline / Slogan</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.tagline} onChange={(e) => updateField('tagline', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Primary Email</label>
                  <input type="email" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.primaryEmail} onChange={(e) => updateField('primaryEmail', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Primary Phone</label>
                  <input type="tel" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.primaryPhone} onChange={(e) => updateField('primaryPhone', e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Physical Address</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.address} onChange={(e) => updateField('address', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Operating Hours</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.operatingHours} onChange={(e) => updateField('operatingHours', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">License / Bond #</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.licenseNumber} onChange={(e) => updateField('licenseNumber', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Website URL</label>
                  <input type="url" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.websiteUrl} onChange={(e) => updateField('websiteUrl', e.target.value)} placeholder="https://..." />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Branding & Design</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Primary Brand Color</label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="color" className="h-12 w-12 p-1 rounded border border-gray-300 cursor-pointer"
                      value={data.brandColor} onChange={(e) => updateField('brandColor', e.target.value)} />
                    <input type="text" className="flex-1 p-3 rounded-lg border border-gray-300 uppercase"
                      value={data.brandColor} onChange={(e) => updateField('brandColor', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Font Preference</label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {['Modern', 'Classic', 'Handwritten'].map((font) => (
                      <button key={font}
                        onClick={() => updateField('fontPreference', font)}
                        className={`p-4 border rounded-lg text-center transition-all ${data.fontPreference === font ? 'border-brand-orange bg-orange-50 text-brand-orange ring-1 ring-brand-orange' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <span className={font === 'Modern' ? 'font-sans font-bold' : font === 'Classic' ? 'font-serif' : 'font-[cursive]'}>
                          {font}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">About Us Story</label>
                  <textarea rows={6} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.aboutUs} onChange={(e) => updateField('aboutUs', e.target.value)}
                    placeholder="We detected this from your site, but feel free to edit..." />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Localization & SEO Strategy</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Primary City/Region</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-gray-300"
                    value={data.primaryCity} onChange={(e) => updateField('primaryCity', e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Target Neighborhoods (Comma separated)</label>
                  <textarea rows={3} className="w-full p-3 rounded-lg border border-gray-300"
                    value={data.neighborhoods.join(', ')}
                    onChange={(e) => updateField('neighborhoods', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="Downtown, West End, etc..." />
                  <p className="text-xs text-gray-500">AI extracted {data.neighborhoods.length} key areas.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Environmental Challenges</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {data.environmentalChallenges.map((challenge, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2 border rounded-md">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>{challenge}</span>
                      </div>
                    ))}
                    <div className="text-xs text-gray-500 col-span-full mt-1">
                      * These are used to generate technical copy about why your build quality matters.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Skeleton</h2>
              <p className="text-gray-500 mb-8">Select the services you want to feature on the website.</p>

              <CategorySelector
                categories={data.categories}
                onChange={(newCats) => updateField('categories', newCats)}
              />
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Projects</h2>
              <div className="grid gap-6">
                {data.projects.map((project, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                    <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-3">
                      <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded text-sm">Project {index + 1}</span>
                      <input
                        type="text"
                        className="font-semibold text-lg border-none focus:ring-0 w-full"
                        value={project.title}
                        onChange={(e) => {
                          const newProjects = [...data.projects];
                          newProjects[index].title = e.target.value;
                          updateField('projects', newProjects);
                        }}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase font-bold text-gray-400">Location</label>
                        <input type="text" className="w-full p-2 border rounded" value={project.location} onChange={(e) => {
                          const newProjects = [...data.projects];
                          newProjects[index].location = e.target.value;
                          updateField('projects', newProjects);
                        }} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs uppercase font-bold text-gray-400">Key Feature</label>
                        <input type="text" className="w-full p-2 border rounded" value={project.feature} onChange={(e) => {
                          const newProjects = [...data.projects];
                          newProjects[index].feature = e.target.value;
                          updateField('projects', newProjects);
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Media</h2>

              <div className="grid md:grid-cols-2 gap-4">
                {Object.keys(data.socials).map((key) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 capitalize">{key}</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                        value={(data.socials as any)[key]}
                        onChange={(e) => updateSocial(key as any, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reviews & Testimonials</h2>
                <div className="flex gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.businessName + " " + data.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    View All on Google Maps
                  </a>
                  <button
                    onClick={() => {
                      const newReview = { id: Date.now().toString(), quote: "", author: "", location: "" };
                      updateField('testimonials', [...data.testimonials, newReview]);
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-brand-orange hover:text-orange-700 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Manual Review
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">Managed Testimonials</h3>
                <div className="grid gap-4">
                  {data.testimonials.map((testi, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 relative group">
                      <button
                        onClick={() => {
                          const newTestimonials = [...data.testimonials];
                          newTestimonials.splice(i, 1);
                          updateField('testimonials', newTestimonials);
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase">Quote</label>
                          <textarea
                            className="w-full p-2 border rounded-md text-sm italic text-gray-600 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                            rows={3}
                            value={testi.quote}
                            onChange={(e) => {
                              const newTestimonials = [...data.testimonials];
                              newTestimonials[i].quote = e.target.value;
                              updateField('testimonials', newTestimonials);
                            }}
                            placeholder="Paste review text here..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Author</label>
                            <input
                              type="text"
                              className="w-full p-2 border rounded-md text-xs font-bold text-gray-900"
                              value={testi.author}
                              onChange={(e) => {
                                const newTestimonials = [...data.testimonials];
                                newTestimonials[i].author = e.target.value;
                                updateField('testimonials', newTestimonials);
                              }}
                              placeholder="Reviewer Name"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Location/Context</label>
                            <input
                              type="text"
                              className="w-full p-2 border rounded-md text-xs text-gray-500"
                              value={testi.location}
                              onChange={(e) => {
                                const newTestimonials = [...data.testimonials];
                                newTestimonials[i].location = e.target.value;
                                updateField('testimonials', newTestimonials);
                              }}
                              placeholder="e.g. Google Review"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default StepEditor;