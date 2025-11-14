import React from 'react';
import type { ProjectData } from '../types';
import { analyzeUserInsights } from '../services/geminiService';
import { TargetIcon, UsersIcon, LightbulbIcon, WandIcon, FilmIcon, RouteIcon, ClockIcon, ClapperboardIcon, MegaphoneIcon, RocketIcon, AspectRatioIcon } from './icons';

interface Step1Props {
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  nextStep: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const FormInput: React.FC<{ label: string; id: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, id, icon, children }) => (
    <div>
        <label htmlFor={id} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            {icon}
            {label}
        </label>
        {children}
    </div>
);

const SelectInput: React.FC<{ name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: (string | {value: string, label: string})[] }> = ({ name, value, onChange, options }) => (
    <select name={name} id={name} value={value} onChange={onChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#007dc5] focus:border-[#007dc5] transition-all">
        {options.map(opt => {
            if (typeof opt === 'string') {
                return <option key={opt} value={opt}>{opt}</option>;
            }
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
        })}
    </select>
);

const TextInput: React.FC<{ name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }> = ({ name, value, onChange, placeholder }) => (
    <input type="text" id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#007dc5] focus:border-[#007dc5] transition-all" />
);

const TextareaInput: React.FC<{ name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder: string, rows?: number }> = ({ name, value, onChange, placeholder, rows = 1 }) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Reset height to 'auto' to let the `rows` attribute take effect
            // or to recalculate scrollHeight for growing.
            textarea.style.height = 'auto';

            // If there's content, set the height to scrollHeight to make it grow.
            if (value || textarea.scrollHeight > 0) { // check scrollHeight to handle initial render when value is empty but rows are set
                 textarea.style.height = `${textarea.scrollHeight}px`;
            }
            // If not, it will default to the height based on the `rows` attribute.
        }
    }, [value, rows]);

    return (
        <textarea
            ref={textareaRef}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#007dc5] focus:border-[#007dc5] transition-all resize-none overflow-hidden"
        />
    );
};

const SliderInput: React.FC<{ name: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min: number; max: number; step: number; unit: string; }> = ({ name, value, onChange, min, max, step, unit }) => (
    <div className="flex items-center gap-4">
        <input type="range" id={name} name={name} value={value} onChange={onChange} min={min} max={max} step={step} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        <span className="bg-[#007dc5]/20 text-[#007dc5] text-sm font-medium px-2.5 py-1 rounded-full w-20 text-center">{value}{unit}</span>
    </div>
);

const aspectRatioOptions = [
  { value: '9:16', label: '9:16 (Dọc - TikTok, Reels)' },
  { value: '16:9', label: '16:9 (Ngang - TV, YouTube)' },
  { value: '1:1', label: '1:1 (Vuông - Instagram, Facebook)' },
  { value: '4:3', label: '4:3 (Cổ điển)' },
  { value: '3:4', label: '3:4 (Chân dung)' },
];

