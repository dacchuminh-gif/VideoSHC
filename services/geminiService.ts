import { GoogleGenAI, Type } from "@google/genai";
import type { ProjectData, ContentIdea, ScriptScene, AnalyzedData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-4.0-generate-001';

const productContext = `
**Bối cảnh Sản phẩm (Product Context):**
Bạn đang tạo nội dung cho các thương hiệu chăm sóc mẹ và bé Fysoline và Sachi. Hãy sử dụng kiến thức này để tạo ra các ý tưởng và kịch bản phù hợp, tập trung vào việc giải quyết các vấn đề của khách hàng một cách tự nhiên.
- **Trọng tâm chung:** Sản phẩm tự nhiên, an toàn, hiệu quả cho các vấn đề thường gặp ở trẻ sơ sinh và trẻ nhỏ.
- **Fysoline (Nước muối sinh lý):**
  - **Fysoline Isotonic (Hồng):** Dùng cho vệ sinh hàng ngày (mắt, mũi, rốn) của trẻ sơ sinh 0+. USP: ống đơn liều vô trùng, không chất bảo quản.
  - **Fysoline Septinasal (Vàng):** Dùng khi bé bị sổ mũi, cảm cúm. Chứa Cỏ xạ hương và Đồng sulfat giúp kháng khuẩn tự nhiên.
  - **Fysoline Hypertonic (Xanh):** Dùng khi bé bị nghẹt mũi. Nước muối ưu trương (2.3%) giúp giảm sưng và có Natri hyaluronat để giữ ẩm, tránh khô mũi.
- **Sachi (Sản phẩm tự nhiên cho bé):**
  - **Gạc răng miệng Sachi 0+:** Vệ sinh nướu, lưỡi cho trẻ sơ sinh. Thành phần chính: Cúc La Mã, Lô hội. USP: đóng gói trong màng nhôm cao cấp, mỗi gạc một gói.
  - **Tinh dầu tràm Sachi:** Giữ ấm cơ thể, phòng cảm lạnh, đuổi côn trùng. USP: tinh khiết 100%, từ tràm gió đặc hữu của Quảng Trị - Huế.
  - **Nước tắm thảo dược Sachi:** Dịu nhẹ cho da bé, ngừa rôm sảy. USP: chứa thành phần độc đáo là Lá tre non.
  - **Nước giặt xả Organic Sachi:** Làm sạch vết bẩn bằng 3 enzyme sinh học. An toàn cho da nhạy cảm của bé.
  - **Xịt răng miệng Fibregum Sachi (1+ tuổi):** Ngăn ngừa sâu răng, giảm mảng bám. Hoạt chất chính: Fibregum P nhập khẩu từ Pháp. An toàn khi nuốt, không chứa Flour.
  - **Kem đánh răng tạo bọt Postbiotics Sachi (12+ tháng):** Dạng bọt siêu mịn dễ dàng làm sạch kẽ răng. Hoạt chất chính: Totipro Postbiotics PE0301® độc quyền. Không chứa Flour.

Khi đề xuất ý tưởng và viết kịch bản, hãy tập trung vào "vấn đề" của người dùng (ví dụ: bé bị nghẹt mũi, mẹ lo lắng về hóa chất trong nước giặt, làm sao để vệ sinh răng miệng cho bé sơ sinh?) và giới thiệu sản phẩm như một giải pháp đáng tin cậy, an toàn và hiệu quả.`;


// --- API Functions ---

export async function analyzeUserInsights(data: ProjectData): Promise<AnalyzedData> {
  const { goal, audience, userInsights } = data;
  const prompt = `
    Đóng vai một chuyên gia phân tích dữ liệu marketing và tâm lý học khách hàng. Dựa trên thông tin được cung cấp cho một chiến dịch video marketing, hãy thực hiện một phân tích sâu sắc.

    **Thông tin chiến dịch:**
    - Mục tiêu Marketing: "${goal}"
    - Đối tượng mục tiêu: "${audience}"
    - Insights ban đầu: "${userInsights}"

    Nhiệm vụ của bạn là phân tích, mở rộng, và cấu trúc các insight của khách hàng thành các danh mục riêng biệt. Dựa trên kinh nghiệm của một chuyên gia, hãy suy luận và bổ sung các insight tiềm năng mà người dùng có thể đã bỏ qua, sau đó phân loại chúng như sau:
    1.  **Nỗi đau chính (Pain Points):** Xác định 2-3 nỗi đau hoặc vấn đề cốt lõi mà đối tượng mục tiêu đang gặp phải. Bao gồm cả những nỗi đau được cung cấp và những nỗi đau bạn suy luận được.
    2.  **Mong muốn sâu thẳm (Desires):** Xác định 2-3 mong muốn hoặc kết quả lý tưởng mà đối tượng mục tiêu khao khát. Bao gồm cả những mong muốn được cung cấp và những mong muốn bạn suy luận được.
    3.  **Hành vi chính (Key Behaviors):** Mô tả 1-2 hành vi hoặc thói quen điển hình của đối tượng này liên quan đến vấn đề. Suy luận dựa trên bối cảnh được cung cấp.
    4.  **Khoảng trống & Cơ hội (Identified Gaps & Opportunities):** Đặt ra 2-3 câu hỏi chiến lược hoặc xác định các cơ hội marketing chưa được khai thác. Các câu hỏi này nên tập trung vào việc xác thực các giả định hoặc khám phá các khía cạnh chưa được đề cập.

    Trả về một đối tượng JSON bằng tiếng Việt, tuân thủ nghiêm ngặt schema được cung cấp.
  `;

  const response = await ai.models.generateContent({
    model: textModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pain_points: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Một danh sách 2-3 nỗi đau hoặc vấn đề cốt lõi, bao gồm cả các insight được cung cấp và suy luận."
          },
          desires: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Một danh sách 2-3 mong muốn hoặc kết quả lý tưởng, bao gồm cả các insight được cung cấp và suy luận."
          },
          key_behaviors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Một danh sách 1-2 hành vi hoặc thói quen điển hình được suy luận từ bối cảnh."
          },
          identified_gaps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Một danh sách 2-3 câu hỏi chiến lược hoặc cơ hội marketing chưa được khai thác."
          }
        },
        required: ["pain_points", "desires", "key_behaviors", "identified_gaps"]
      }
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as AnalyzedData;
}


