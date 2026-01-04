import React, { useState } from 'react';
import { OnboardingData } from '../types';
import { Building2, Palette, MapPin, Hammer, Briefcase, MessageSquare, Layers, Save, ArrowRight, Globe, Star, Plus, Trash2, Upload } from 'lucide-react';
import CategorySelector from './CategorySelector';
import { uploadLogo } from '../lib/supabase';

interface StepEditorProps {
  data: OnboardingData;
  onChange: (data: OnboardingData) => void;
  onComplete: () => void;
  onSaveDraft: () => void;
}

type Tab = 'info' | 'branding' | 'seo' | 'services' | 'portfolio' | 'social' | 'reviews';

const StepEditor: React.FC<StepEditorProps> = ({ data, onChange, onComplete, onSaveDraft }) => {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [isUploading, setIsUploading] = useState(false);

  const updateField = (key: keyof OnboardingData, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const updateSocial = (key: keyof OnboardingData['socials'], value: string) => {
    onChange({
      ...data,
      socials: { ...data.socials, [key]: value }
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const { url, error } = await uploadLogo(file);
    setIsUploading(false);
    if (error) {
      alert('Failed to upload logo: ' + (error.message || error));
    } else if (url) {
      updateField('logoUrl', url);
    }
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
                  <label className="text-sm font-medium text-gray-700">Owner Full Name</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.ownerName} onChange={(e) => updateField('ownerName', e.target.value)} placeholder="e.g. Maurice" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tax ID / EIN</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.taxId} onChange={(e) => updateField('taxId', e.target.value)} placeholder="Optional" />
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
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Shipping Address (No P.O. Boxes)</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.shippingAddress} onChange={(e) => updateField('shippingAddress', e.target.value)} placeholder="For business cards delivery" />
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
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Discounts for Maintenance/Remarketing</label>
                  <textarea rows={2} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.discounts} onChange={(e) => updateField('discounts', e.target.value)} placeholder="e.g. $500 off your next roof..." />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Business Highlights (Special Features)</label>
                  <textarea rows={2} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    value={data.highlights} onChange={(e) => updateField('highlights', e.target.value)} placeholder="e.g. Veteran Owned, 10+ Years in Business, Fully Insured..." />
                </div>
                <div className="md:col-span-2 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={data.termsAccepted}
                      onChange={(e) => updateField('termsAccepted', e.target.checked)}
                      className="w-5 h-5 text-brand-orange rounded border-gray-300 focus:ring-brand-orange"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      I agree to the Terms and Conditions
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Branding & Design</h2>
              <div className="space-y-4">
                <div className="bg-white p-4 border border-gray-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Company Logo</label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.needsLogo}
                        onChange={(e) => updateField('needsLogo', e.target.checked)}
                        className="rounded text-brand-orange focus:ring-brand-orange"
                      />
                      Need us to design one?
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    {data.logoUrl ? (
                      <div className="relative w-20 h-20 bg-gray-50 border rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={data.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                        <button
                          onClick={() => updateField('logoUrl', null)}
                          className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl shadow-sm hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                        <Palette className="w-8 h-8" />
                      </div>
                    )}

                    <div className="flex-1">
                      <label className={`flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                        {isUploading ? (
                          <span>Uploading...</span>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Logo File
                          </>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, SVG up to 5MB</p>
                    </div>
                  </div>
                </div>

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
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                 <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <Upload className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-bold text-blue-900 text-sm">Photo Submission Instructions</h3>
                    <p className="text-sm text-blue-800 mt-1">
                      Please email <strong>25-60 of your best photos</strong> to <a href="mailto:hello@stokeleads.com" className="underline">hello@stokeleads.com</a>.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Include a nice picture of yourself and/or your team!
                    </p>
                 </div>
              </div>

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

                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">Managed Testimonials</h3>
                <div className="grid gap-4">
                  {data.testimonials.map((testi, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 relative group">


                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase">Quote</label>
                          <div className="w-full p-2 text-sm italic text-gray-600">
                            {testi.quote}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Author</label>
                            <div className="w-full p-2 text-xs font-bold text-gray-900">
                              {testi.author}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Location/Context</label>
                            <div className="w-full p-2 text-xs text-gray-500">
                              {testi.location}
                            </div>
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