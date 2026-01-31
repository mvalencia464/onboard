import React, { useState, useEffect } from 'react';
import { AppStep, INITIAL_DATA, OnboardingData } from './types';
import { enrichBusinessData } from './services/geminiService';
import { fetchAllReviews } from './services/moreGoodReviewsService';
import { saveBusiness, getBusiness, supabase } from './lib/supabase';
import ScanningStep from './components/ScanningStep';
import StepEditor from './components/StepEditor';
import PlaceSearch from './components/PlaceSearch';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [step, setStep] = useState<AppStep>(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    // Check for explicit admin flag OR presence of access_token/error which implies a login redirect
    if (params.get('admin') === 'true' || hash.includes('access_token') || hash.includes('error_description')) {
      return AppStep.ADMIN;
    }
    return AppStep.SEARCH;
  });
  const [businessName, setBusinessName] = useState('');
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [session, setSession] = useState<Session | null>(null);

  // Manual Entry State
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualName, setManualName] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("Initial session check:", session, "Error:", error);
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state change:", _event, session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handlePlaceSelect = async (place: any) => {
    // 1. Set basic state from the selection immediately
    setBusinessName(place.name);
    setStep(AppStep.SCANNING);
    setError(null);

    try {
      // 2. Fetch all reviews from MoreGoodReviews
      console.log("Fetching all reviews from MoreGoodReviews...");
      const allReviews = await fetchAllReviews();
      console.log(`Fetched ${allReviews.length} reviews.`);

      // 3. Send the rich Google Places data + all reviews to Gemini
      const result = await enrichBusinessData(place, allReviews);

      // Normalize and combine reviews for storage
      const googleReviews = (place.reviews || []).map((r: any) => ({
        source: 'Google',
        text: r.text || '',
        author: r.author_name || 'Google User',
        rating: r.rating || 5,
        date: r.relative_time_description || r.time // Fallback
      }));

      const mgrReviews = allReviews.map(r => ({
        source: 'MoreGoodReviews',
        text: r.review || r.body || r.text || r.content || '',
        author: r.reviewer?.name || r.author_name || r.name || 'Verified Customer',
        rating: typeof r.rating === 'object' ? r.rating.score : (r.rating || 5),
        date: r.created_at || r.date || Date.now()
      }));

      const combinedRawReviews = [...googleReviews, ...mgrReviews];

      // 4. Merge AI result with initial data structure
      const mergedData: OnboardingData = {
        ...INITIAL_DATA,
        ...result,
        googlePlaceId: place.place_id,
        rawReviews: combinedRawReviews, // Store ALL reviews
        // Ensure deeply nested objects merge safely
        socials: { ...INITIAL_DATA.socials, ...(result.socials || {}) },
        categories: result.categories || [],
        projects: result.projects || [],
        testimonials: result.testimonials || [],
        neighborhoods: result.neighborhoods || [],
        environmentalChallenges: result.environmentalChallenges || []
      };

      setData(mergedData);
      setStep(AppStep.EDITOR);

    } catch (err) {
      console.error(err);
      setError("Failed to analyze business data. Please try again.");
      setStep(AppStep.SEARCH);
    }
  };

  const handleManualSubmit = () => {
    if (!manualName.trim()) return;

    setBusinessName(manualName);
    setData({
      ...INITIAL_DATA,
      businessName: manualName
    });
    setStep(AppStep.EDITOR);
  };

  const handleSaveDraft = async (dataOverride?: OnboardingData) => {
    const dataToSave = dataOverride || data;
    const { data: savedData, error } = await saveBusiness(dataToSave, 'draft');
    if (error) {
      console.error("Error saving draft:", error);
      showNotification("Failed to save draft. Check console.");
      return;
    }

    // Update local state with the returned ID so future saves update this record
    if (savedData && savedData.id) {
      setData(prev => ({ ...prev, id: savedData.id }));
      showNotification("Draft saved successfully!");
    }
  };

  const handleComplete = async () => {
    // Save to Supabase
    const { error } = await saveBusiness(data, 'onboarded');
    if (error) {
      console.error("Supabase Save Error:", error);
      alert(`Failed to save to Supabase. Check console for details.\n\nError: ${JSON.stringify(error.message || error)}`);
    } else {
      console.log("Saved to Supabase successfully!");
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.businessName.replace(/\s+/g, '_')}_onboarding.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStep(AppStep.COMPLETE);
  };

  const handleAdminSelect = async (id: number) => {
    const { data: businessData, error } = await getBusiness(id);
    if (error || !businessData) {
      alert("Failed to load business.");
      return;
    }

    // Load raw data back into state
    // We assume raw_data matches OnboardingData structure. 
    // We also ensure the ID is preserved in the state.
    const loadedData: OnboardingData = {
      ...(businessData.raw_data as OnboardingData),
      id: businessData.id // Ensure the database ID is set on the object
    };

    setData(loadedData);
    setBusinessName(loadedData.businessName);
    setStep(AppStep.EDITOR);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setStep(AppStep.SEARCH);
  };

  // Render Views
  if (step === AppStep.SEARCH) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Admin Link */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setStep(AppStep.ADMIN)}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            Admin
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl space-y-8">
            <div className="text-center space-y-4">
              <div className="bg-brand-orange w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Sparkles className="text-white w-8 h-8" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Client Onboarding AI
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Instantly generate a website skeleton, service list, and SEO profile by scanning a business's Google Profile.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 transition-all duration-300">
              {!isManualEntry ? (
                // Google Places Search View
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Find Business Profile</label>
                    <PlaceSearch onPlaceSelect={handlePlaceSelect} />
                  </div>

                  {error && <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

                  <div className="pt-4 text-center">
                    <button
                      onClick={() => setIsManualEntry(true)}
                      className="text-sm text-gray-500 hover:text-brand-orange underline transition-colors"
                    >
                      Don't have a Google Business Profile? Click here
                    </button>
                  </div>
                </div>
              ) : (
                // Manual Entry View
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <input
                      type="text"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="Enter business name..."
                      className="block w-full rounded-xl border-gray-300 px-4 py-3 shadow-sm focus:border-brand-orange focus:ring-brand-orange text-lg bg-gray-50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleManualSubmit();
                      }}
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleManualSubmit}
                      disabled={!manualName.trim()}
                      className="w-full py-3 bg-brand-orange text-white rounded-xl shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
                    >
                      Start Manual Onboarding
                    </button>
                    <button
                      onClick={() => setIsManualEntry(false)}
                      className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                    >
                      Back to Search
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest">Powered by Gemini 2.5 Flash & Google Maps</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === AppStep.ADMIN) {
    if (!session) {
      return <Login />;
    }
    return (
      <AdminDashboard
        onSelect={handleAdminSelect}
        onBack={() => setStep(AppStep.SEARCH)}
        onLogout={handleLogout}
      />
    );
  }

  if (step === AppStep.SCANNING) {
    return <ScanningStep businessName={businessName} />;
  }

  if (step === AppStep.EDITOR) {
    return (
      <>
        <StepEditor
          data={data}
          onChange={setData}
          onComplete={handleComplete}
          onSaveDraft={handleSaveDraft}
        />
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up flex items-center gap-2 transition-all duration-300">
            <Sparkles className="w-4 h-4 text-brand-orange" />
            {toastMessage}
          </div>
        )}
      </>
    );
  }

  if (step === AppStep.COMPLETE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Onboarding Complete!</h2>
          <p className="text-gray-600 mb-8">
            The website skeleton for <strong>{data.businessName}</strong> is ready. The JSON configuration has been downloaded.
          </p>
          <button
            onClick={() => setStep(AppStep.SEARCH)}
            className="text-brand-orange font-semibold hover:text-orange-700 underline"
          >
            Onboard another client
          </button>
        </div>
      </div>
    );
  }

  return null;
}