export async function generateContentIdeas(analyzedData: AnalyzedData): Promise<ContentIdea[]> {
    const prompt = `
        Bạn là một giám đốc sáng tạo chuyên về video marketing lan truyền. 
        
        ${productContext}

        Dựa trên bản phân tích insight khách hàng chi tiết sau, hãy tạo ra chính xác 6 ý tưởng nội dung video khác biệt và hấp dẫn.
        
        **Bản Phân Tích Insight Khách Hàng:**
        - **Nỗi đau chính:** ${analyzedData.pain_points.join('; ')}
        - **Mong muốn sâu thẳm:** ${analyzedData.desires.join('; ')}
        - **Hành vi chính:** ${analyzedData.key_behaviors.join('; ')}
        - **Khoảng trống & Cơ hội:** ${analyzedData.identified_gaps.join('; ')}

        **Yêu cầu:**
        1.  Tạo **6 ý tưởng** độc đáo.
        2.  Mỗi ý tưởng phải giải quyết trực tiếp một hoặc nhiều điểm trong bản phân tích và bối cảnh sản phẩm.
        3.  Với mỗi ý tưởng, cung cấp:
            - \`title\`: Một tiêu đề ngắn gọn, hấp dẫn.
            - \`concept\`: Mô tả ý tưởng trong 2-3 câu, giải thích cách nó kết nối với insight.
            - \`angle\`: Góc độ tiếp cận chính (ví dụ: Giải Quyết Vấn Đề, Truyền Cảm Hứng, Hướng Dẫn Thực Tế, So Sánh, Hài Hước).

        Trả về một mảng JSON bằng tiếng Việt, tuân thủ nghiêm ngặt schema được cung cấp, chứa một mảng gồm chính xác 6 đối tượng ý tưởng.
    `;

    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Tiêu đề của ý tưởng video" },
                        concept: { type: Type.STRING, description: "Mô tả ngắn gọn về ý tưởng" },
                        angle: { type: Type.STRING, description: "Góc độ tiếp cận chính" }
                    },
                    required: ["title", "concept", "angle"]
                }
            }
        }
    });
    
    const jsonText = response.text.trim();
    const ideas = JSON.parse(jsonText) as ContentIdea[];
    if (ideas.length > 6) {
        return ideas.slice(0, 6);
    }
    return ideas;
}

