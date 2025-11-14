import React, { useState, useEffect } from 'react';
import type { ProjectData, AnalyzedData } from '../types';
import { generateContentIdeas } from '../services/geminiService';
import { HeartBreakIcon, RocketIcon, RouteIcon, SearchIcon, PlusCircleIcon, TrashIcon, ArrowLeftIcon } from './icons';

interface Step2Props {
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

const EditableInsightCard = ({ title, icon, colorClass, items, onUpdate }: { title: string, icon: React.ReactNode, colorClass: string, items: string[], onUpdate: (newItems: string[]) => void }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState('');

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdate(newItems);
    };

    const handleSaveNewItem = () => {
        if (newItem.trim()) {
            onUpdate([...items, newItem.trim()]);
        }
        setNewItem('');
        setIsAdding(false);
    };
    
    const handleCancel = () => {
        setNewItem('');
        setIsAdding(false);
    };

    return (
        <div className={`bg-white p-6 rounded-2xl border border-gray-200 shadow-lg flex flex-col transition-all hover:border-gray-300/80 hover:shadow-purple-500/10`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${colorClass.replace('text-', 'bg-').replace('500', '100').replace('f58220', 'f58220/20')}`}>
                    {icon}
                </div>
                <h3 className={`text-xl font-semibold ${colorClass}`}>{title}</h3>
            </div>
            <div className="space-y-3 flex-grow">
                {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 group">
                        <p className="flex-grow w-full bg-gray-50 rounded-md px-3 py-2 text-gray-700">
                            {item}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          aria-label="Xóa insight"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>

            {isAdding && (
                <div className="mt-4 space-y-2">
                    <AutosizeTextarea
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-gray-900 focus:ring-1 focus:ring-[#007dc5] transition-all resize-none"
                      placeholder="Nhập insight mới..."
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 px-3 py-1 text-sm rounded-md transition-colors">Hủy</button>
                        <button onClick={handleSaveNewItem} className="bg-[#007dc5] hover:bg-[#0070b4] text-white px-3 py-1 text-sm rounded-md font-semibold transition-colors">Lưu</button>
                    </div>
                </div>
            )}

            {!isAdding && (
                 <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="mt-4 flex items-center justify-center gap-2 text-sm text-[#007dc5] hover:text-[#0070b4] font-semibold transition-colors w-full border-2 border-dashed border-gray-300 hover:border-[#007dc5] rounded-lg py-2"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    Thêm Insight
                </button>
            )}
        </div>
    );
};


export const Step2InsightAnalysis: React.FC<Step2Props> = ({ projectData, setProjectData, nextStep, prevStep, setIsLoading, setError }) => {
  const [editableAnalyzedData, setEditableAnalyzedData] = useState<AnalyzedData | undefined>(projectData.analyzedData);

  useEffect(() => {
      if (projectData.analyzedData) {
          setEditableAnalyzedData(projectData.analyzedData);
      }
  }, [projectData.analyzedData]);
  
  const handleUpdateCategory = (category: keyof AnalyzedData, newItems: string[]) => {
      setEditableAnalyzedData(prev => {
          if (!prev) return undefined;
          return { ...prev, [category]: newItems };
      });
  };

  const handleContinue = async () => {
    if (!editableAnalyzedData || Object.values(editableAnalyzedData).every(arr => arr.length === 0)) {
      setError("Dữ liệu phân tích không được để trống. Vui lòng cung cấp ít nhất một insight.");
      return;
    }
    
    const finalAnalyzedData: AnalyzedData = {
        pain_points: editableAnalyzedData.pain_points.filter(i => i.trim() !== ''),
        desires: editableAnalyzedData.desires.filter(i => i.trim() !== ''),
        key_behaviors: editableAnalyzedData.key_behaviors.filter(i => i.trim() !== ''),
        identified_gaps: editableAnalyzedData.identified_gaps.filter(i => i.trim() !== ''),
    };

    setIsLoading(true);
    setError(null);
    try {
      setProjectData(prev => ({...prev, analyzedData: finalAnalyzedData}));
      const ideas = await generateContentIdeas(finalAnalyzedData);
      setProjectData(prev => ({...prev, contentIdeas: ideas}));
      nextStep();
    } catch(err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định khi tạo ý tưởng nội dung.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!editableAnalyzedData) {
    return (
      <div className="text-center">
        <p className="text-red-500">Không tìm thấy dữ liệu phân tích. Vui lòng quay lại bước trước.</p>
        <button onClick={prevStep} className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">
          Quay Lại
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-[#007dc5] mb-2">Phân Tích & Tinh Chỉnh Insight</h2>
      <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">AI đã phân tích các insight bạn cung cấp. Hãy xem lại, chỉnh sửa, hoặc bổ sung để đảm bảo chúng phản ánh chính xác nhất khách hàng của bạn.</p>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-start">
          <EditableInsightCard 
              title="Nỗi Đau Chính"
              icon={<HeartBreakIcon className="w-6 h-6 text-[#f58220]"/>}
              colorClass="text-[#f58220]"
              items={editableAnalyzedData.pain_points}
              onUpdate={(newItems) => handleUpdateCategory('pain_points', newItems)}
          />
          <EditableInsightCard 
              title="Mong Muốn Sâu Thẳm"
              icon={<RocketIcon className="w-6 h-6 text-[#007dc5]"/>}
              colorClass="text-[#007dc5]"
              items={editableAnalyzedData.desires}
              onUpdate={(newItems) => handleUpdateCategory('desires', newItems)}
          />
          <EditableInsightCard 
              title="Hành Vi Chính"
              icon={<RouteIcon className="w-6 h-6 text-[#007dc5]"/>}
              colorClass="text-[#007dc5]"
              items={editableAnalyzedData.key_behaviors}
              onUpdate={(newItems) => handleUpdateCategory('key_behaviors', newItems)}
          />
          <EditableInsightCard 
              title="Khoảng Trống & Cơ Hội"
              icon={<SearchIcon className="w-6 h-6 text-[#007dc5]"/>}
              colorClass="text-[#007dc5]"
              items={editableAnalyzedData.identified_gaps}
              onUpdate={(newItems) => handleUpdateCategory('identified_gaps', newItems)}
          />
      </div>

      <div className="flex justify-between items-center mt-12">
        <button onClick={prevStep} className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-6 rounded-full transition-colors border border-gray-300">
          <ArrowLeftIcon className="w-5 h-5" />
          Quay Lại
        </button>
        <button onClick={handleContinue} className="bg-[#f58220] hover:bg-[#e0751c] text-white font-bold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all">
          Tạo 6 Ý Tưởng Nội Dung
        </button>
      </div>
    </div>
  );
};