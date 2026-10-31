import { GALLERY } from '../data/menu'

const PDF_PATH = '/menu/menu.pdf' // ملفك الرسمي إذا وضعته هون، يُفضَّل عليه
const FILE_NAME = 'BENOVA-Menu.pdf'
const LOGO_PNG = '/brand/benova-logo.png'

function triggerDownload(url, name) {
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/**
 * ينزّل منيو BENOVA PDF:
 * 1) إذا وُجد "/menu/menu.pdf" في المجلد public يُنزَّل هو (الملف الرسمي).
 * 2) وإلا يولّد PDF من صور الأقسام محلياً (شتغّل بدون إنترنت).
 */
export async function downloadMenuPdf() {
  // نتأكد أن الملف موجود فعلاً ومو HTML (خادم الـ dev بيرجّع 200 مع index.html لأي مسار)
  try {
    const res = await fetch(PDF_PATH, { headers: { Range: 'bytes=0-3' }, cache: 'no-store' })
    if (res.ok) {
      const buf = await res.arrayBuffer()
      const sig = new TextDecoder().decode(buf).trim()
      if (sig.startsWith('%PDF')) {
        triggerDownload(PDF_PATH, FILE_NAME)
        return
      }
    }
  } catch {
    /* الملف غير موجود → توليد محلي */
  }

  try {
    const blob = await generatePdfBlob()
    const url = URL.createObjectURL(blob)
    triggerDownload(url, FILE_NAME)
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
  } catch (err) {
    console.error('PDF generation failed', err)
  }
}

function centerText(page, text, y, size, font, color) {
  const width = page.getWidth()
  const textWidth = font.widthOfTextAtSize(text, size)
  page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color })
}

async function generatePdfBlob() {
  // تحميل ديناميكي → يبقى المنيو الأساسي خفيف، و pdf-lib ينزل فقط عند توليد الـ PDF
  const { PDFDocument, PageSizes, StandardFonts, rgb } = await import('pdf-lib')

  const OLIVE = rgb(0.24, 0.3, 0.18)
  const GOLD = rgb(0.69, 0.54, 0.27)
  const CREAM = rgb(0.97, 0.93, 0.86)
  const INK = rgb(0.1, 0.14, 0.09)

  const doc = await PDFDocument.create()
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const regular = await doc.embedFont(StandardFonts.Helvetica)

  const [pw, ph] = PageSizes.A4 // portrait 595 x 842
  const landscape = [ph, pw] // A4 landscape

  // ---------- cover page ----------
  const cover = await doc.addPage(landscape)
  const cw = cover.getWidth()
  const ch = cover.getHeight()
  cover.drawRectangle({ x: 0, y: 0, width: cw, height: ch, color: OLIVE })
  cover.drawRectangle({ x: 0, y: ch - 16, width: cw, height: 16, color: GOLD })
  cover.drawRectangle({ x: 0, y: 0, width: cw, height: 16, color: GOLD })

  let logo = null
  try {
    const png = await fetch(LOGO_PNG).then((r) => r.arrayBuffer())
    logo = await doc.embedPng(png)
  } catch {
    logo = null
  }

  if (logo) {
    const dw = 330
    const dh = (logo.height / logo.width) * dw
    cover.drawImage(logo, { x: (cw - dw) / 2, y: ch - dh - 160, width: dw, height: dh })
  }

  centerText(cover, 'BENOVA', ch - 210, 42, bold, CREAM)
  centerText(cover, 'C R E P E S   &   J U I C E S', ch - 252, 16, regular, GOLD)
  centerText(cover, 'C O M P L E T E   M E N U', ch - 300, 13, regular, CREAM)

  // ---------- section pages ----------
  for (let i = 0; i < GALLERY.length; i += 1) {
    const page = await doc.addPage(landscape)
    const w = page.getWidth()
    const h = page.getHeight()

    page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: INK })
    page.drawRectangle({
      x: 18,
      y: 18,
      width: w - 36,
      height: h - 36,
      color: CREAM,
      borderColor: GOLD,
      borderWidth: 3,
    })

    try {
      const imgBytes = await fetch(GALLERY[i].src).then((r) => r.arrayBuffer())
      const img = await doc.embedJpg(imgBytes)
      const margin = 46
      const maxW = w - margin * 2
      const maxH = h - margin * 2
      const scale = Math.min(maxW / img.width, maxH / img.height)
      const dw = img.width * scale
      const dh = img.height * scale
      page.drawImage(img, { x: (w - dw) / 2, y: (h - dh) / 2 + 14, width: dw, height: dh })
    } catch {
      centerText(page, GALLERY[i].en, h / 2, 24, bold, INK)
    }

    page.drawText(`BENOVA · ${GALLERY[i].en} · ${i + 1}/${GALLERY.length}`, {
      x: 30,
      y: 28,
      size: 10,
      font: regular,
      color: OLIVE,
    })
  }

  const bytes = await doc.save()
  return new Blob([bytes], { type: 'application/pdf' })
}