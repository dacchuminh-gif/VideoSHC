import React, { useState, useCallback, useEffect } from 'react';
import type { ProjectData } from './types';
import { Step1ProjectSetup } from './components/Step1_ProjectSetup';
import { Step2InsightAnalysis } from './components/Step2_InsightAnalysis';
import { Step3ContentIdeas } from './components/Step3_ContentIdeas';
import { Step4ScriptWriter } from './components/Step4_ScriptWriter';
import { Step5Storyboard } from './components/Step5_Storyboard';
import { Step6FinalVideo } from './components/Step6_FinalVideo';
import { StepIndicator } from './components/StepIndicator';
import { Header } from './components/Header';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData>({
    goal: '',
    audience: '',
    userInsights: '',
    videoType: 'Hiệu suất',
    platform: 'TikTok',
    aspectRatio: '9:16',
    scriptStructure: 'PAS (Vấn đề-Khuấy động-Giải pháp)',
    videoStyle: 'Cung cấp thông tin',
    duration: 90,
    sceneCount: 5,
    cta: '',
    selectedIdeas: [],
    scripts: [],
    storyboards: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // FIX: Changed type from 'number' to handle both browser (number) and Node (Timeout) types for setInterval.
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isLoading) {
      setProgress(0);
      let currentProgress = 0;
      // Simulate progress climbing to 90%
      interval = setInterval(() => {
        currentProgress += Math.random() * 10;
        if (currentProgress > 90) {
          currentProgress = 90;
          if (interval) clearInterval(interval);
        }
        setProgress(Math.round(currentProgress));
      }, 400);
    } else {
      // If loading finishes, jump to 100%
      if (progress > 0) {
        setProgress(100);
        setTimeout(() => setProgress(0), 500); // Reset after a short delay
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);


  const totalSteps = 6;

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError(null);
    }
  }, [currentStep]);
  
  const startOver = useCallback(() => {
    setProjectData({ 
      goal: '', 
      audience: '', 
      userInsights: '',
      videoType: 'Hiệu suất',
      platform: 'TikTok',
      aspectRatio: '9:16',
      scriptStructure: 'PAS (Vấn đề-Khuấy động-Giải pháp)',
      videoStyle: 'Cung cấp thông tin',
      duration: 90,
      sceneCount: 5,
      cta: '',
      selectedIdeas: [],
      scripts: [],
      storyboards: [],
    });
    setCurrentStep(1);
    setError(null);
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1ProjectSetup 
                  projectData={projectData} 
                  setProjectData={setProjectData} 
                  nextStep={nextStep} 
                  setIsLoading={setIsLoading} 
                  setError={setError} 
                />;
      case 2:
        return <Step2InsightAnalysis 
                  projectData={projectData} 
                  setProjectData={setProjectData} 
                  nextStep={nextStep} 
                  prevStep={prevStep}
                  setIsLoading={setIsLoading} 
                  setError={setError} 
                />;
      case 3:
        return <Step3ContentIdeas 
                  projectData={projectData} 
                  setProjectData={setProjectData} 
                  nextStep={nextStep} 
                  prevStep={prevStep}
                  setIsLoading={setIsLoading} 
                  setError={setError} 
                />;
      case 4:
        return <Step4ScriptWriter
                  projectData={projectData} 
                  setProjectData={setProjectData} 
                  nextStep={nextStep}
                  prevStep={prevStep}
                  setIsLoading={setIsLoading}
                  setError={setError}
                />;
      case 5:
        return <Step5Storyboard
                  projectData={projectData}
                  setProjectData={setProjectData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />;
      case 6:
        return <Step6FinalVideo
                  projectData={projectData}
                  startOver={startOver}
                  prevStep={prevStep}
                />;
      default:
        return <div>Invalid Step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header />
      <div className="w-full max-w-6xl mx-auto mt-8">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        <main className="mt-8 bg-white/80 rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-200 backdrop-blur-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative w-24 h-24">
                <div className="absolute top-0 left-0 w-full h-full border-8 border-[#007dc5] border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-2xl font-bold text-[#007dc5]">
                  {progress}%
                </div>
              </div>
              <p className="mt-6 text-lg text-gray-600">AI đang xử lý...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
                  <p className="font-bold">Đã xảy ra lỗi:</p>
                  <p>{error}</p>
                </div>
              )}
              {renderStep()}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;