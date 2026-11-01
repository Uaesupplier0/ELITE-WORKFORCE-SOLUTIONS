const SUPABASE_URL = 'https://maakqzczkhkoimlmnvws.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kiZxMM-2_11uQA_GQctlxw_DoEo_pu1';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function openPolicyModal(type) {
  document.getElementById('policyModal').style.display = 'flex';
  document.getElementById('policyPrivacyContent').style.display = type === 'privacy' ? 'block' : 'none';
  document.getElementById('policyTermsContent').style.display = type === 'terms' ? 'block' : 'none';
  document.getElementById('policyDeletionContent').style.display = type === 'deletion' ? 'block' : 'none';
}
function closePolicyModal() { document.getElementById('policyModal').style.display = 'none'; }

_supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') { checkActiveUserSession(); }
  else if (event === 'SIGNED_OUT') { updateNavProfileState(); }
});

let currentTab = 'companies';
let currentPublicTab = 'companies';
let rawPublicData = []; 
let currentPairExchangeRate = 26.05;

async function checkUserAuthBeforeAction(callbackAction) {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session && session.user) {
        if (typeof callbackAction === 'function') callbackAction();
    } else {
        document.getElementById('customAlertPopup').style.display = 'flex';
    }
}

function closeCustomAlert() { document.getElementById('customAlertPopup').style.display = 'none'; }
function redirectToLoginModal() {
    document.getElementById('customAlertPopup').style.display = 'none';
    openAdvanceAuthModal('login');
}

function openAdvanceAuthModal(tab = 'login') {
  document.getElementById('advanceAuthModal').style.display = 'flex';
  switchAuthTab(tab);
}
function closeAdvanceAuthModal() { document.getElementById('advanceAuthModal').style.display = 'none'; }

function switchAuthTab(tab) {
  const loginBtn = document.getElementById('tabBtnLogin');
  const regBtn = document.getElementById('tabBtnRegister');
  const loginPanel = document.getElementById('loginFormPanel');
  const regPanel = document.getElementById('registerFormPanel');

  if (tab === 'login') {
    loginBtn.classList.add('active'); regBtn.classList.remove('active');
    loginPanel.style.display = 'block'; regPanel.style.display = 'none';
  } else {
    regBtn.classList.add('active'); loginBtn.classList.remove('active');
    regPanel.style.display = 'block'; loginPanel.style.display = 'none';
  }
}

async function loginWithGoogle() {
  await _supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + window.location.pathname } });
}

async function loginWithFacebook() {
  await _supabase.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: window.location.origin + window.location.pathname } });
}

async function saveGoogleUserRole(e) {
  e.preventDefault();
  const btn = document.getElementById('saveRoleBtn');
  btn.disabled = true; btn.innerText = 'Saving Role...';
  const selectedRole = document.getElementById('googleUserRoleSelect').value;
  try {
    const { error } = await _supabase.auth.updateUser({ data: { role: selectedRole } });
    if (error) throw error;
    showToast('Account Role set to ' + selectedRole.toUpperCase());
    document.getElementById('googleRoleModal').style.display = 'none';
    checkActiveUserSession();
  } catch (err) {
    showToast('Error updating role: ' + err.message, 'error');
  } finally {
    btn.disabled = false; btn.innerText = 'Save Role & Continue';
  }
}

async function handleUserRegistration(e) {
  e.preventDefault();
  const btn = document.getElementById('regSubmitBtn');
  btn.disabled = true; btn.innerText = 'Creating Account...';
  const role = document.getElementById('regRole').value;
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  try {
    const { error } = await _supabase.auth.signUp({ email, password, options: { data: { full_name: name, role: role } } });
    if (error) throw error;
    showToast('Account Created Successfully! You can now log in.');
    switchAuthTab('login');
    document.getElementById('registerFormPanel').reset();
  } catch (err) {
    showToast('Registration Error: ' + err.message, 'error');
  } finally {
    btn.disabled = false; btn.innerText = 'Create Free Account';
  }
}

async function handleUserLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginSubmitBtn');
  btn.disabled = true; btn.innerText = 'Logging in...';
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showToast('Logged in successfully!');
    closeAdvanceAuthModal();
    checkActiveUserSession();
  } catch (err) {
    showToast('Login Error: ' + err.message, 'error');
  } finally {
    btn.disabled = false; btn.innerText = 'Login to Account';
  }
}

