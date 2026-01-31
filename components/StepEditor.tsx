import React, { useState } from 'react';
import { OnboardingData } from '../types';
import { Building2, Palette, MapPin, Hammer, Briefcase, MessageSquare, Layers, Save, ArrowRight, Globe, Star, Plus, Trash2, Upload, Image as ImageIcon, CheckCircle, Loader2, Download } from 'lucide-react';
import CategorySelector from './CategorySelector';
import { uploadLogo, uploadProjectFile } from '../lib/supabase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface StepEditorProps {
  data: OnboardingData;
  onChange: (data: OnboardingData) => void;
  onComplete: () => void;
  onSaveDraft: (data?: OnboardingData) => void;
}

type Tab = 'info' | 'branding' | 'seo' | 'services' | 'portfolio' | 'social' | 'reviews';

const StepEditor: React.FC<StepEditorProps> = ({ data, onChange, onComplete, onSaveDraft }) => {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [isUploading, setIsUploading] = useState(false);
  const [projectUploadProgress, setProjectUploadProgress] = useState<{ total: number; current: number } | null>(null);
  const [isZipping, setIsZipping] = useState(false);

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
      onSaveDraft({ ...data, logoUrl: url });
    }
  };

  const handleProjectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    setProjectUploadProgress({ total: files.length, current: 0 });

    const newUrls: string[] = [];
    let completed = 0;

    // Process files in batches of 3 to avoid overwhelming browser/network
    const batchSize = 3;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(batch.map(async (file) => {
        const { url, error } = await uploadProjectFile(file);
        if (url) {
          newUrls.push(url);
        } else {
          console.error("Failed to upload:", file.name, error);
        }
        completed++;
        setProjectUploadProgress({ total: files.length, current: completed });
      }));
    }

    if (newUrls.length > 0) {
      const updatedGallery = [...(data.galleryUrls || []), ...newUrls];
      updateField('galleryUrls', updatedGallery);
      onSaveDraft({ ...data, galleryUrls: updatedGallery });
    }
    setProjectUploadProgress(null);
  };

  const handleDownloadAll = async () => {
    if (!data.galleryUrls || data.galleryUrls.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder("project-photos");

      // Fetch all images
      const promises = data.galleryUrls.map(async (url, index) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch ${url}`);
          const blob = await response.blob();

          // Try to guess extension from blob or url
          let ext = url.split('.').pop()?.split('?')[0] || 'jpg';
          if (ext.length > 4) ext = 'jpg'; // Fallback for weird urls

          folder?.file(`image-${index + 1}.${ext}`, blob);
        } catch (err) {
          console.error("Error zipping file:", url, err);
        }
      });

      await Promise.all(promises);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${data.businessName.replace(/\s+/g, '_')}_photos.zip`);

    } catch (err) {
      console.error("Error creating zip:", err);
      alert("Failed to create zip file. See console for details.");
    } finally {
      setIsZipping(false);
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

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-brand-orange" />
                      Project Gallery
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload <strong>25-60 of your best photos</strong>. Include team shots and finished projects.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{data.galleryUrls?.length || 0}</span>
                    <span className="text-xs text-gray-500 block uppercase font-bold tracking-wider">Uploaded</span>

                    {data.galleryUrls && data.galleryUrls.length > 0 && (
                      <button
                        onClick={handleDownloadAll}
                        disabled={isZipping}
                        className="mt-2 text-xs flex items-center gap-1 text-brand-orange hover:text-orange-700 font-medium ml-auto"
                      >
                        {isZipping ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Zipping...
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3" />
                            Download All
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${projectUploadProgress ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {projectUploadProgress ? (
                        <>
                          <Loader2 className="w-8 h-8 text-brand-orange animate-spin mb-2" />
                          <p className="text-sm text-gray-600">Uploading {projectUploadProgress.current} / {projectUploadProgress.total}...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500"><span className="font-semibold text-brand-orange">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-gray-400 mt-1">Select multiple files (JPG, PNG)</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleProjectUpload}
                      disabled={!!projectUploadProgress}
                    />
                  </label>

                  {data.galleryUrls && data.galleryUrls.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {data.galleryUrls.slice(0, 16).map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-gray-100 group">
                          <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                          <button
                            onClick={() => {
                              const newUrls = data.galleryUrls.filter((_, i) => i !== idx);
                              updateField('galleryUrls', newUrls);
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {data.galleryUrls.length > 16 && (
                        <div className="aspect-square rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium border border-gray-200">
                          +{data.galleryUrls.length - 16} more
                        </div>
                      )}
                    </div>
                  )}
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
                <h2 className="text-2xl font-bold text-gray-900">Reviews & Social Proof</h2>
                <div className="flex gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.businessName + " " + data.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    View on Google Maps
                  </a>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Reviews</div>
                  <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {data.rawReviews?.length || 0} <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Found via MoreGoodReviews & Google</div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    AI-Selected Testimonials
                  </h3>
                  <div className="grid gap-4">
                    {data.testimonials.map((testi, i) => (
                      <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative group hover:border-brand-orange/30 transition-colors">
                        <div className="space-y-3">
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                          <p className="text-gray-700 italic border-l-2 border-brand-orange/20 pl-4 py-1">
                            "{testi.quote}"
                          </p>
                          <div className="flex justify-between items-end pt-2 border-t border-gray-50">
                            <div>
                              <div className="text-sm font-bold text-gray-900">{testi.author}</div>
                              <div className="text-xs text-gray-500">{testi.location}</div>
                            </div>
                            <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-1 rounded uppercase font-bold tracking-tighter">Verified Review</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {data.rawReviews && data.rawReviews.length > 0 && (
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-700">
                      <MessageSquare className="w-5 h-5 text-gray-400" />
                      Raw Review Buffer ({data.rawReviews.length})
                    </h3>
                    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                      <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-200">
                        {data.rawReviews.map((review, i) => (
                          <div key={i} className="p-4 hover:bg-white transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-bold text-sm text-gray-900">{review.author}</div>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, starIdx) => (
                                  <Star
                                    key={starIdx}
                                    className={`w-3 h-3 ${starIdx < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {review.text}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                                {review.date ? (typeof review.date === 'string' && !review.date.includes('-') && !review.date.includes(':') ? review.date : new Date(review.date).toLocaleDateString()) : 'Recent Review'}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${review.source === 'Google' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {review.source}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 italic">
                      All reviews above were fetched and used by Gemini to generate your business profile.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default StepEditor;