export async function writeScript(projectData: ProjectData, idea: ContentIdea): Promise<ScriptScene[]> {
    const { 
        audience, 
        videoType, 
        platform, 
        scriptStructure, 
        videoStyle, 
        duration, 
        sceneCount, 
        cta 
    } = projectData;

    const prompt = `
        Bạn là một nhà biên kịch và đạo diễn chuyên nghiệp cho các video marketing lan truyền. Nhiệm vụ của bạn là viết một kịch bản video hoàn chỉnh và chi tiết.

        ${productContext}

        **Bối cảnh về các Cấu trúc Kịch bản:**
        - **PAS (Vấn đề-Khuấy động-Giải pháp):** Bắt đầu bằng việc trình bày vấn đề, sau đó khuấy động cảm xúc tiêu cực liên quan đến vấn đề đó, và cuối cùng đưa ra giải pháp của bạn.
        - **AIDA (Chú ý-Quan tâm-Mong muốn-Hành động):** Thu hút sự chú ý, tạo ra sự quan tâm, khơi dậy mong muốn sở hữu, và kết thúc bằng lời kêu gọi hành động rõ ràng.
        - **Story Telling (Kể chuyện):** Xây dựng một câu chuyện có nhân vật, bối cảnh, và một diễn biến (mở đầu, cao trào, kết thúc) để truyền tải thông điệp một cách cảm xúc và dễ nhớ. Câu chuyện có thể về khách hàng, thương hiệu, hoặc một tình huống đời thực.
        - **Trước & Sau:** Hiển thị rõ ràng tình trạng của khách hàng trước khi sử dụng sản phẩm và kết quả tích cực, đáng mơ ước sau khi sử dụng.
        - **Chiến lược Inside-Out (Giá trị cốt lõi):** Tập trung vào bản sắc, sứ mệnh và giá trị cốt lõi của thương hiệu. Mục tiêu là xây dựng niềm tin và kết nối lâu dài. Kịch bản nên kể câu chuyện về "lý do" của thương hiệu, không chỉ là "cái gì".
        - **Mô hình ICEPERG (Tâm lý thuyết phục):** Một khung tâm lý để thuyết phục khán giả. Tuân thủ 7 bước logic: Issue (Vấn đề), Consequence (Hậu quả nếu không giải quyết), Emotion (Kết nối cảm xúc), Proof (Bằng chứng, dữ liệu), Edge (Lợi thế độc nhất), Resolution (Giải pháp của bạn), và Gain (Lợi ích tích cực).
        - **AI tự do sáng tạo:** Với tư cách là AI, bạn có toàn quyền sáng tạo. Hãy phân tích tất cả các thông số chiến lược và ý tưởng được cung cấp, sau đó tự chọn hoặc tạo ra cấu trúc kịch bản hiệu quả nhất để đạt được mục tiêu chiến dịch.

        **Thông số chiến lược:**
        - Đối tượng mục tiêu: "${audience}"
        - Loại video: "${videoType}"
        - Nền tảng mục tiêu: "${platform}"
        - Cấu trúc kịch bản được chọn: "${scriptStructure}"
        - Phong cách video: "${videoStyle}"
        - Thời lượng video tổng thể mong muốn: ${duration} giây
        - Số lượng cảnh: ${sceneCount}
        - Kêu gọi hành động (CTA): "${cta}"

        **Ý tưởng sáng tạo:**
        - Tiêu đề: "${idea.title}"
        - Ý tưởng: "${idea.concept}"
        - Góc độ: "${idea.angle}"

        **Yêu cầu:**
        1.  Viết một kịch bản chi tiết cho chính xác ${sceneCount} cảnh.
        2.  Phân bổ thời lượng tổng thể (${duration} giây) một cách hợp lý cho từng cảnh.
        3.  Kịch bản phải tuân thủ chặt chẽ cấu trúc đã chọn: "${scriptStructure}". Nếu cấu trúc là "AI tự do sáng tạo", hãy tự quyết định cấu trúc tốt nhất và tuân theo nó.
        4.  Phong cách và giọng văn phải phù hợp với "${videoStyle}" và nền tảng "${platform}". **Quan trọng nhất, hãy sử dụng ngôn ngữ đời thường, gần gũi, và chân thật như một cuộc trò chuyện tự nhiên, tránh giọng văn quá trang trọng hoặc sặc mùi quảng cáo.**
        5.  Cảnh cuối cùng PHẢI tích hợp lời kêu gọi hành động: "${cta}".
        6.  Đối với mỗi cảnh, cung cấp:
            -   \`scene_number\`: Số thứ tự của cảnh.
            -   \`duration_seconds\`: Thời lượng ước tính cho cảnh này (tính bằng giây).
            -   \`visual_description\`: Mô tả chính về hình ảnh cho storyboard. Nội dung này sẽ được dùng để tạo gợi ý hình ảnh (image prompt). Viết một cách cô đọng, giàu hình ảnh.
            -   \`scene_details\`: Mô tả chi tiết hơn về các hành động, biểu cảm, sự kiện diễn ra trong cảnh.
            -   \`visual_suggestions\`: Các gợi ý cụ thể về kỹ thuật quay phim (góc máy, chuyển động máy), ánh sáng, màu sắc.
            -   \`voiceover_text\`: Lời thoại, thuyết minh, hoặc văn bản sẽ hiển thị trên màn hình.

        Trả về một đối tượng JSON chứa khóa "script", là một mảng các đối tượng cảnh, bằng tiếng Việt và tuân thủ nghiêm ngặt schema được cung cấp.
    `;

    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    script: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                scene_number: { type: Type.INTEGER, description: "Số thứ tự của cảnh" },
                                duration_seconds: { type: Type.INTEGER, description: "Thời lượng của cảnh tính bằng giây" },
                                visual_description: { type: Type.STRING, description: "Mô tả hình ảnh chính cho storyboard" },
                                scene_details: { type: Type.STRING, description: "Chi tiết hành động và sự kiện trong cảnh" },
                                visual_suggestions: { type: Type.STRING, description: "Gợi ý về góc máy, ánh sáng, màu sắc" },
                                voiceover_text: { type: Type.STRING, description: "Lời thoại hoặc thuyết minh cho cảnh" }
                            },
                             required: ["scene_number", "duration_seconds", "visual_description", "scene_details", "visual_suggestions", "voiceover_text"]
                        }
                    }
                },
                required: ["script"]
            }
        }
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    return parsedResponse.script as ScriptScene[];
}

