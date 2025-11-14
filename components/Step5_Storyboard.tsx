import React, { useState, useEffect, useCallback } from 'react';
import type { ProjectData, StoryboardScene, ScriptScene } from '../types';
import { generateImage, createStoryboardPrompts } from '../services/geminiService';
import { printProject } from '../services/printService';
import { ImageIcon, ClapperboardIcon, WandIcon, MegaphoneIcon, ClipboardIcon, ClipboardCheckIcon, ClockIcon, ArrowLeftIcon, FileTextIcon } from './icons';

interface Step5Props {
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  nextStep: () => void;
  prevStep: () => void;
}

// Helper function for TailwindCSS aspect ratio classes
const getAspectRatioClass = (ratio: string): string => {
    switch (ratio) {
        case '16:9':
            return 'aspect-video'; // Standard Tailwind class for 16:9
        case '1:1':
            return 'aspect-square'; // Standard Tailwind class for 1:1
        case '9:16':
            return 'aspect-[9/16]';
        case '4:3':
            return 'aspect-[4/3]';
        case '3:4':
            return 'aspect-[3/4]';
        default:
            return 'aspect-video';
    }
};

const AutosizeTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
    const ref = React.useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
    }, [props.value]);
    return <textarea {...props} ref={ref} className={`w-full bg-white border border-gray-300 rounded-md p-2.5 text-gray-900 focus:ring-1 focus:ring-[#007dc5] transition resize-none ${props.className || ''}`} />;
};

const AIPromptDisplay: React.FC<{ prompt: string }> = ({ prompt }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg relative">
            <p className="text-sm font-semibold text-gray-500 mb-2">Gợi ý Video AI (cho Google Veo, Kling, Runway)</p>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words font-sans bg-gray-100 p-3 rounded-md">{prompt}</pre>
            <button onClick={handleCopy} className="absolute top-4 right-4 p-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-600 transition-colors">
                {copied ? <ClipboardCheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5" />}
            </button>
        </div>
    );
};


