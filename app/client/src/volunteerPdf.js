// Fetches the server-rendered profile PDF (functions/api/volunteers/[id]/pdf.js) and saves it.
export async function downloadVolunteerPdf(volunteer) {
  const res = await fetch(`/api/volunteers/${volunteer.id}/pdf`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'تعذر تحميل ملف المتطوع، حاول مرة أخرى');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ملف المتطوع - ${volunteer.name}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
