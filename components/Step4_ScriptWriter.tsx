import React, { useState, useEffect } from 'react';
import type { ProjectData, ScriptScene, StoryboardScene, ContentIdea } from '../types';
import { createStoryboardPrompts } from '../services/geminiService';
import { ImageIcon, ClapperboardIcon, WandIcon, MegaphoneIcon, ClockIcon, ArrowLeftIcon } from './icons';

interface Step4Props {
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  nextStep: () => void;
  prevStep: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const AutosizeTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
    const ref = React.useRef<HTMLTextAreaElement>(null);
    React.useLayoutEffect(() => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
    }, [props.value]);
    return <textarea {...props} ref={ref} />;
};

const FormField: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
    <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-1">
            {icon}
            {label}
        </label>
        {children}
    </div>
);

export const Step4ScriptWriter: React.FC<Step4Props> = ({ projectData, setProjectData, nextStep, prevStep, setIsLoading, setError }) => {
  const [editableScripts, setEditableScripts] = useState<{ idea: ContentIdea; script: ScriptScene[] }[]>(projectData.scripts || []);

  useEffect(() => {
    setEditableScripts(projectData.scripts || []);
  }, [projectData.scripts]);

  const handleScriptChange = (
      scriptIndex: number, 
      sceneIndex: number, 
      field: keyof ScriptScene, 
      value: string | number
  ) => {
    const updatedScripts = [...editableScripts];
    const targetScript = { ...updatedScripts[scriptIndex] };
    const updatedScene = { ...targetScript.script[sceneIndex], [field]: value };
    targetScript.script = [...targetScript.script];
    targetScript.script[sceneIndex] = updatedScene;
    updatedScripts[scriptIndex] = targetScript;
    setEditableScripts(updatedScripts);
  };

  const handleContinue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setProjectData(prev => ({ ...prev, scripts: editableScripts }));
      
      const promptPromises = editableScripts.map(scriptData => createStoryboardPrompts(scriptData.script, projectData.aspectRatio));
      const allPrompts = await Promise.all(promptPromises);

      const initialStoryboards = editableScripts.map((scriptData, index) => {
        const prompts = allPrompts[index];
        const storyboard: StoryboardScene[] = scriptData.script.map((scene, sceneIndex) => ({
          sceneNumber: scene.scene_number,
          duration: scene.duration_seconds,
          visualDescription: scene.visual_description,
          sceneDetails: scene.scene_details,
          visualSuggestions: scene.visual_suggestions,
          voiceover: scene.voiceover_text,
          imagePrompt: prompts[sceneIndex] || 'A generic placeholder image',
          imageUrl: '',
          isLoading: false, // On-demand generation in Step 5
        }));
        return { idea: scriptData.idea, storyboard };
      });

      setProjectData(prev => ({ ...prev, storyboards: initialStoryboards }));
      nextStep();

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định khi chuẩn bị bảng phân cảnh.");
    } finally {
      setIsLoading(false);
    } 
  };

  if (!editableScripts || editableScripts.length === 0) {
    return (
       <div className="text-center">
        <p className="text-red-500">Không tìm thấy kịch bản. Vui lòng quay lại.</p>
        <button onClick={prevStep} className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">
          Quay Lại
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-[#007dc5] mb-2">Kịch Bản Video Của Bạn</h2>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">Xem lại và tinh chỉnh các kịch bản do AI tạo ra. Hình ảnh sẽ được tạo dựa trên mô tả bạn cung cấp ở đây.</p>
      
      <div className="space-y-10 p-1">
        {editableScripts.map((scriptData, scriptIndex) => (
            <div key={scriptIndex} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
                <h3 className="text-2xl font-bold text-[#007dc5] mb-6">{scriptData.idea.title}</h3>
                <div className="space-y-8">
                {scriptData.script.map((scene, sceneIndex) => (
                  <div key={scene.scene_number} className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-xl text-[#007dc5]">Cảnh {scene.scene_number}</h4>
                      <FormField label="Thời lượng (giây)" icon={<ClockIcon className="w-4 h-4" />}>
                         <input
                            type="number"
                            value={scene.duration_seconds}
                            onChange={(e) => handleScriptChange(scriptIndex, sceneIndex, 'duration_seconds', parseInt(e.target.value, 10) || 0)}
                            className="w-20 bg-white border border-gray-300 rounded-md p-1 text-gray-900 text-center focus:ring-1 focus:ring-[#007dc5]"
                         />
                      </FormField>
                    </div>

                    <div className="space-y-4">
                        <FormField label="Gợi ý Hình ảnh (cho Storyboard)" icon={<ImageIcon className="w-5 h-5 text-gray-500" />}>
                            <AutosizeTextarea
                                value={scene.visual_description}
                                onChange={(e) => handleScriptChange(scriptIndex, sceneIndex, 'visual_description', e.target.value)}
                                className="mt-1 w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-1 focus:ring-[#007dc5] transition resize-none"
                                rows={2}
                            />
                        </FormField>
                        <FormField label="Chi tiết cảnh & Hành động" icon={<ClapperboardIcon className="w-5 h-5 text-gray-500" />}>
                            <AutosizeTextarea
                                value={scene.scene_details}
                                onChange={(e) => handleScriptChange(scriptIndex, sceneIndex, 'scene_details', e.target.value)}
                                className="mt-1 w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-1 focus:ring-[#007dc5] transition resize-none"
                                rows={2}
                            />
                        </FormField>
                        <FormField label="Gợi ý Visuals (Góc máy, Ánh sáng...)" icon={<WandIcon className="w-5 h-5 text-gray-500" />}>
                            <AutosizeTextarea
                                value={scene.visual_suggestions}
                                onChange={(e) => handleScriptChange(scriptIndex, sceneIndex, 'visual_suggestions', e.target.value)}
                                className="mt-1 w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-1 focus:ring-[#007dc5] transition resize-none"
                                rows={2}
                            />
                        </FormField>
                        <FormField label="Lời Thoại / Thuyết minh" icon={<MegaphoneIcon className="w-5 h-5 text-gray-500" />}>
                            <AutosizeTextarea
                                value={scene.voiceover_text}
                                onChange={(e) => handleScriptChange(scriptIndex, sceneIndex, 'voiceover_text', e.target.value)}
                                className="mt-1 w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-1 focus:ring-[#007dc5] transition resize-none"
                                rows={2}
                            />
                        </FormField>
                    </div>
                  </div>
                ))}
                </div>
            </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-12">
        <button onClick={prevStep} className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-6 rounded-full transition-colors border border-gray-300">
          <ArrowLeftIcon className="w-5 h-5" />
          Quay Lại
        </button>
        <button onClick={handleContinue} className="bg-[#f58220] hover:bg-[#e0751c] text-white font-bold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all">
          Tạo Bảng Phân Cảnh
        </button>
      </div>
    </div>
  );
};