import { jsPDF } from 'jspdf'
import * as docx from 'docx'
import toast from 'react-hot-toast'

export const exportToTxt = (content) => {
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, `DocuMind_Export_${getTimestamp()}.txt`)
    toast.success('Text file exported successfully')
  } catch (err) {
    toast.error('Failed to export TXT')
    console.error(err)
  }
}

export const exportToPdf = (content) => {
  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const maxLineWidth = pageWidth - margin * 2

    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)

    // Automatically word wrap text
    const textLines = doc.splitTextToSize(content, maxLineWidth)
    
    let y = margin
    for (let i = 0; i < textLines.length; i++) {
        if (y > pageHeight - margin) {
            doc.addPage()
            y = margin
        }
        doc.text(textLines[i], margin, y)
        y += 7 // line height
    }

    const filename = `DocuMind_Export_${getTimestamp()}.pdf`
    
    // Open in new tab
    const pdfBlobUrl = doc.output('bloburl')
    window.open(pdfBlobUrl, '_blank')
    
    // Still trigger the download just in case
    doc.save(filename)
    
    toast.success('PDF exported and opened successfully')
  } catch (err) {
    toast.error('Failed to export PDF')
    console.error(err)
  }
}

export const exportToDocx = async (content) => {
  try {
    const lines = content.split('\n')
    const paragraphs = lines.map(line => {
      // Very basic formatting
      return new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: line,
            size: 24, // 12pt
          })
        ],
        spacing: { after: 200 }
      })
    })

    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    })

    const blob = await docx.Packer.toBlob(doc)
    downloadBlob(blob, `DocuMind_Export_${getTimestamp()}.docx`)
    toast.success('Word document exported successfully')
  } catch (err) {
    toast.error('Failed to export DOCX')
    console.error(err)
  }
}

export const exportToCsv = (content) => {
  try {
    // Basic Markdown Table Parser
    const lines = content.split('\n')
    let csvRows = []
    let inTable = false

    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true
        // Skip markdown table separator block like |---|---|
        if (!trimmed.match(/^\|[\s\-\|]+\|$/)) {
            // Split by | and trim elements
            const cells = trimmed.split('|')
                .slice(1, -1) // remove empty first and last resulting strings
                .map(cell => cell.trim().replace(/"/g, '""')) // escape quotes
            
            // Rejoin as normal CSV
            csvRows.push(cells.map(c => `"${c}"`).join(','))
        }
      } else {
        if (inTable && trimmed === '') {
          // Table ended
          inTable = false
        }
      }
    })

    if (csvRows.length === 0) {
      toast.error('No table found in the AI response')
      return
    }

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    downloadBlob(blob, `DocuMind_Table_${getTimestamp()}.csv`)
    toast.success('CSV exported successfully')

  } catch (err) {
    toast.error('Failed to export CSV')
    console.error(err)
  }
}

// Helpers
const getTimestamp = () => {
    const d = new Date()
    return `${d.getFullYear()}${(d.getMonth()+1).toString().padStart(2,'0')}${d.getDate().toString().padStart(2,'0')}_${d.getHours().toString().padStart(2,'0')}${d.getMinutes().toString().padStart(2,'0')}`
}

const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}