export async function createStoryboardPrompts(script: ScriptScene[], aspectRatio: string): Promise<string[]> {
    const prompt = `
        You are an expert prompt engineer for advanced text-to-image and text-to-video AI models (like Google Veo, Kling, Runway, Imagen). Your task is to convert Vietnamese script scenes into highly detailed, structured, and effective prompts in ENGLISH. The final image should feel like a **candid, authentic, slice-of-life photograph capturing a genuine moment of a modern Vietnamese family**. Avoid any aesthetic that looks overly staged, artificial, or like a generic stock photo.

        **CRITICAL RULE: VIETNAMESE CONTEXT**
        - ALL human subjects (babies, mothers, fathers, doctors, etc.) MUST be explicitly described as Vietnamese. Use terms like "Vietnamese mother," "Vietnamese baby," "young Vietnamese couple."
        - The environment and props must reflect modern Vietnam. For example, "a cozy living room in a Ho Chi Minh City apartment," or "a bustling Hanoi street market."
        - Any visible text (signs, documents, on-screen text) must be in Vietnamese. Specify this in the prompt, for example, "a doctor's prescription with Vietnamese text."
        - This is non-negotiable. Every prompt must contain these Vietnamese cultural and ethnic specifiers.

        **Target Aspect Ratio:** ${aspectRatio}. This is crucial for the composition.

        For each scene provided in the JSON input, create one comprehensive prompt. The prompt must be a single block of text, structured with clear headings as follows. Do not use markdown formatting like \`###\` or \`**\` in the final output string, just plain text with newlines.

        **Output Structure for each prompt:**
        Subject/Theme: [Main subject and core idea of the scene]
        Emotion: [Key emotions to capture, e.g., Joy, warmth, suspense, curiosity]
        Environment: [Detailed description of the setting, background, and key objects]
        Lighting: [Specific lighting style, e.g., Soft diffused natural light, dramatic chiaroscuro, warm ambient glow]
        Color Palette: [Dominant colors and overall color mood, e.g., Warm earthy tones, vibrant neons, monochromatic blue]
        Camera & Composition: [Camera angle, shot type, lens, and composition rules, e.g., Medium shot, eye-level, shallow depth of field, rule of thirds]
        Quality & Style: [Desired final look and artistic style, e.g., Candid lifestyle photography, authentic slice-of-life, photorealistic, cinematic with natural lighting, hyper-detailed, 8K, UHD. Focus on genuine emotions and a documentary feel.]

        **Vietnamese Script Scenes (JSON Input):**
        ${JSON.stringify(script, null, 2)}

        Based on the input above, generate a JSON object with a single key "prompts". This key should contain an array of strings, where each string is a fully structured prompt corresponding to each scene in the input, in the same order.
    `;

    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    prompts: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ["prompts"]
            }
        }
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    return parsedResponse.prompts as string[];
}


export async function generateImage(prompt: string, aspectRatio: string): Promise<string> {
    // The detailed prompt is already structured, no need to add more keywords.
    const response = await ai.models.generateImages({
        model: imageModel,
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: "image/jpeg",
            aspectRatio: aspectRatio,
        }
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}