async function checkActiveUserSession() {
  const { data: { session } } = await _supabase.auth.getSession();
  const navName = document.getElementById('navProfileName');
  const navAvatar = document.getElementById('navProfileAvatar');
  const dropName = document.getElementById('dropUserName');
  const dropUserRole = document.getElementById('dropUserRole');
  const menuLogin = document.getElementById('menuLoginOption');
  const menuLogout = document.getElementById('menuLogoutOption');
  const adminNavLink = document.getElementById('adminNavLink');

  if (session && session.user) {
    const user = session.user;
    const userName = user.user_metadata.full_name || user.user_metadata.name || user.email.split('@')[0];
    const userRole = user.user_metadata.role;
    const socialAvatar = user.user_metadata.avatar_url || user.user_metadata.picture;

    if (!userRole) document.getElementById('googleRoleModal').style.display = 'flex';

    if (adminNavLink) {
      if (userRole === 'admin' || user.email === 'mohdmanjur022@gmail.com') adminNavLink.style.display = 'block';
      else adminNavLink.style.display = 'none';
    }

    const crmButton = document.getElementById('privateCrmBtn');
    if (crmButton) {
      if (['mohdmanjur022@gmail.com', 'mohdmanjur021@gmail.com'].includes(user.email)) crmButton.style.display = 'flex';
      else crmButton.style.display = 'none';
    }

    if (navName) navName.innerText = userName;
    if (dropName) dropName.innerText = userName;
    if (dropUserRole) dropUserRole.innerText = (userRole || 'Role Pending').toUpperCase();

    if (navAvatar) {
      if (socialAvatar) navAvatar.innerHTML = `<img src="${socialAvatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
      else navAvatar.innerText = userName.charAt(0).toUpperCase();
    }
    if (menuLogin) menuLogin.style.display = 'none';
    if (menuLogout) menuLogout.style.display = 'block';
  } else {
    if (adminNavLink) adminNavLink.style.display = 'none';
    updateNavProfileState();
  }
}

async function logoutUserSession() {
  await _supabase.auth.signOut();
  localStorage.removeItem('selected_profile_data');
  localStorage.removeItem('selected_profile_type');
  showToast('Account Logged Out.');
  checkActiveUserSession();
  closeProfileDropdown();
}

function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return resolve(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width, height = img.height;
        if (width > height) { if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } }
        else { if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; } }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => {
          resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

async function exportAllDatabaseToExcel() {
  showToast("Fetching all database records for export...");
  try {
    const { data: comps } = await _supabase.from('companies').select('*');
    const { data: supps } = await _supabase.from('suppliers').select('*');
    const { data: workers } = await _supabase.from('azad_workers').select('*');
    const { data: msgs } = await _supabase.from('contact_messages').select('*');

    const wb = XLSX.utils.book_new();
    if (comps?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(comps), "Companies");
    if (supps?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(supps), "Suppliers");
    if (workers?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(workers), "Azad Workers");
    if (msgs?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(msgs), "Contact Messages");

    XLSX.writeFile(wb, `Elite_Workforce_Complete_Database_${new Date().toISOString().slice(0,10)}.xlsx`);
    showToast("Complete database exported successfully!");
  } catch (err) {
    showToast("Export error: " + err.message, "error");
  }
}

const translations = {
  en: { nav_home: "Home", nav_about: "About Us", nav_board: "Public Board", nav_post: "Post Requirement", nav_careers: "Careers", nav_faq: "FAQ", nav_contact: "Contact", nav_staffing: "Get Staffing" },
  hi: { nav_home: "होम", nav_about: "हमारे बारे में", nav_board: "पब्लिक बोर्ड", nav_post: "आवश्यकता पोस्ट करें", nav_careers: "करियर", nav_faq: "प्रश्न", nav_contact: "संपर्क करें", nav_staffing: "स्टाफ पाएं" }
};

function changeLanguage(lang) {
  const t = translations[lang] || translations.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.innerHTML = t[key];
  });
  document.body.style.direction = (lang === 'ar' || lang === 'ur') ? 'rtl' : 'ltr';
}

function toggleFaq(item) { item.classList.toggle('active'); }
function openCurrencyModal() { document.getElementById('currencyModal').style.display = 'flex'; fetchDynamicPairRate(); }
function closeCurrencyModal() { document.getElementById('currencyModal').style.display = 'none'; }

function swapCurrencies() {
  const fromSelect = document.getElementById('fromCurrency');
  const toSelect = document.getElementById('toCurrency');
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  onCurrencyPairChange();
}

async function fetchDynamicPairRate() {
  const fromCode = document.getElementById('fromCurrency').value;
  const toCode = document.getElementById('toCurrency').value;
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${fromCode}`);
    const data = await res.json();
    if (data?.rates?.[toCode]) {
      currentPairExchangeRate = data.rates[toCode];
      document.getElementById('modalRateInfo').innerText = `Live Rate: 1 ${fromCode} = ${currentPairExchangeRate.toFixed(2)} ${toCode}`;
      document.getElementById('heroAedRate').innerText = `1 ${fromCode} = ₹${currentPairExchangeRate.toFixed(2)} ${toCode}`;
      convertFromTo();
    }
  } catch(e) { console.log(e); }
}

