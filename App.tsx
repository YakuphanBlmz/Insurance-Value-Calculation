import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResultCard from './components/ResultCard';
import LoadingOverlay from './components/LoadingOverlay';
import AdminPanel from './components/AdminPanel';
import { analyzeLicenseImage } from './services/geminiService';
import { searchVehicleInDb } from './services/dbService';
import { VehicleData, AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const handleFileSelect = async (base64: string, preview: string) => {
    setAppState(AppState.ANALYZING);
    setImagePreview(preview);
    setErrorMessage(null);

    try {
      // 1. Get AI Analysis
      const data = await analyzeLicenseImage(base64);
      
      // 2. Search in Local DB for Official Value
      const dbResult = await searchVehicleInDb(data.make, data.model, data.year);
      
      let finalData = { ...data };

      if (dbResult.found) {
        finalData.estimatedValueMin = dbResult.min;
        finalData.estimatedValueMax = dbResult.max;
        finalData.isOfficialData = true;
        finalData.officialVariant = dbResult.variantName;
        finalData.description = `${finalData.description} (Not: Fiyat veritabanındaki ${dbResult.variantName} kaydından alınmıştır.)`;
      }

      setVehicleData(finalData);
      setAppState(AppState.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Bilinmeyen bir hata oluştu.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setVehicleData(null);
    setImagePreview(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 relative">
      
      {/* Admin Button */}
      <button 
        onClick={() => setIsAdminOpen(true)}
        className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-600 px-4 py-2 rounded-full shadow-sm border border-slate-200 text-sm font-medium transition-all backdrop-blur-sm z-10"
      >
        <i className="fas fa-database mr-2 text-indigo-600"></i>
        Veritabanı Güncelle
      </button>

      {/* Admin Modal */}
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      {/* Header */}
      <div className="text-center mb-12 max-w-2xl mt-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-6 rotate-3 hover:rotate-6 transition-transform duration-300">
            <i className="fas fa-id-card text-white text-3xl"></i>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Kasko<span className="text-indigo-600">AI</span>
        </h1>
        <p className="text-lg text-slate-600">
          Araç ruhsat fotoğrafınızı yükleyin, yapay zeka saniyeler içinde aracınızı tanısın ve güncel kasko değerini çıkarsın.
        </p>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-3xl flex flex-col items-center">
        
        {appState === AppState.ANALYZING && <LoadingOverlay />}

        {appState === AppState.ERROR && (
           <div className="w-full bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center animate-bounce-in">
             <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
                <i className="fas fa-exclamation-triangle"></i>
             </div>
             <h3 className="text-red-800 font-bold mb-1">Analiz Başarısız</h3>
             <p className="text-red-600 text-sm mb-4">{errorMessage}</p>
             <button 
                onClick={handleReset}
                className="text-sm font-semibold text-red-700 hover:text-red-800 underline"
             >
                Tekrar Dene
             </button>
           </div>
        )}

        {appState === AppState.IDLE && (
            <div className="w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
               <FileUpload onFileSelect={handleFileSelect} disabled={false} />
               
               <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-3 text-indigo-600">
                        <i className="fas fa-upload"></i>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm">Fotoğraf Yükle</h4>
                    <p className="text-xs text-slate-500 mt-1">Ruhsatın fotoğrafını çekin veya yükleyin.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-3 text-indigo-600">
                        <i className="fas fa-microchip"></i>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm">AI Analizi</h4>
                    <p className="text-xs text-slate-500 mt-1">Görsel işleme ile veriler okunsun.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-3 text-indigo-600">
                        <i className="fas fa-tags"></i>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm">Değerleme</h4>
                    <p className="text-xs text-slate-500 mt-1">TSB listesinden veya AI tahminli.</p>
                  </div>
               </div>
            </div>
        )}

        {appState === AppState.SUCCESS && vehicleData && (
          <ResultCard 
            data={vehicleData} 
            onReset={handleReset} 
            imagePreview={imagePreview}
          />
        )}
      </div>

      <footer className="mt-16 text-center text-slate-400 text-sm">
        <p>© 2026 - Yakuphan Bilmez tarafından geliştirilmiştir</p>
      </footer>
    </div>
  );
}

export default App;