const SceneEditor: React.FC<{
    scene: StoryboardScene;
    storyboardIndex: number;
    sceneIndex: number;
    onUpdate: (sbIndex: number, scIndex: number, field: keyof StoryboardScene, value: any) => void;
    onGenerateImage: (sbIndex: number, scIndex: number) => void;
    aspectRatio: string;
}> = ({ scene, storyboardIndex, sceneIndex, onUpdate, onGenerateImage, aspectRatio }) => {
    
    return (
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-xl text-[#007dc5]">Cảnh {scene.sceneNumber}</h4>
                <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-gray-500" />
                    <input
                        type="number"
                        value={scene.duration}
                        onChange={(e) => onUpdate(storyboardIndex, sceneIndex, 'duration', parseInt(e.target.value, 10) || 0)}
                        className="w-20 bg-gray-100 border border-gray-300 rounded-md p-1.5 text-gray-900 text-center focus:ring-1 focus:ring-[#007dc5]"
                    />
                    <span className="text-gray-500 text-sm">giây</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-x-8 gap-y-6">
                {/* Left Column */}
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                            <ImageIcon className="w-5 h-5" />
                            Gợi ý Hình ảnh (cho Storyboard)
                        </label>
                        <AutosizeTextarea
                            value={scene.visualDescription}
                            onChange={(e) => onUpdate(storyboardIndex, sceneIndex, 'visualDescription', e.target.value)}
                            rows={4}
                        />
                    </div>
                    <div className={`w-full bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 ${getAspectRatioClass(aspectRatio)}`}>
                        {scene.isLoading ? (
                            <div className="flex flex-col items-center text-center p-4">
                                <div className="w-10 h-10 border-4 border-[#007dc5] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm mt-3 text-gray-500">AI đang vẽ...</p>
                            </div>
                        ) : scene.imageUrl && scene.imageUrl !== 'error' ? (
                            <img src={scene.imageUrl} alt={`Cảnh ${scene.sceneNumber}`} className="w-full h-full object-cover rounded-md" />
                        ) : (
                             <div className="text-center p-4 text-gray-400">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                                <p>Hình ảnh sẽ xuất hiện ở đây</p>
                                {scene.imageUrl === 'error' && <p className="text-red-500 mt-2">Tạo ảnh thất bại. Hãy thử lại.</p>}
                            </div>
                        )}
                    </div>
                     <button
                        onClick={() => onGenerateImage(storyboardIndex, sceneIndex)}
                        disabled={scene.isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-[#f58220] hover:bg-[#e0751c] text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <WandIcon className="w-5 h-5" />
                        {scene.imageUrl && scene.imageUrl !== 'error' ? 'Tạo lại hình ảnh' : 'Tạo hình ảnh'}
                    </button>
                </div>

                {/* Right Column */}
                <div className="space-y-4 flex flex-col">
                     <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                            <ClapperboardIcon className="w-5 h-5" />
                            Chi tiết cảnh & Hành động
                        </label>
                        <AutosizeTextarea
                            value={scene.sceneDetails}
                            onChange={(e) => onUpdate(storyboardIndex, sceneIndex, 'sceneDetails', e.target.value)}
                            rows={3}
                        />
                    </div>
                     <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                            <WandIcon className="w-5 h-5" />
                            Gợi ý Visuals (Góc máy, Ánh sáng...)
                        </label>
                        <AutosizeTextarea
                            value={scene.visualSuggestions}
                            onChange={(e) => onUpdate(storyboardIndex, sceneIndex, 'visualSuggestions', e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                            <MegaphoneIcon className="w-5 h-5" />
                            Lời thoại / Thuyết minh
                        </label>
                        <AutosizeTextarea
                            value={scene.voiceover}
                            onChange={(e) => onUpdate(storyboardIndex, sceneIndex, 'voiceover', e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
            </div>
            
            <AIPromptDisplay prompt={scene.imagePrompt} />
        </div>
    );
};

export const Step5Storyboard: React.FC<Step5Props> = ({ projectData, setProjectData, nextStep, prevStep }) => {
  const { storyboards } = projectData;
  const [activeIdeaIndex, setActiveIdeaIndex] = useState(0);

  const handleUpdateScene = useCallback((storyboardIndex: number, sceneIndex: number, field: keyof StoryboardScene, value: any) => {
      setProjectData(prev => {
          const newStoryboards = [...(prev.storyboards || [])];
          const targetStoryboard = { ...newStoryboards[storyboardIndex] };
          targetStoryboard.storyboard = [...targetStoryboard.storyboard];
          const targetScene = { ...targetStoryboard.storyboard[sceneIndex] };
          
          (targetScene[field] as any) = value;

          targetStoryboard.storyboard[sceneIndex] = targetScene;
          newStoryboards[storyboardIndex] = targetStoryboard;
          return { ...prev, storyboards: newStoryboards };
      });
  }, [setProjectData]);

  const handleGenerateImage = useCallback(async (storyboardIndex: number, sceneIndex: number) => {
      handleUpdateScene(storyboardIndex, sceneIndex, 'isLoading', true);
      
      const scene = projectData.storyboards![storyboardIndex].storyboard[sceneIndex];
      const scriptScene: ScriptScene = {
          scene_number: scene.sceneNumber,
          duration_seconds: scene.duration,
          visual_description: scene.visualDescription,
          scene_details: scene.sceneDetails,
          visual_suggestions: scene.visualSuggestions,
          voiceover_text: scene.voiceover,
      };

      try {
          const prompts = await createStoryboardPrompts([scriptScene], projectData.aspectRatio);
          const newPrompt = prompts[0];
          handleUpdateScene(storyboardIndex, sceneIndex, 'imagePrompt', newPrompt);
          
          const imageUrl = await generateImage(newPrompt, projectData.aspectRatio);
          handleUpdateScene(storyboardIndex, sceneIndex, 'imageUrl', imageUrl);

      } catch (err) {
          console.error(`Error generating image for scene ${scene.sceneNumber}:`, err);
          handleUpdateScene(storyboardIndex, sceneIndex, 'imageUrl', 'error');
      } finally {
          handleUpdateScene(storyboardIndex, sceneIndex, 'isLoading', false);
      }
  }, [projectData, handleUpdateScene]);

  const handleExport = () => {
    printProject(projectData, activeIdeaIndex);
  };

  if (!storyboards || storyboards.length === 0) {
    return (
      <div className="text-center">
        <p className="text-red-500">Không tìm thấy dữ liệu bảng phân cảnh. Vui lòng quay lại.</p>
        <button onClick={prevStep} className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">
          Quay Lại
        </button>
      </div>
    );
  }

  const activeStoryboard = storyboards[activeIdeaIndex];
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-[#007dc5] mb-2">Bảng Phân Cảnh Trực Quan</h2>
      <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">Đây là studio của bạn. Tinh chỉnh từng chi tiết của cảnh, sau đó tạo hình ảnh để xem ý tưởng của bạn trở nên sống động.</p>

      {storyboards.length > 1 && (
        <div className="flex justify-center mb-8 border-b border-gray-200">
           {storyboards.map((sb, index) => (
             <button
                key={index}
                onClick={() => setActiveIdeaIndex(index)}
                className={`px-6 py-3 text-lg font-semibold transition-colors ${
                    activeIdeaIndex === index
                        ? 'text-[#007dc5] border-b-2 border-[#007dc5]'
                        : 'text-gray-500 hover:text-gray-700'
                }`}
             >
                {sb.idea.title}
             </button>
           ))}
        </div>
      )}
      
      <div className="space-y-8">
        {activeStoryboard.storyboard.map((scene, sceneIndex) => (
          <SceneEditor
            key={scene.sceneNumber}
            scene={scene}
            storyboardIndex={activeIdeaIndex}
            sceneIndex={sceneIndex}
            onUpdate={handleUpdateScene}
            onGenerateImage={handleGenerateImage}
            aspectRatio={projectData.aspectRatio}
          />
        ))}
      </div>

       <div className="flex justify-between items-center mt-12">
         <button onClick={prevStep} className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-6 rounded-full transition-colors border border-gray-300">
           <ArrowLeftIcon className="w-5 h-5" />
           Quay Lại
         </button>
         <div className="flex items-center gap-4">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-6 rounded-full transition-colors border border-gray-300"
            >
              <FileTextIcon className="w-5 h-5" />
              Export PDF
            </button>
            <button 
              onClick={nextStep}
              className="bg-[#f58220] hover:bg-[#e0751c] text-white font-bold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all"
            >
              Hoàn Tất Dự Án
            </button>
         </div>
      </div>
    </div>
  );
};