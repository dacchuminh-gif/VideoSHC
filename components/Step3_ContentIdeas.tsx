import React, { useState, useEffect } from 'react';
import type { ProjectData, ContentIdea } from '../types';
import { writeScript } from '../services/geminiService';
import { LightbulbIcon, ArrowLeftIcon } from './icons';

interface Step3Props {
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  nextStep: () => void;
  prevStep: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const Step3ContentIdeas: React.FC<Step3Props> = ({ projectData, setProjectData, nextStep, prevStep, setIsLoading, setError }) => {
  const [selectedIdeas, setSelectedIdeas] = useState<ContentIdea[]>(projectData.selectedIdeas || []);

  useEffect(() => {
    if (projectData.contentIdeas && projectData.selectedIdeas) {
      const selectedTitles = new Set(projectData.selectedIdeas.map(i => i.title));
      const newSelectedIdeas = projectData.contentIdeas.filter(idea => selectedTitles.has(idea.title));
      setSelectedIdeas(newSelectedIdeas);
    } else {
        setSelectedIdeas([]);
    }
  }, [projectData.contentIdeas, projectData.selectedIdeas]);

  const handleSelectIdea = (ideaToToggle: ContentIdea) => {
    setSelectedIdeas(prevSelected => {
      const isSelected = prevSelected.some(i => i.title === ideaToToggle.title);
      if (isSelected) {
        return prevSelected.filter(i => i.title !== ideaToToggle.title);
      } else {
        return [...prevSelected, ideaToToggle];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedIdeas.length === 0) {
      setError("Vui lòng chọn ít nhất một ý tưởng nội dung để tiếp tục.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const scriptPromises = selectedIdeas.map(idea => writeScript(projectData, idea));
      const scriptsResults = await Promise.all(scriptPromises);
      
      const newScripts = selectedIdeas.map((idea, index) => ({
        idea: idea,
        script: scriptsResults[index]
      }));

      setProjectData(prev => ({ 
          ...prev, 
          selectedIdeas, 
          scripts: newScripts 
      }));
      nextStep();
    } catch(err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định khi viết kịch bản.");
    } finally {
      setIsLoading(false);
    }
  };

  const ideas = projectData.contentIdeas || [];

  if (ideas.length === 0) {
     return (
      <div className="text-center">
        <p className="text-red-500">Không tìm thấy ý tưởng nội dung. Vui lòng quay lại.</p>
        <button onClick={prevStep} className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">
          Quay Lại
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-[#007dc5] mb-2">Tinh Chỉnh & Chọn Ý Tưởng Nội Dung</h2>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">AI đã tạo ra các ý tưởng dựa trên insight. Hãy chọn một hoặc nhiều ý tưởng phù hợp nhất để viết kịch bản.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {ideas.map((idea, index) => {
          const isSelected = selectedIdeas.some(i => i.title === idea.title);
          return (
            <div
              key={index}
              onClick={() => handleSelectIdea(idea)}
              className={`bg-white p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col cursor-pointer ${
                isSelected ? 'border-[#007dc5] ring-2 ring-[#007dc5]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                 <div className="bg-[#007dc5]/20 p-2 rounded-full mt-1 flex-shrink-0">
                  <LightbulbIcon className="w-6 h-6 text-[#007dc5]" />
                 </div>
                 <div className="flex-grow">
                    <p className="text-xs text-gray-500">Tiêu đề</p>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 break-words">
                       {idea.title}
                    </h3>
                    <p className="text-xs text-gray-500">Góc độ</p>
                    <span className="inline-block bg-[#007dc5]/20 text-[#007dc5] text-xs font-semibold px-2 py-1 rounded-full mt-1">
                       {idea.angle}
                    </span>
                 </div>
              </div>
              <div className="flex flex-col mt-2">
                 <p className="text-xs text-gray-500 mb-1">Concept</p>
                  <p className="text-gray-600 text-sm break-words">
                     {idea.concept}
                  </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-12">
        <button onClick={prevStep} className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-6 rounded-full transition-colors border border-gray-300">
          <ArrowLeftIcon className="w-5 h-5" />
          Quay Lại
        </button>
        <button 
          onClick={handleContinue}
          disabled={selectedIdeas.length === 0}
          className="bg-[#f58220] hover:bg-[#e0751c] text-white font-bold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {selectedIdeas.length > 0 ? `Viết kịch bản cho ${selectedIdeas.length} ý tưởng` : 'Chọn ý tưởng để viết kịch bản'}
        </button>
      </div>
    </div>
  );
};