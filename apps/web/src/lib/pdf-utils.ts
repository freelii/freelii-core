import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface PDFOptions {
    filename?: string
    quality?: number
    scale?: number
}

export async function generateInvoicePDF(
    element: HTMLElement,
    options: PDFOptions = {}
): Promise<void> {
    const {
        filename = 'invoice.pdf',
        quality = 1,
        scale = 2
    } = options

    try {
        // Temporarily reset any transforms for accurate capture
        const originalTransform = element.style.transform
        const originalTransformOrigin = element.style.transformOrigin
        element.style.transform = 'none'
        element.style.transformOrigin = 'initial'

        // Wait a bit for any layout changes to settle
        await new Promise(resolve => setTimeout(resolve, 100))

        // Create canvas from the element
        const canvas = await html2canvas(element, {
            scale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: element.scrollWidth,
            height: element.scrollHeight,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
            // Ignore elements that might cause issues
            ignoreElements: (element) => {
                return element.classList.contains('no-pdf') ||
                    element.tagName === 'SCRIPT' ||
                    element.tagName === 'STYLE'
            }
        })

        // Restore original transform
        element.style.transform = originalTransform
        element.style.transformOrigin = originalTransformOrigin

        // Calculate dimensions for A4 page (210 x 297 mm)
        const imgWidth = 210 // A4 width in mm
        const pageHeight = 297 // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight

        // Create PDF with high quality
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        })

        let position = 0

        // Add first page
        pdf.addImage(
            canvas.toDataURL('image/png', quality),
            'PNG',
            0,
            position,
            imgWidth,
            imgHeight,
            undefined,
            'FAST'
        )
        heightLeft -= pageHeight

        // Add additional pages if content is longer than one page
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            pdf.addImage(
                canvas.toDataURL('image/png', quality),
                'PNG',
                0,
                position,
                imgWidth,
                imgHeight,
                undefined,
                'FAST'
            )
            heightLeft -= pageHeight
        }

        // Save the PDF
        pdf.save(filename)
    } catch (error) {
        console.error('Error generating PDF:', error)
        throw new Error('Failed to generate PDF')
    }
}

export function generateInvoiceFilename(invoiceNumber: string): string {
    const sanitizedNumber = invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '_')
    const timestamp = new Date().toISOString().split('T')[0]
    return `invoice_${sanitizedNumber}_${timestamp}.pdf`
} 