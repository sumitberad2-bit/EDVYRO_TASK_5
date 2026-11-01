const grid = document.querySelector('#job-grid');
const searchInput = document.querySelector('#search');
const categoryInput = document.querySelector('#category');
const modeInput = document.querySelector('#mode');
const dialog = document.querySelector('#application-dialog');
const form = document.querySelector('#application-form');
const statusBox = document.querySelector('#form-status');
const toast = document.querySelector('#toast');
let internships = [];
let toastTimer;
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function notify(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3200); }
function renderJobs(rows) {
  document.querySelector('#result-count').textContent = `${rows.length} ${rows.length === 1 ? 'opportunity' : 'opportunities'} found`;
  document.querySelector('#empty-state').hidden = rows.length !== 0;
  if (!rows.length) { grid.innerHTML = ''; return; }
  grid.innerHTML = rows.map(job => `<article class="job-card"><div class="job-top"><span class="company-mark" aria-hidden="true">${escapeHtml(job.company.slice(0,1).toUpperCase())}</span><span class="job-mode">${escapeHtml(job.mode)}</span></div><h3>${escapeHtml(job.title)}</h3><div class="company-name">${escapeHtml(job.company)}</div><div class="job-meta"><span>⌖ ${escapeHtml(job.location)}</span><span>◷ ${escapeHtml(job.duration)}</span></div><p class="job-description">${escapeHtml(job.description)}</p><div class="skill-list">${job.skills.slice(0,3).map(skill => `<span>${escapeHtml(skill)}</span>`).join('')}</div><div class="job-footer"><span class="stipend">${escapeHtml(job.stipend)}</span><button class="apply-link" data-apply="${job.id}">View & apply&nbsp; →</button></div></article>`).join('');
}
async function loadJobs() {
  grid.innerHTML = '<div class="loading-card">Finding opportunities for you…</div>';
  const params = new URLSearchParams({ search: searchInput.value.trim(), category: categoryInput.value, mode: modeInput.value });
  try { const response = await fetch(`/api/internships?${params}`); if (!response.ok) throw new Error('Could not load opportunities.'); const data = await response.json(); internships = data.internships; renderJobs(internships); }
  catch { grid.innerHTML = '<div class="loading-card">We could not load opportunities. Please refresh and try again.</div>'; document.querySelector('#result-count').textContent = 'Temporarily unavailable'; }
}
let debounce;
searchInput.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(loadJobs, 250); });
categoryInput.addEventListener('change', loadJobs); modeInput.addEventListener('change', loadJobs);
document.querySelector('#clear-filters').addEventListener('click', () => { searchInput.value = ''; categoryInput.value = 'All'; modeInput.value = 'All'; loadJobs(); });
grid.addEventListener('click', event => { const button = event.target.closest('[data-apply]'); if (!button) return; const job = internships.find(item => item.id === Number(button.dataset.apply)); if (!job) return; form.reset(); clearErrors(); statusBox.textContent = ''; statusBox.className = 'form-status'; document.querySelector('#internship-id').value = job.id; document.querySelector('#selected-role').textContent = `${job.title} · ${job.company}`; dialog.showModal(); });
function clearErrors() { document.querySelectorAll('.field-error').forEach(item => item.textContent = ''); }
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
form.addEventListener('submit', async event => {
  event.preventDefault(); clearErrors(); statusBox.textContent = ''; statusBox.className = 'form-status';
  if (!form.reportValidity()) return;
  const payload = Object.fromEntries(new FormData(form).entries()); payload.internshipId = Number(payload.internshipId);
  const submit = form.querySelector('[type="submit"]'); submit.disabled = true; submit.textContent = 'Submitting…';
  try {
    const response = await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) { if (data.fields) Object.entries(data.fields).forEach(([key, message]) => { const field = form.querySelector(`[data-error="${key}"]`); if (field) field.textContent = message; }); throw new Error(data.error || 'Please check your details.'); }
    statusBox.textContent = `Success! Your application reference is #${data.applicationId}.`; statusBox.className = 'form-status success'; form.reset(); notify('Application submitted successfully.'); setTimeout(() => dialog.close(), 1700);
  } catch (error) { statusBox.textContent = error.message; }
  finally { submit.disabled = false; submit.innerHTML = 'Send application <span aria-hidden="true">→</span>'; }
});
document.querySelector('#year').textContent = new Date().getFullYear();
loadJobs();