export const Step1ProjectSetup: React.FC<Step1Props> = ({ projectData, setProjectData, nextStep, setIsLoading, setError }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumberInput = type === 'range';
    setProjectData(prev => ({ ...prev, [name]: isNumberInput ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const requiredFields: (keyof ProjectData)[] = ['goal', 'audience', 'userInsights', 'cta'];
    const missingFields = requiredFields.filter(field => !projectData[field]);

    if (missingFields.length > 0) {
        setError(`Vui lòng điền đầy đủ các trường: ${missingFields.join(', ')}.`);
        return;
    }

    setIsLoading(true);
    try {
      const analyzedData = await analyzeUserInsights(projectData);
      setProjectData(prev => ({ ...prev, analyzedData }));
      nextStep();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định trong quá trình phân tích insight.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-[#007dc5] mb-2">Xây dựng Chiến lược Video của bạn</h2>
      <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">Xác định các thuộc tính cốt lõi của video để có một kịch bản phù hợp. Bạn càng cụ thể, AI càng có thể hỗ trợ tốt hơn.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 p-6 bg-gray-50/50 rounded-lg border border-gray-200">
            {/* Strategic Inputs - Prioritized */}
            <FormInput label="Mục Tiêu Marketing" id="goal" icon={<RocketIcon className="w-5 h-5 mr-2 text-[#007dc5]" />}>
                <TextInput name="goal" value={projectData.goal} onChange={handleChange} placeholder="VD: Tăng 20% lượt đăng ký cho tính năng SaaS mới" />
            </FormInput>
            <FormInput label="Đối tượng mục tiêu" id="audience" icon={<TargetIcon className="w-5 h-5 mr-2 text-[#007dc5]" />}>
              <TextInput name="audience" value={projectData.audience} onChange={handleChange} placeholder="VD: Các bậc phụ huynh có con nhỏ (0-3 tuổi)" />
            </FormInput>
            
            <div className="md:col-span-2">
                <FormInput label="Insights Khách Hàng Ban Đầu" id="userInsights" icon={<LightbulbIcon className="w-5 h-5 mr-2 text-[#007dc5]" />}>
                    <TextareaInput name="userInsights" value={projectData.userInsights} onChange={handleChange} placeholder="Mô tả những gì bạn biết về nhu cầu, nỗi đau và mong muốn của khách hàng..." rows={6} />
                </FormInput>
            </div>
            
            {/* Video Specification Inputs */}
            <FormInput label="Loại Video" id="videoType" icon={<FilmIcon className="w-5 h-5 mr-2 text-[#007dc5]" />}>
              <SelectInput name="videoType" value={projectData.videoType} onChange={handleChange} options={['Hiệu suất', 'Thương hiệu', 'Giáo dục', 'Giải trí']} />
            </FormInput>
            <FormInput label="Nền tảng mục tiêu" id="platform" icon={<UsersIcon className="w-5 h-5 mr-2 text-[#007dc5]" />}>
              <SelectInput name="platform" value={projectData.platform} onChange={handleChange} options={['TikTok', 'Facebook', 'Instagram', 'YouTube', 'LinkedIn']} />
            </FormInput>
            <FormInput label="Tỷ lệ khung hình" id="aspectRatio" icon={<AspectRatioIcon className="w-5 h-5 mr-2 text-[#007dc5]" />}>
              <SelectInput name="aspectRatio" value={projectData.aspectRatio} onChange={handleChange} options={aspectRatioOptions} />
            </FormInput>
            <FormInput label="Cấu trúc kịch bản" id="scriptStructure" icon={<RouteIcon className="w-5 h-5 mr-2 text-[#007dc5]" />}>
              <SelectInput name="scriptStructure" value={projectData.scriptStructure} onChange={handleChange} options={[
                  'PAS (Vấn đề-Khuấy động-Giải pháp)', 
                  'AIDA (Chú ý-Quan tâm-Mong muốn-Hành động)', 
                  'Story Telling (Kể chuyện)', 
                  'Trước & Sau',
                  'Chiến lược Inside-Out (Giá trị cốt lõi)',
                  'Mô hình ICEPERG (Tâm lý thuyết phục)',
                  'AI tự do sáng tạo'
                ]} />
            </FormInput>
            <FormInput label="Phong cách Video" id="videoStyle" icon={<WandIcon className="w-5 h-5 mr-2 text-[#007dc5]" />}>
              <SelectInput name="videoStyle" value={projectData.videoStyle} onChange={handleChange} options={['Cung cấp thông tin', 'Hài hước', 'Truyền cảm hứng', 'Kịch tính', 'Tươi vui']} />
            </FormInput>
            <FormInput label="Thời lượng Video" id="duration" icon={<ClockIcon className="w-5 h-5 mr-2 text-[#007dc5]" />}>
              <SliderInput name="duration" value={projectData.duration} onChange={handleChange} min={15} max={180} step={5} unit="s" />
            </FormInput>
            <FormInput label="Số lượng cảnh" id="sceneCount" icon={<ClapperboardIcon className="w-5 h-5 mr-2 text-[#007dc5]" />}>
              <SliderInput name="sceneCount" value={projectData.sceneCount} onChange={handleChange} min={3} max={10} step={1} unit=" cảnh" />
            </FormInput>
             <div className="md:col-span-2">
                <FormInput label="Kêu gọi hành động cuối cùng (CTA)" id="cta" icon={<MegaphoneIcon className="w-5 h-5 mr-2 text-[#007dc5]" />}>
                    <TextInput name="cta" value={projectData.cta} onChange={handleChange} placeholder="VD: Đăng ký ngay để nhận ưu đãi!" />
                </FormInput>
            </div>
        </div>

        <div className="flex justify-center pt-4">
          <button 
            type="submit"
            className="flex items-center gap-2 bg-[#f58220] hover:bg-[#e0751c] text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <WandIcon className="w-5 h-5" />
            Phân Tích & Tiếp Tục
          </button>
        </div>
      </form>
    </div>
  );
};