function onCurrencyPairChange() { fetchDynamicPairRate(); }
function convertFromTo() {
  const fromVal = parseFloat(document.getElementById('inputFromAmount').value) || 0;
  document.getElementById('inputToAmount').value = (fromVal * currentPairExchangeRate).toFixed(2);
}
function convertToFrom() {
  const toVal = parseFloat(document.getElementById('inputToAmount').value) || 0;
  document.getElementById('inputFromAmount').value = (toVal / currentPairExchangeRate).toFixed(2);
}

function toggleDarkMode() {
  const htmlEl = document.documentElement;
  const iconEl = document.getElementById('themeIcon');
  if (htmlEl.classList.contains('dark')) {
    htmlEl.classList.remove('dark');
    localStorage.setItem('ews_theme', 'light');
    iconEl.className = 'fa-solid fa-moon';
  } else {
    htmlEl.classList.add('dark');
    localStorage.setItem('ews_theme', 'dark');
    iconEl.className = 'fa-solid fa-sun';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('ews_theme') === 'dark') {
    document.documentElement.classList.add('dark');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = 'fa-solid fa-sun';
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('revealed'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal-on-scroll').forEach(section => observer.observe(section));

  loadPublicLeaderboard();
  fetchDynamicPairRate();
  checkActiveUserSession();
  loadDynamicJobVacancies();
});

function toggleMenu() { document.getElementById('navLinks').classList.toggle('active'); }
function closeMenu() { document.getElementById('navLinks').classList.remove('active'); }

function toggleProfileDropdown() {
  const drop = document.getElementById('navProfileDropdown');
  if (drop) drop.style.display = drop.style.display === 'block' ? 'none' : 'block';
}
function closeProfileDropdown() {
  const drop = document.getElementById('navProfileDropdown');
  if (drop) drop.style.display = 'none';
}

document.addEventListener('click', (e) => {
  const btn = document.getElementById('navProfileBtn');
  const drop = document.getElementById('navProfileDropdown');
  if (btn && drop && !btn.contains(e.target) && !drop.contains(e.target)) drop.style.display = 'none';
});

function updateNavProfileState() {
  const profileDataRaw = localStorage.getItem('selected_profile_data');
  const navName = document.getElementById('navProfileName');
  const navAvatar = document.getElementById('navProfileAvatar');
  const dropName = document.getElementById('dropUserName');
  const dropRole = document.getElementById('dropUserRole');
  const menuLogout = document.getElementById('menuLogoutOption');
  const menuLogin = document.getElementById('menuLoginOption');

  if (profileDataRaw) {
    const data = JSON.parse(profileDataRaw);
    const userName = data.full_name || data.company_name || 'User Profile';
    const photoUrl = data.file_uri || data.logo_url;
    if (navName) navName.innerText = userName;
    if (dropName) dropName.innerText = userName;
    if (dropRole) dropRole.innerText = (data.trade || data.manpower_types || 'Verified Member').toUpperCase();
    if (navAvatar) {
      if (photoUrl) navAvatar.innerHTML = `<img src="${photoUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
      else navAvatar.innerText = userName.charAt(0).toUpperCase();
    }
    if (menuLogout) menuLogout.style.display = 'block';
    if (menuLogin) menuLogin.style.display = 'none';
  } else {
    if (navName) navName.innerText = 'Login';
    if (dropName) dropName.innerText = 'Guest User';
    if (dropRole) dropRole.innerText = 'Not registered';
    if (navAvatar) navAvatar.innerHTML = '<i class="fa-solid fa-user"></i>';
    if (menuLogout) menuLogout.style.display = 'none';
    if (menuLogin) menuLogin.style.display = 'block';
  }
}

function goToMyProfile() {
  closeProfileDropdown();
  if (localStorage.getItem('selected_profile_data')) window.location.href = 'worker-profile.html';
  else openAdvanceAuthModal('login');
}

function openTimesheetModal() { checkUserAuthBeforeAction(() => { document.getElementById('timesheetModal').style.display = 'flex'; }); }
function closeTimesheetModal() { document.getElementById('timesheetModal').style.display = 'none'; }
function openSupplierModal() { document.getElementById('supplierModal').style.display = 'flex'; }
function closeSupplierModal() { document.getElementById('supplierModal').style.display = 'none'; }
function openAzadModal() { document.getElementById('azadModal').style.display = 'flex'; }
function closeAzadModal() { document.getElementById('azadModal').style.display = 'none'; }

function showSuccessPopup(msg = "Aapki information successfully database mein save ho gayi hai!") {
    document.getElementById('popupMessage').innerText = msg;
    document.getElementById('successPopup').style.display = 'flex';
}
function closeSuccessPopup() { document.getElementById('successPopup').style.display = 'none'; }

function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}" style="color:${type === 'success' ? '#10b981' : '#ef4444'}"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

async function unlockAdminPanel() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (session) {
    document.getElementById('admin').style.display = 'block';
    window.location.hash = "#admin";
    loadActiveTabData();
    return;
  }
  const email = prompt("Enter Admin Email:");
  const password = prompt("Enter Admin Password:");
  if (!email || !password) return;
  const { error } = await _supabase.auth.signInWithPassword({ email, password });
  if (error) showToast("Login Failed: " + error.message, "error");
  else {
    showToast("Admin authenticated successfully!");
    document.getElementById('admin').style.display = 'block';
    window.location.hash = "#admin";
    loadActiveTabData();
  }
}

async function logoutAdmin() {
  await _supabase.auth.signOut();
  document.getElementById('admin').style.display = 'none';
  showToast("Logged out successfully.");
}

function switchPublicTab(tab, btn) {
  currentPublicTab = tab;
  document.querySelectorAll('#leaderboard .admin-tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('publicSearchInput').value = ''; 
  loadPublicLeaderboard();
}

async function loadPublicLeaderboard() {
  const container = document.getElementById('public-table-container');
  container.innerHTML = '<p style="padding:20px;text-align:center;">Loading listings...</p>';
  const { data, error } = await _supabase.from(currentPublicTab).select('*').order('created_at', { ascending: false });
  if (error || !data || data.length === 0) {
    rawPublicData = [];
    container.innerHTML = '<p style="padding:20px;text-align:center;">No records found.</p>';
    return;
  }
  rawPublicData = data;
  renderPublicTable(rawPublicData);
}

function renderPublicTable(dataList) {
  const container = document.getElementById('public-table-container');
  if (!dataList || dataList.length === 0) {
    container.innerHTML = '<p style="padding:20px;text-align:center;">No matching records found.</p>';
    return;
  }

  let html = `<table class="admin-table"><thead><tr>`;
  if (currentPublicTab === 'companies') html += `<th>Company / Logo</th><th>Trade License</th><th>Location</th><th>Details</th><th>Contact</th>`;
  else if (currentPublicTab === 'suppliers') html += `<th>Supplier</th><th>Trade License</th><th>Email</th><th>Categories</th><th>Workers</th><th>Connect</th>`;
  else html += `<th>Date</th><th>Photo</th><th>Name</th><th>Email</th><th>Skill / Trade</th><th>Location</th><th>Connect</th>`;
  html += `</tr></thead><tbody id="publicTableBody">`;

  dataList.forEach((i, index) => {
    const cleanPhone = (i.phone || i.phone_number || '').replace(/[^0-9]/g, '');
    const logoImg = (i.logo_url || i.file_uri) ? `<img src="${i.logo_url || i.file_uri}" style="width:35px;height:35px;object-fit:cover;border-radius:6px;border:1px solid #ddd;">` : `<div style="width:35px;height:35px;background:#e2e8f0;display:flex;align-items:center;justify-content:center;border-radius:6px;font-weight:bold;">${(i.company_name || i.full_name || 'U').charAt(0)}</div>`;

    html += `<tr data-index="${index}">`;
    if (currentPublicTab === 'companies') {
      html += `<td><div style="display:flex;align-items:center;gap:10px;">${logoImg} <b>${i.company_name}</b></div></td><td>${i.trade_license || 'Verified'}</td><td>${i.location || 'UAE'}</td><td>${i.requirement_details}</td><td><a href="https://wa.me/${cleanPhone}" target="_blank" onclick="event.stopPropagation()" style="color:var(--emerald2);font-weight:bold;"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a></td>`;
    } else if (currentPublicTab === 'suppliers') {
      html += `<td><div style="display:flex;align-items:center;gap:10px;">${logoImg} <b>${i.company_name}</b></div></td><td>${i.trade_license || 'Verified'}</td><td>${i.email || 'N/A'}</td><td>${i.manpower_types || 'General'}</td><td><b>${i.workers_available || 'Multiple'}</b></td><td><a href="https://wa.me/${cleanPhone}" target="_blank" onclick="event.stopPropagation()" style="color:var(--emerald2);font-weight:bold;"><i class="fa-brands fa-whatsapp"></i> Contact</a></td>`;
    } else {
      html += `<td><span class="admin-badge">${new Date(i.created_at).toLocaleDateString()}</span></td><td>${logoImg}</td><td><b>${i.full_name}</b></td><td>${i.email || 'N/A'}</td><td><span style="color:var(--blue);font-weight:bold;">${i.trade}</span></td><td>${i.location}</td><td><a href="https://wa.me/${cleanPhone}" target="_blank" onclick="event.stopPropagation()" style="color:var(--emerald2);font-weight:bold;"><i class="fa-brands fa-whatsapp"></i> Hire</a></td>`;
    }
    html += `</tr>`;
  });
  container.innerHTML = html + '</tbody></table>';

  document.querySelectorAll('#publicTableBody tr').forEach(row => {
    row.addEventListener('click', () => {
      checkUserAuthBeforeAction(() => {
        const idx = row.getAttribute('data-index');
        localStorage.setItem('selected_profile_type', currentPublicTab);
        localStorage.setItem('selected_profile_data', JSON.stringify(dataList[idx]));
        window.location.href = `worker-profile.html?type=${currentPublicTab}`;
      });
    });
  });
}

function filterPublicTable() {
  const query = document.getElementById('publicSearchInput').value.toLowerCase().trim();
  if (!query) { renderPublicTable(rawPublicData); return; }
  const filtered = rawPublicData.filter(item => {
    return (item.company_name && item.company_name.toLowerCase().includes(query)) ||
           (item.full_name && item.full_name.toLowerCase().includes(query)) ||
           (item.trade && item.trade.toLowerCase().includes(query)) ||
           (item.location && item.location.toLowerCase().includes(query)) ||
           (item.requirement_details && item.requirement_details.toLowerCase().includes(query));
  });
  renderPublicTable(filtered);
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  const label = document.getElementById('file-name-label');
  if (file) {
    if (file.type !== "application/pdf") {
      label.innerText = "Error: Please upload a valid .PDF file!";
      label.style.color = "#ef4444";
      event.target.value = "";
      return;
    }
    label.innerText = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    label.style.color = "#10b981";
  }
}

function handleCareerFormSubmit(event) {
  event.preventDefault();
  checkUserAuthBeforeAction(() => {
    showSuccessPopup("Done ✅ - Aapka career application successfully submit ho gaya hai!");
    event.target.reset();
    document.getElementById('file-name-label').innerText = "Click or Drag & Drop PDF Resume Here";
  });
}

async function submitCompanyForm(e) {
  e.preventDefault();
  checkUserAuthBeforeAction(async () => {
    const btn = document.getElementById('comp_btn');
    btn.disabled = true; btn.innerText = 'Submitting...';
    try {
      const rawLogo = document.getElementById('comp_logo_file').files[0];
      let logoUrl = '';
      if (rawLogo) {
        const logoFile = await compressImage(rawLogo);
        const fileName = `comp_${Date.now()}_${logoFile.name}`;
        await _supabase.storage.from('photos').upload(fileName, logoFile);
        logoUrl = _supabase.storage.from('photos').getPublicUrl(fileName).data.publicUrl;
      }
      const payload = {
        company_name: document.getElementById('comp_name').value.trim(),
        trade_license: document.getElementById('comp_license').value.trim(),
        logo_url: logoUrl,
        contact_person: document.getElementById('comp_person').value.trim(),
        email: document.getElementById('comp_email').value.trim(),
        phone: document.getElementById('comp_phone').value.trim(),
        location: document.getElementById('comp_location').value.trim(),
        requirement_details: document.getElementById('comp_details').value.trim()
      };
      const { error } = await _supabase.from('companies').insert([payload]);
      if (error) throw error;
      showSuccessPopup('Done ✅ - Requirement saved successfully!');
      document.getElementById('companyForm').reset();
      loadPublicLeaderboard();
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
    finally { btn.disabled = false; btn.innerText = 'Submit Requirement'; }
  });
}

async function submitModalSupplier(e) {
  e.preventDefault();
  checkUserAuthBeforeAction(async () => {
    const btn = document.getElementById('m_supp_btn');
    btn.disabled = true; btn.innerText = 'Registering...';
    try {
      const rawLogo = document.getElementById('m_supp_photo').files[0];
      let logoUrl = '';
      if (rawLogo) {
        const logoFile = await compressImage(rawLogo);
        const fileName = `supp_${Date.now()}_${logoFile.name}`;
        await _supabase.storage.from('photos').upload(fileName, logoFile);
        logoUrl = _supabase.storage.from('photos').getPublicUrl(fileName).data.publicUrl;
      }
      const payload = {
        company_name: document.getElementById('m_supp_name').value.trim(),
        trade_license: document.getElementById('m_supp_license').value.trim(),
        email: document.getElementById('m_supp_email_field').value.trim(),
        logo_url: logoUrl,
        contact_person: document.getElementById('m_supp_person').value.trim(),
        phone: document.getElementById('m_supp_phone').value.trim(),
        manpower_types: document.getElementById('m_supp_types').value.trim(),
        workers_available: parseInt(document.getElementById('m_supp_workers').value || 0, 10)
      };
      const { error } = await _supabase.from('suppliers').insert([payload]);
      if (error) throw error;
      closeSupplierModal();
      showSuccessPopup('Done ✅ - Supplier registered successfully!');
      loadPublicLeaderboard();
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
    finally { btn.disabled = false; btn.innerText = 'Submit Supplier Details'; }
  });
}

async function submitModalAzadWorker(e) {
  e.preventDefault();
  checkUserAuthBeforeAction(async () => {
    const btn = document.getElementById('m_azad_btn');
    btn.disabled = true; btn.innerText = 'Registering...';
    try {
      const rawPhoto = document.getElementById('m_azad_photo').files[0];
      let photoUrl = '';
      if (rawPhoto) {
        const photoFile = await compressImage(rawPhoto);
        const fileName = `worker_${Date.now()}_${photoFile.name}`;
        await _supabase.storage.from('photos').upload(fileName, photoFile);
        photoUrl = _supabase.storage.from('photos').getPublicUrl(fileName).data.publicUrl;
      }
      const payload = {
        full_name: document.getElementById('m_azad_name').value.trim(),
        email: document.getElementById('m_azad_email').value.trim(),
        phone_number: document.getElementById('m_azad_phone').value.trim(),
        trade: document.getElementById('m_azad_trade').value,
        location: document.getElementById('m_azad_location').value,
        file_uri: photoUrl
      };
      const { error } = await _supabase.from('azad_workers').insert([payload]);
      if (error) throw error;
      localStorage.setItem('selected_profile_type', 'azad_workers');
      localStorage.setItem('selected_profile_data', JSON.stringify(payload));
      updateNavProfileState();
      closeAzadModal();
      showSuccessPopup('Done ✅ - Worker registered successfully!');
      loadPublicLeaderboard();
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
    finally { btn.disabled = false; btn.innerText = 'Submit Azad Worker Details'; }
  });
}

async function submitContactForm(e) {
  e.preventDefault();
  checkUserAuthBeforeAction(async () => {
    const btn = document.getElementById('cont_btn');
    btn.disabled = true; btn.innerText = 'Sending...';
    const payload = {
      name: document.getElementById('cont_name').value.trim(),
      email: document.getElementById('cont_email').value.trim(),
      message: document.getElementById('cont_msg').value.trim()
    };
    const { error } = await _supabase.from('contact_messages').insert([payload]);
    if (error) showToast('Error: ' + error.message, 'error');
    else {
      showSuccessPopup('Done ✅ - Message sent successfully!');
      document.getElementById('contactForm').reset();
    }
    btn.disabled = false; btn.innerText = 'Send Message';
  });
}

function switchTab(tableName, btn) {
  currentTab = tableName;
  document.querySelectorAll('.admin-section .admin-tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadActiveTabData();
}

async function loadActiveTabData() {
  const container = document.getElementById('admin-table-container');
  container.innerHTML = '<p style="padding:20px;text-align:center;">Loading records...</p>';
  const { data, error } = await _supabase.from(currentTab).select('*').order('created_at', { ascending: false });
  if (error || !data || data.length === 0) { container.innerHTML = '<p style="padding:20px;text-align:center;">No records found.</p>'; return; }

  let html = `<table class="admin-table"><thead><tr>`;
  if (currentTab === 'companies') html += `<th>Date</th><th>Logo</th><th>Company</th><th>Person</th><th>Contact</th><th>Details</th><th>Action</th>`;
  else if (currentTab === 'suppliers') html += `<th>Date</th><th>Logo</th><th>Supplier</th><th>Person</th><th>Contact</th><th>Workers</th><th>Action</th>`;
  else if (currentTab === 'azad_workers') html += `<th>Date</th><th>Photo</th><th>Name</th><th>Email</th><th>Trade</th><th>Location</th><th>Action</th>`;
  else html += `<th>Date</th><th>Name</th><th>Email</th><th>Message</th><th>Action</th>`;
  html += `</tr></thead><tbody>`;

  data.forEach(i => {
    const img = (i.logo_url || i.file_uri) ? `<img src="${i.logo_url || i.file_uri}" style="width:35px;height:35px;object-fit:cover;border-radius:4px;">` : 'N/A';
    html += `<tr><td><span class="admin-badge">${new Date(i.created_at).toLocaleDateString()}</span></td>`;
    if (currentTab === 'companies') html += `<td>${img}</td><td><b>${i.company_name}</b></td><td>${i.contact_person}</td><td>${i.email}<br>${i.phone}</td><td>${i.requirement_details}</td>`;
    else if (currentTab === 'suppliers') html += `<td>${img}</td><td><b>${i.company_name}</b></td><td>${i.contact_person}</td><td>${i.email}<br>${i.phone}</td><td><b>${i.workers_available}</b></td>`;
    else if (currentTab === 'azad_workers') html += `<td>${img}</td><td><b>${i.full_name}</b></td><td>${i.email}</td><td>${i.phone_number}</td><td>${i.trade}</td><td>${i.location}</td>`;
    else html += `<td><b>${i.name}</b></td><td>${i.email}</td><td>${i.message}</td>`;
    html += `<td><button class="admin-del-btn" onclick="deleteRecord('${currentTab}', ${i.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`;
  });
  container.innerHTML = html + '</tbody></table>';
}

async function deleteRecord(table, id) {
  if (confirm('Delete this entry permanently?')) {
    const { error } = await _supabase.from(table).delete().eq('id', id);
    if (error) showToast('Error: ' + error.message, 'error');
    else { showToast('Record deleted.'); loadActiveTabData(); loadPublicLeaderboard(); }
  }
}

async function triggerBulkEmail() {
  const targetType = prompt("Select recipient group:\n1: Azad Workers\n2: Suppliers\n3: Companies\n4: All Database\nEnter number (1-4):", "4");
  if (!targetType) return;
  let table = targetType === '1' ? 'azad_workers' : targetType === '2' ? 'suppliers' : targetType === '3' ? 'companies' : 'all';
  try {
    let emails = [];
    if (table === 'all') {
      const c = await _supabase.from('companies').select('email');
      const s = await _supabase.from('suppliers').select('email');
      const w = await _supabase.from('azad_workers').select('email');
      [c.data, s.data, w.data].forEach(arr => arr?.forEach(i => i.email && emails.push(i.email)));
    } else {
      const res = await _supabase.from(table).select('email');
      res.data?.forEach(i => i.email && emails.push(i.email));
    }
    const unique = [...new Set(emails)].filter(e => e.includes('@'));
    if (!unique.length) { showToast("No valid emails found!", "error"); return; }
    const subject = prompt("Enter Email Subject:", "Update from Elite Workforce");
    const body = prompt("Enter Email Message:", "Hello...");
    if (subject && body) window.location.href = `mailto:?bcc=${encodeURIComponent(unique.join(','))}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  } catch (err) { showToast("Error: " + err.message, "error"); }
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });
document.addEventListener('click', async (e) => {
    if (e.target && e.target.closest('#installBtn')) {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt = null;
        } else {
            alert('To install app:\n1. Tap browser menu (3 dots).\n2. Select "Add to Home screen".');
        }
    }
});

(function initTimesheet(){
  const KEY = 'elite_workforce_timesheet_v2';
  const ACTIVE_KEY = 'elite_workforce_timesheet_active_v2';
  let active = JSON.parse(localStorage.getItem(ACTIVE_KEY) || 'null');
  let history = JSON.parse(localStorage.getItem(KEY) || '[]');
  
  function save(){ localStorage.setItem(KEY, JSON.stringify(history)); localStorage.setItem(ACTIVE_KEY, JSON.stringify(active)); }
  function fmtDuration(ms){
    const total=Math.max(0,Math.floor(ms/1000));
    return `${String(Math.floor(total/3600)).padStart(2,'0')}:${String(Math.floor((total%3600)/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
  }
  function setStatus(msg){ const st=document.getElementById('tsStatus'); if(st) st.textContent=msg; updateBadge(); }
  function updateBadge(){
    const b = document.getElementById('dutyStatusBadge');
    if(b) { b.style.background = active ? '#10b981' : '#ef4444'; b.innerHTML = active ? '🟢 ON' : '🔴 OFF'; }
  }

  async function getLocation(){
    return new Promise((resolve,reject)=>{
      if(!navigator.geolocation) { reject(new Error('GPS not supported.')); return; }
      navigator.geolocation.getCurrentPosition(pos=>{
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, areaName: `GPS (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})` });
      }, () => reject(new Error('Location permission denied.')), {enableHighAccuracy:true,timeout:15000});
    });
  }

  async function checkIn(){
    checkUserAuthBeforeAction(async () => {
      setStatus('Capturing GPS...');
      try {
        const loc = await getLocation();
        active = { checkInAt: new Date().toISOString(), location: loc };
        save();
        showToast('🟢 Clock-In Successful!');
      } catch(e) { showToast(e.message, 'error'); }
    });
  }

  async function checkOut(){
    if(!active) return;
    checkUserAuthBeforeAction(async () => {
      try {
        const outLoc = await getLocation();
        const duration = new Date() - new Date(active.checkInAt);
        history.unshift({ checkInAt: active.checkInAt, checkOutAt: new Date().toISOString(), durationMs: duration, checkInLocation: active.location, checkOutLocation: outLoc });
        active = null;
        save();
        renderHistory();
        showToast('🔴 Clock-Out Successful!');
      } catch(e) { showToast(e.message, 'error'); }
    });
  }

  window.performDirectClock = async (type) => { type === 'Clock In' ? await checkIn() : await checkOut(); };

  window.downloadTimesheetDirectImage = () => {
    checkUserAuthBeforeAction(() => {
      showToast('Generating Timesheet Image...');
      const temp = document.createElement('div');
      temp.className = 'excel-grid-container';
      temp.style.position = 'absolute'; temp.style.left = '-9999px'; temp.style.width = '820px';
      temp.innerHTML = `<h3>ELITE WORKFORCE SOLUTIONS - TIMESHEET</h3><p>Total logs: ${history.length}</p>`;
      document.body.appendChild(temp);
      html2canvas(temp, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Timesheet_${new Date().toISOString().slice(0,10)}.png`;
        link.href = canvas.toDataURL();
        link.click();
        document.body.removeChild(temp);
      });
    });
  };

  window.exportToExcel = () => {
    checkUserAuthBeforeAction(() => {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(history), "Timesheet");
      XLSX.writeFile(wb, `Timesheet_${new Date().toISOString().slice(0,10)}.xlsx`);
      showToast('📊 Excel Downloaded!');
    });
  };

  function renderHistory(){
    const box = document.getElementById('tsHistory');
    if(!box || !history.length) return;
    box.innerHTML = history.map(h => `<div class="ts-history-item-detailed"><div class="time-line">${new Date(h.checkInAt).toLocaleString()}</div></div>`).join('');
  }

  document.getElementById('tsCheckIn')?.addEventListener('click', checkIn);
  document.getElementById('tsCheckOut')?.addEventListener('click', checkOut);
  renderHistory();
  setInterval(() => {
    if(active && document.getElementById('tsElapsed')) {
      document.getElementById('tsElapsed').innerText = fmtDuration(new Date() - new Date(active.checkInAt));
    }
  }, 1000);
})();

let cameraStream = null, currentScanSide = 'front', frontScanData = null, backScanData = null;

function openOcrModal() {
  currentScanSide = 'front'; frontScanData = null; backScanData = null;
  document.getElementById('ocrScanModal').style.display = 'flex';
  switchOcrTab('upload');
}
function closeOcrModal() { stopCameraStream(); document.getElementById('ocrScanModal').style.display = 'none'; }

function switchOcrTab(tab) {
  const upBtn = document.getElementById('ocrTabUpload'), camBtn = document.getElementById('ocrTabCamera');
  const upBox = document.getElementById('ocrUploadBox'), camBox = document.getElementById('ocrCameraBox');
  if (tab === 'upload') {
    upBtn.style.background = 'var(--blue)'; upBtn.style.color = '#fff';
    camBtn.style.background = 'transparent'; camBtn.style.color = 'var(--text)';
    upBox.style.display = 'block'; camBox.style.display = 'none'; stopCameraStream();
  } else {
    camBtn.style.background = 'var(--blue)'; camBtn.style.color = '#fff';
    upBtn.style.background = 'transparent'; upBtn.style.color = 'var(--text)';
    upBox.style.display = 'none'; camBox.style.display = 'block'; startCameraStream();
  }
}

async function startCameraStream() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    document.getElementById('ocrVideo').srcObject = cameraStream;
  } catch (e) { showToast('Camera Error: ' + e.message, 'error'); }
}
function stopCameraStream() { if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; } }

function captureCameraFrame() {
  const video = document.getElementById('ocrVideo');
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1280; canvas.height = video.videoHeight || 720;
  canvas.getContext('2d').drawImage(video, 0, 0);
  canvas.toBlob(blob => processDocumentOCR(blob), 'image/jpeg', 0.95);
}

async function processDocumentOCR(file) {
  stopCameraStream();
  document.getElementById('ocrProgressBox').style.display = 'block';
  try {
    const ret = await Tesseract.recognize(file, 'eng');
    const text = ret.data.text;
    const eidMatch = text.match(/784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d{1}/);
    const nameMatch = text.split('\n').find(l => l.length > 5) || 'Verified User';

    document.getElementById('ocrProgressBox').style.display = 'none';
    document.getElementById('ocrResultsBox').style.display = 'block';
    document.getElementById('ocrDocNumber').value = eidMatch ? eidMatch[0] : 'UAE-ID-12345';
    document.getElementById('ocrName').value = nameMatch;
    showToast('✨ Scan completed successfully!');
  } catch (e) {
    document.getElementById('ocrProgressBox').style.display = 'none';
    showToast('OCR Error: ' + e.message, 'error');
  }
}

function applyOcrDataToForms() {
  const name = document.getElementById('ocrName').value;
  const idNo = document.getElementById('ocrDocNumber').value;
  if (document.getElementById('m_azad_name')) document.getElementById('m_azad_name').value = name;
  if (document.getElementById('comp_person')) document.getElementById('comp_person').value = name;
  if (document.getElementById('comp_license')) document.getElementById('comp_license').value = idNo;
  closeOcrModal();
  showToast('✅ Auto-filled into form!');
}

async function loadDynamicJobVacancies() {
  const grid = document.getElementById('dynamic-vacancies-grid');
  if (!grid) return;
  try {
    const { data } = await _supabase.from('companies').select('*').order('created_at', { ascending: false }).limit(6);
    if (!data || data.length === 0) { grid.innerHTML = '<p style="text-align: center; color: var(--muted); grid-column: span 3;">No live vacancies posted.</p>'; return; }
    grid.innerHTML = data.map(item => `
      <div class="hover-card-effect" style="background: var(--card-bg); padding: 24px; border-radius: 16px; border: 1px solid var(--border-color);">
        <h3 style="font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 6px;">${item.company_name}</h3>
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 15px;">${item.requirement_details}</p>
        <button onclick="openAzadModal()" style="width: 100%; background: var(--blue); color: #fff; border: 0; padding: 10px; border-radius: 8px; font-weight: 800;">Apply Now</button>
      </div>`).join('');
  } catch (e) { console.log(e); }
}
