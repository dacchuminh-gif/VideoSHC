import type { ProjectData } from '../types';

function generatePrintableHTML(projectData: ProjectData, storyboardIndex?: number): string {
  const { goal, audience, storyboards } = projectData;

  const storyboardsToPrint = storyboardIndex !== undefined && storyboards
    ? [storyboards[storyboardIndex]]
    : storyboards || [];

  const styles = `
    <style>
      body { font-family: sans-serif; line-height: 1.6; color: #333; }
      @page { size: A4; margin: 20mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none; }
        .page-break { page-break-before: always; }
      }
      .container { max-width: 100%; margin: 0 auto; }
      h1, h2, h3, h4, h5 { color: #111; }
      h1 { font-size: 2.5em; text-align: center; margin-bottom: 2rem; }
      h2 { font-size: 2em; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; margin-top: 2.5rem; }
      h3 { font-size: 1.5em; color: #555; }
      h4 { font-size: 1.2em; }
      .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; background: #f9f9f9; padding: 1rem; border-radius: 8px; }
      .storyboard-section { margin-top: 2rem; }
      .scene { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; page-break-inside: avoid; }
      .scene-content { display: grid; grid-template-columns: 200px 1fr; gap: 1.5rem; }
      .scene img { max-width: 100%; height: auto; border-radius: 4px; border: 1px solid #eee; }
      .scene-details p { margin: 0 0 0.5rem; }
      .scene-details strong { color: #444; }
    </style>
  `;

  let content = `
    <div class="container">
      <h1>Báo Cáo Dự Án Video Marketing</h1>
      
      <h2>Tóm Tắt Dự Án</h2>
      <div class="summary-grid">
        <div>
          <h4>Mục Tiêu Marketing</h4>
          <p>${goal}</p>
        </div>
        <div>
          <h4>Đối Tượng Mục Tiêu</h4>
          <p>${audience}</p>
        </div>
      </div>
  `;

  storyboardsToPrint.forEach((sbData, index) => {
    content += `
      <div class="storyboard-section ${index > 0 ? 'page-break' : ''}">
        <h2>Ý Tưởng: ${sbData.idea.title}</h2>
        <p><strong>Góc độ:</strong> ${sbData.idea.angle}</p>
        <p><strong>Concept:</strong> ${sbData.idea.concept}</p>

        <h3>Bảng Phân Cảnh & Kịch Bản</h3>
    `;
    sbData.storyboard.forEach(scene => {
      content += `
        <div class="scene">
          <h4>Cảnh ${scene.sceneNumber} (${scene.duration} giây)</h4>
          <div class="scene-content">
            <div class="scene-image">
              ${scene.imageUrl && scene.imageUrl !== 'error' ? `<img src="${scene.imageUrl}" alt="Cảnh ${scene.sceneNumber}">` : '<div style="background:#eee; height:112.5px; display:flex; align-items:center; justify-content:center; color:#888; text-align:center; border-radius:4px;">No Image</div>'}
            </div>
            <div class="scene-details">
              <p><strong>Mô tả hình ảnh:</strong> ${scene.visualDescription}</p>
              <p><strong>Chi tiết cảnh:</strong> ${scene.sceneDetails}</p>
              <p><strong>Gợi ý Visuals:</strong> ${scene.visualSuggestions}</p>
              <p><strong>Lời thoại/Thuyết minh:</strong> ${scene.voiceover}</p>
            </div>
          </div>
        </div>
      `;
    });
    content += `</div>`;
  });

  content += `</div>`;

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Báo cáo dự án - ${projectData.goal}</title>
      ${styles}
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}

export function printProject(projectData: ProjectData, storyboardIndex?: number) {
  const htmlContent = generatePrintableHTML(projectData, storyboardIndex);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  } else {
    alert('Vui lòng cho phép pop-up để in báo cáo.');
  }
}
