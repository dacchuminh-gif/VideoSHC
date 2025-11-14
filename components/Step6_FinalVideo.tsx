import React from 'react';
import type { ProjectData } from '../types';
import { printProject } from '../services/printService';
import { ArrowLeftIcon, FileTextIcon } from './icons';

interface Step6Props {
  projectData: ProjectData;
  startOver: () => void;
  prevStep: () => void;
}

export const Step6FinalVideo: React.FC<Step6Props> = ({ projectData, startOver, prevStep }) => {
  const { goal, audience, storyboards } = projectData;
  
  const handleExport = () => {
    printProject(projectData);
  };

  return (
    <div className="animate-fade-in text-center">
      <h2 className="text-4xl font-extrabold text-[#007dc5] mb-4">
        Dự Án Hoàn Tất!
      </h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Tài sản video marketing của bạn đã được tạo. Bây giờ bạn có thể đưa kịch bản và bảng phân cảnh này cho đội ngũ sản xuất của mình.
      </p>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 text-left max-w-5xl mx-auto shadow-xl">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Tóm Tắt Dự Án</h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
                <p className="font-semibold text-gray-500">Mục Tiêu Marketing</p>
                <p className="text-lg text-gray-800">{goal}</p>
            </div>
            <div>
                <p className="font-semibold text-gray-500">Đối Tượng Mục Tiêu</p>
                <p className="text-lg text-gray-800">{audience}</p>
            </div>
        </div>

        <div className="space-y-8">
            {storyboards?.map((sbData, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="text-2xl font-semibold text-[#007dc5] mb-4">{sbData.idea.title}</h4>
                    <p className="text-sm text-gray-500 mb-1">Góc độ: <span className="font-semibold text-gray-700">{sbData.idea.angle}</span></p>
                    <p className="text-sm text-gray-600 mb-6">{sbData.idea.concept}</p>
                    
                    <div className="space-y-6">
                        <div>
                            <h5 className="text-xl font-semibold text-[#007dc5] mb-4">Bảng Phân Cảnh Cuối Cùng</h5>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-100 rounded-lg">
                                {sbData.storyboard.map(scene => (
                                    <div key={scene.sceneNumber} className="aspect-video bg-gray-200 rounded-md overflow-hidden group relative">
                                        <img src={scene.imageUrl} alt={`Cảnh ${scene.sceneNumber}`} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs p-1 rounded-tr-md">Cảnh {scene.sceneNumber}</div>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div>
                            <h5 className="text-xl font-semibold text-[#007dc5] mb-4">Kịch Bản Cuối Cùng</h5>
                            <div className="space-y-4 p-4 bg-gray-100 rounded-lg">
                                {sbData.storyboard.map(scene => (
                                    <div key={scene.sceneNumber}>
                                        <p className="font-bold text-gray-700">Cảnh {scene.sceneNumber}:</p>
                                        <p className="text-gray-600 pl-4">{scene.voiceover}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      <div className="mt-12 flex flex-wrap justify-center items-center gap-4">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 px-6 rounded-full transition-colors border border-gray-300"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Quay Lại
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 px-6 rounded-full transition-colors border border-gray-300"
        >
          <FileTextIcon className="w-5 h-5" />
          Export PDF
        </button>
        <button 
          onClick={startOver}
          className="bg-[#f58220] hover:bg-[#e0751c] text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all"
        >
          Tạo Dự Án Mới
        </button>
      </div>
    </div>
  );
};