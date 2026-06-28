import html2pdf from 'html2pdf.js'

export interface ScanReportData {
  diagnosis: string
  confidence: number
  severity: string
  follicleCount: number
  recommendations: string[]
  technicalDetails: {
    follicleSize: string
    ovarianVolume: string
    morphology?: string
    modelUsed?: string
  }
  scanImageDataUrl?: string | null
  fileName?: string
}

const PDF_OPTIONS = {
  margin: 10,
  filename: `OvaCare_Scan_Report_${Date.now()}.pdf`,
  image: { type: 'jpeg' as const, quality: 0.95 },
  html2canvas: { scale: 2, useCORS: true },
  jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' as const },
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildScanReportElement(data: ScanReportData): HTMLDivElement {
  const element = document.createElement('div')
  const generatedAt = new Date().toLocaleString()
  const recommendations = data.recommendations
    .map((rec) => `<li style="margin-bottom: 6px;">${escapeHtml(rec)}</li>`)
    .join('')

  const imageSection = data.scanImageDataUrl
    ? `<div style="margin: 20px 0; text-align: center;">
        <img src="${data.scanImageDataUrl}" alt="Ultrasound scan" style="max-width: 100%; max-height: 280px; border-radius: 8px; border: 1px solid #e2e8f0;" />
      </div>`
    : ''

  element.innerHTML = `
    <div style="padding: 40px; font-family: Arial, sans-serif; background: white; color: #1a365d;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
        <div>
          <h1 style="font-size: 28px; margin: 0 0 8px;">OvaCare Scan Analysis Report</h1>
          <p style="color: #4a5568; margin: 0; font-size: 14px;">AI-powered PCOS ultrasound analysis</p>
        </div>
        <div style="text-align: right; font-size: 12px; color: #718096;">
          <div>Generated: ${escapeHtml(generatedAt)}</div>
          ${data.fileName ? `<div>File: ${escapeHtml(data.fileName)}</div>` : ''}
        </div>
      </div>

      <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 20px 0;" />

      ${imageSection}

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
        <div style="padding: 16px; background: #f7fafc; border-left: 4px solid #7c2d7f; border-radius: 4px;">
          <div style="font-size: 12px; color: #718096; margin-bottom: 4px;">Diagnosis</div>
          <div style="font-size: 18px; font-weight: bold;">${escapeHtml(data.diagnosis)}</div>
        </div>
        <div style="padding: 16px; background: #f7fafc; border-left: 4px solid #7c2d7f; border-radius: 4px;">
          <div style="font-size: 12px; color: #718096; margin-bottom: 4px;">Confidence</div>
          <div style="font-size: 18px; font-weight: bold;">${data.confidence}%</div>
        </div>
        <div style="padding: 16px; background: #f7fafc; border-left: 4px solid #7c2d7f; border-radius: 4px;">
          <div style="font-size: 12px; color: #718096; margin-bottom: 4px;">Severity</div>
          <div style="font-size: 18px; font-weight: bold;">${escapeHtml(data.severity)}</div>
        </div>
        <div style="padding: 16px; background: #f7fafc; border-left: 4px solid #7c2d7f; border-radius: 4px;">
          <div style="font-size: 12px; color: #718096; margin-bottom: 4px;">Follicle Count</div>
          <div style="font-size: 18px; font-weight: bold;">${data.follicleCount}</div>
        </div>
      </div>

      <h2 style="font-size: 18px; margin-bottom: 12px;">Technical Details</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr style="background: #f7fafc;">
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Follicle Size</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${escapeHtml(data.technicalDetails.follicleSize)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Ovarian Volume</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${escapeHtml(data.technicalDetails.ovarianVolume)}</td>
        </tr>
        ${
          data.technicalDetails.morphology
            ? `<tr style="background: #f7fafc;">
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Morphology</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${escapeHtml(data.technicalDetails.morphology)}</td>
              </tr>`
            : ''
        }
        ${
          data.technicalDetails.modelUsed
            ? `<tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Model</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${escapeHtml(data.technicalDetails.modelUsed)}</td>
              </tr>`
            : ''
        }
      </table>

      <h2 style="font-size: 18px; margin-bottom: 12px;">Recommendations</h2>
      <ul style="padding-left: 20px; margin: 0 0 24px; color: #4a5568; font-size: 14px;">
        ${recommendations}
      </ul>

      <div style="background: #fffaf0; border: 1px solid #fed7aa; padding: 15px; border-radius: 8px; font-size: 12px; color: #92400e;">
        <strong>Disclaimer:</strong> This AI-generated report is for informational purposes only and does not replace professional medical diagnosis. Please consult a qualified healthcare provider for clinical evaluation.
      </div>
    </div>
  `

  return element
}

export async function generateScanReportPdfBlob(data: ScanReportData): Promise<Blob> {
  const element = buildScanReportElement(data)
  document.body.appendChild(element)

  try {
    const blob = await html2pdf().set(PDF_OPTIONS).from(element).outputPdf('blob')
    return blob as Blob
  } finally {
    document.body.removeChild(element)
  }
}

export async function downloadScanReportPdf(data: ScanReportData): Promise<void> {
  const blob = await generateScanReportPdfBlob(data)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `OvaCare_Scan_Report_${Date.now()}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

export async function scanReportPdfToBase64(data: ScanReportData): Promise<string> {
  const blob = await generateScanReportPdfBlob(data)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] || '')
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
