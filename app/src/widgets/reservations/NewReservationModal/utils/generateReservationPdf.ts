import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ReservationDraft } from '../../../../features/reservations/draftSlice'

function formatDate(value: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })
}

function formatDateTime(d: Date) {
  return d.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(/\//g, '-').replace(',', '')
}

export function generateOptionalReservationPdf(draft: ReservationDraft, download: boolean = true) {
  const now = new Date()
  const timestampLabel = formatDateTime(now)
  const filename = `optional reservation ${timestampLabel}.pdf`

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const margin = 18

  // ── Header bar ──────────────────────────────────────────────────────────
  doc.setFillColor(11, 78, 162)
  doc.rect(0, 0, pageW, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text('OPTIONAL RESERVATION', margin, 17)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${timestampLabel}`, pageW - margin, 17, { align: 'right' })

  // ── Status chip ─────────────────────────────────────────────────────────
  doc.setFillColor(251, 191, 36) // amber
  doc.roundedRect(margin, 34, 52, 9, 3, 3, 'F')
  doc.setTextColor(120, 53, 15)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('STATUS: PENDING', margin + 26, 40, { align: 'center' })

  // ── Section helper ───────────────────────────────────────────────────────
  let y = 52

  function sectionTitle(title: string) {
    doc.setFillColor(241, 245, 249)
    doc.rect(margin, y, pageW - margin * 2, 8, 'F')
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin + 3, y + 5.5)
    y += 12
  }

  // ── Guest Information ────────────────────────────────────────────────────
  sectionTitle('GUEST INFORMATION')
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 } },
    columnStyles: {
      0: { textColor: [100, 116, 139], fontStyle: 'normal', cellWidth: 50 },
      1: { textColor: [15, 23, 42], fontStyle: 'bold' },
    },
    body: [
      ['Full Name', `${draft.firstName} ${draft.surName}`.trim() || '—'],
      ['Email', draft.email || '—'],
      ['Phone', draft.phone || '—'],
      ['National ID', draft.idNumber || '—'],
      ['Address', draft.addressLine || '—'],
      ['Nationality', draft.nationality || '—'],
      ['Booking Source', draft.bookingSource || '—'],
    ],
  })
  y = (doc as any).lastAutoTable.finalY + 8

  // ── Stay Details ─────────────────────────────────────────────────────────
  sectionTitle('STAY DETAILS')
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 } },
    columnStyles: {
      0: { textColor: [100, 116, 139], cellWidth: 50 },
      1: { textColor: [15, 23, 42], fontStyle: 'bold' },
    },
    body: [
      ['Check-in Date', formatDate(draft.checkInDate)],
      ['Check-out Date', formatDate(draft.checkOutDate)],
      ['Number of Nights', draft.nights ? `${draft.nights} night(s)` : '—'],
      ['Adults', String(draft.adultCount)],
      ['Children', String(draft.childCount)],
      ['Expiration Date', formatDate(draft.expiresAt)],
    ],
  })
  y = (doc as any).lastAutoTable.finalY + 8

  // ── Room Information ──────────────────────────────────────────────────────
  sectionTitle('ROOM INFORMATION')
  const roomRows = draft.rooms
    .filter((r) => r.roomType || r.roomTypeId)
    .map((r, i) => [
      `Room ${i + 1}`,
      r.roomType || r.roomTypeId || '—',
      String(r.roomCount),
      r.roomView || '—',
      draft.rateCode || '—',
    ])

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: { fillColor: [11, 78, 162], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 } },
    head: [['#', 'Room Type', 'Qty', 'View', 'Rate Code']],
    body: roomRows.length > 0 ? roomRows : [['—', '—', '—', '—', '—']],
  })
  y = (doc as any).lastAutoTable.finalY + 8

  // ── Meal Plans ────────────────────────────────────────────────────────────
  if (draft.mealPlans && draft.mealPlans.length > 0) {
    sectionTitle('MEAL PLANS')
    const mpRows = draft.mealPlans.map((mp) => [
      mp.mealPlanId || '—',
      formatDate(mp.serviceDateStart),
      formatDate(mp.serviceDateEnd),
      mp.price ? `${mp.price}` : '—',
    ])
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'striped',
      headStyles: { fillColor: [11, 78, 162], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 } },
      head: [['Meal Plan ID', 'Start Date', 'End Date', 'Price']],
      body: mpRows,
    })
    y = (doc as any).lastAutoTable.finalY + 8
  }

  // ── Additional Services ────────────────────────────────────────────────────
  if (draft.extras && draft.extras.length > 0) {
    sectionTitle('ADDITIONAL SERVICES')
    const extraRows = draft.extras.map((e) => [
      e.item || e.customName || '—',
      String(e.qty),
      e.price ? `${e.price}` : '—',
      e.serviceDate ? formatDate(e.serviceDate) : '—',
    ])
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'striped',
      headStyles: { fillColor: [11, 78, 162], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 } },
      head: [['Service', 'Qty', 'Price', 'Date']],
      body: extraRows,
    })
    y = (doc as any).lastAutoTable.finalY + 8
  }

  // ── Companions ─────────────────────────────────────────────────────────────
  const companions = (draft.companions || []).filter((c) => c.firstName)
  if (companions.length > 0) {
    sectionTitle('COMPANIONS')
    const compRows = companions.map((c) => [
      `${c.firstName} ${c.lastName}`.trim(),
      c.phoneNumber || '—',
      c.email || '—',
      c.nationalId || '—',
    ])
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'striped',
      headStyles: { fillColor: [11, 78, 162], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 } },
      head: [['Name', 'Phone', 'Email', 'National ID']],
      body: compRows,
    })
    y = (doc as any).lastAutoTable.finalY + 8
  }

  // ── Special Requests ───────────────────────────────────────────────────────
  if (draft.specialRequests) {
    sectionTitle('SPECIAL REQUESTS')
    doc.setFontSize(9)
    doc.setTextColor(30, 41, 59)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(draft.specialRequests, pageW - margin * 2 - 6)
    doc.text(lines, margin + 3, y)
    y += lines.length * 5 + 8
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} of ${pageCount}  •  Optional Reservation  •  ${timestampLabel}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  if (download) {
    doc.save(filename)
  }
  return filename
}
