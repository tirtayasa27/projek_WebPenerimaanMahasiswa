const SUPABASE_CONFIG = window.PMB_SUPABASE_CONFIG || {};

const supabaseClient =
  window.supabase &&
  SUPABASE_CONFIG.url.startsWith("http") &&
  SUPABASE_CONFIG.anonKey &&
  !SUPABASE_CONFIG.anonKey.startsWith("ISI_")
    ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
    : null;

const initialState = {
  role: "applicant",
  activePage: "overview",
  applicant: {
    id: null,
    name: "Alya Rahma Putri",
    email: "alya.rahma@email.com",
    phone: "0812 3456 7890",
    birthPlace: "Bandung",
    birthDate: "2008-05-14",
    gender: "Perempuan",
    address: "Jl. Melati No. 12, Bandung",
    school: "SMA Negeri 5 Bandung",
    registrationNumber: "PMB26-0002",
    studyChoice: "Informatika",
    secondChoice: "Sistem Informasi",
    path: "Reguler",
    documents: {},
    verification: "Diajukan",
    result: "Belum diumumkan",
    reviewNote: ""
  },
  applicants: [
    { number: "PMB26-0001", name: "Rizky Aditya", study: "Manajemen", path: "Prestasi", status: "Terverifikasi", result: "Lulus", documents: { ijazah: "contoh-ijazah-rizky.pdf", identitas: "contoh-identitas-rizky.pdf", pasfoto: "contoh-pasfoto-rizky.jpg", rapor: "contoh-rapor-rizky.pdf" } },
    { number: "PMB26-0002", name: "Alya Rahma Putri", study: "Informatika", path: "Reguler", status: "Diajukan", result: "Belum diumumkan", documents: { ijazah: "contoh-ijazah-alya.pdf", identitas: "contoh-identitas-alya.pdf", pasfoto: "contoh-pasfoto-alya.jpg", rapor: "contoh-rapor-alya.pdf" } },
    { number: "PMB26-0003", name: "Nadia Putri", study: "Psikologi", path: "Beasiswa", status: "Perlu perbaikan", result: "Belum diumumkan", reviewNote: "Unggah ulang ijazah yang lebih jelas.", documents: { ijazah: "contoh-ijazah-nadia.pdf" } },
    { number: "PMB26-0004", name: "Fajar Ramadhan", study: "Akuntansi", path: "Reguler", status: "Terverifikasi", result: "Tidak lulus", documents: { ijazah: "contoh-ijazah-fajar.pdf", identitas: "contoh-identitas-fajar.pdf", pasfoto: "contoh-pasfoto-fajar.jpg", rapor: "contoh-rapor-fajar.pdf" } },
    { number: "PMB26-0005", name: "Dina Safitri", study: "Ilmu Komunikasi", path: "Reguler", status: "Draft", result: "Belum diumumkan", documents: {} }
  ],
  programs: [
    { name: "Informatika", faculty: "Fakultas Teknologi", quota: 120, icon: "⌘", description: "Bangun solusi digital untuk masa depan." },
    { name: "Manajemen", faculty: "Fakultas Ekonomi", quota: 100, icon: "↗", description: "Pimpin bisnis dan ciptakan peluang." },
    { name: "Psikologi", faculty: "Fakultas Humaniora", quota: 80, icon: "◉", description: "Pahami manusia, hadirkan perubahan." },
    { name: "Ilmu Komunikasi", faculty: "Fakultas Humaniora", quota: 90, icon: "✳", description: "Ceritakan ide yang menggerakkan dunia." },
    { name: "Sistem Informasi", faculty: "Fakultas Teknologi", quota: 90, icon: "▦", description: "Hubungkan teknologi dan strategi bisnis." },
    { name: "Akuntansi", faculty: "Fakultas Ekonomi", quota: 80, icon: "◫", description: "Jadi ahli keuangan yang berdampak." },
    { name: "Desain Komunikasi Visual", faculty: "Fakultas Desain", quota: 60, icon: "✎", description: "Wujudkan gagasan melalui desain." },
    { name: "Teknik Industri", faculty: "Fakultas Teknologi", quota: 75, icon: "⚙", description: "Rancang sistem yang lebih efisien." }
  ],
  schedules: [
    { date: "01 Apr – 30 Jun 2026", title: "Pendaftaran gelombang 1", status: "Dibuka" },
    { date: "05 Jul 2026", title: "Ujian seleksi gelombang 1", status: "Segera" },
    { date: "12 Jul 2026", title: "Pengumuman hasil seleksi", status: "Segera" }
  ],
  routes: [
    { name: "Reguler", description: "Seleksi melalui tes potensi akademik berbasis komputer.", status: "Aktif" },
    { name: "Prestasi", description: "Apresiasi untuk pencapaian akademik maupun non-akademik.", status: "Aktif" },
    { name: "Beasiswa", description: "Dukungan pendidikan untuk potensi yang layak diperjuangkan.", status: "Aktif" }
  ],
  announcements: [
    { date: "20 MEI 2026", title: "Pendaftaran mahasiswa baru gelombang 1 telah dibuka", body: "Wujudkan masa depanmu bersama Universitas Cakrawala Nusantara. Pendaftaran dibuka hingga 30 Juni 2026." },
    { date: "15 MEI 2026", title: "Beasiswa Cakrawala untuk calon mahasiswa berprestasi", body: "Kesempatan beasiswa pendidikan bagi calon mahasiswa dengan prestasi akademik dan non-akademik." },
    { date: "08 MEI 2026", title: "Kenali lebih dekat program studi pilihanmu", body: "Ikuti sesi informasi dan konsultasi program studi bersama dosen dan mahasiswa kami." }
  ]
};

const readState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("cakrawala-pmb-state"));
    if (!saved) return structuredClone(initialState);
    return {
      ...structuredClone(initialState),
      ...saved,
      applicant: { ...initialState.applicant, ...saved.applicant },
      applicants: saved.applicants || structuredClone(initialState.applicants),
      programs: saved.programs || structuredClone(initialState.programs),
      schedules: saved.schedules || structuredClone(initialState.schedules),
      routes: saved.routes || structuredClone(initialState.routes),
      announcements: saved.announcements || structuredClone(initialState.announcements)
    };
  } catch (error) {
    console.error("Tidak dapat membaca data PMB tersimpan.", error);
    return structuredClone(initialState);
  }
};

let state = readState();
let toastTimer;
let savedPortalContent;
let passwordRecoveryFormShown = false;
const $ = (selector, root = document) => root.querySelector(selector);
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const save = () => localStorage.setItem("cakrawala-pmb-state", JSON.stringify(state));
const toast = (message) => {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("show"), 2600);
};
const setAuthenticatedNavigation = (authenticated) => {
  const headerActions = $("#headerActions");
  const dashboardLink = $("#dashboardLink");
  if (headerActions) {
    headerActions.classList.toggle("hidden", authenticated);
    headerActions.setAttribute("aria-hidden", String(authenticated));
  }
  if (dashboardLink) {
    dashboardLink.classList.toggle("hidden", !authenticated);
    dashboardLink.setAttribute("aria-hidden", String(!authenticated));
  }
};

const setAddressBarPath = (targetPath) => {
  if (window.location.pathname !== targetPath) {
    window.history.pushState({ path: targetPath }, "", targetPath);
  }
};
const syncUrlForRole = (role) => setAddressBarPath(role === "admin" ? "/admin" : "/login");
const syncUrlForHome = () => setAddressBarPath("/");

const mapRowToApplicant = (row) => ({
  id: row.id,
  name: row.full_name || "Calon Mahasiswa",
  email: row.email || "",
  phone: row.phone || "",
  birthPlace: row.birth_place || "",
  birthDate: row.birth_date || "",
  gender: row.gender || "Perempuan",
  address: row.address || "",
  school: row.school || "",
  registrationNumber: row.registration_number || "PMB26-0002",
  studyChoice: row.study_choice || "Informatika",
  secondChoice: row.second_choice || "Sistem Informasi",
  path: row.path || "Reguler",
  documents: row.documents || {},
  verification: row.verification || "Draft",
  result: row.result || "Belum diumumkan",
  reviewNote: row.review_note || ""
});

const mapApplicantToDbPayload = (applicant, role = "applicant") => ({
  role,
  registration_number: applicant.registrationNumber,
  full_name: applicant.name,
  email: applicant.email,
  phone: applicant.phone || "",
  birth_place: applicant.birthPlace || "",
  birth_date: applicant.birthDate ? applicant.birthDate : null,
  gender: applicant.gender || "Perempuan",
  address: applicant.address || "",
  school: applicant.school || "",
  study_choice: applicant.studyChoice || "Informatika",
  second_choice: applicant.secondChoice || "Sistem Informasi",
  path: applicant.path || "Reguler",
  documents: applicant.documents || {},
  verification: applicant.verification || "Draft",
  result: applicant.result || "Belum diumumkan",
  review_note: applicant.reviewNote || ""
});

async function syncProfilesFromSupabase() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Gagal mengambil profil dari Supabase:", error.message);
    return;
  }
  const rows = Array.isArray(data) ? data : [];
  const applicantRows = rows.filter((row) => row.role !== "admin");
  const applicants = applicantRows.map((row) => ({
    number: row.registration_number,
    name: row.full_name,
    study: row.study_choice || "Informatika",
    path: row.path || "Reguler",
    status: row.verification || "Draft",
    result: row.result || "Belum diumumkan",
    reviewNote: row.review_note || "",
    documents: row.documents || {}
  }));
  if (state.role === "admin") {
    const { data: demoRows, error: demoError } = await supabaseClient
      .from("demo_applicants")
      .select("*")
      .order("registration_number", { ascending: true });
    if (demoError) {
      console.warn("Gagal mengambil data contoh pendaftar:", demoError.message);
    } else {
      applicants.push(...demoRows.map((row) => ({
        number: row.registration_number,
        name: row.full_name,
        study: row.study_choice,
        path: row.path,
        status: row.verification,
        result: row.result,
        reviewNote: row.review_note,
        documents: row.documents || {}
      })));
    }
  }
  state.applicants = applicants;
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const matched = applicantRows.find((row) => row.user_id === sessionData.session?.user.id);

  if (matched) {
    state.applicant = mapRowToApplicant(matched);
  }
  save();
}

async function upsertProfileToSupabase(applicantData, role = "applicant", authUserId = null) {
  if (!supabaseClient) return null;
  const payload = mapApplicantToDbPayload(applicantData, role);
  if (authUserId) payload.user_id = authUserId;

  const { data, error } = await supabaseClient
    .from("profiles")
    .upsert(payload, { onConflict: "registration_number" })
    .select()
    .single();

  if (error) {
    console.warn("Gagal menyimpan profil ke Supabase:", error.message);
    return { error };
  }
  return { data };
}

async function updateApplicantFieldsInSupabase(registrationNumber, updates) {
  if (!supabaseClient || !registrationNumber) return { error: new Error("Supabase atau nomor pendaftaran tidak tersedia.") };
  const { data, error } = await supabaseClient
    .from("profiles")
    .update(updates)
    .eq("registration_number", registrationNumber)
    .select("registration_number");

  if (error) {
    console.warn("Gagal memperbarui data di Supabase:", error.message);
    return { error };
  }
  if (data?.length) return { error: null };

  const { data: demoRows, error: demoError } = await supabaseClient
    .from("demo_applicants")
    .update(updates)
    .eq("registration_number", registrationNumber)
    .select("registration_number");
  if (demoError) {
    console.warn("Gagal memperbarui data contoh pendaftar:", demoError.message);
    return { error: demoError };
  }
  return demoRows?.length ? { error: null } : { error: new Error(`Pendaftar ${registrationNumber} tidak ditemukan di Supabase.`) };
}

async function syncPortalContentFromSupabase() {
  if (!supabaseClient) return;
  savedPortalContent = structuredClone({
    programs: state.programs,
    schedules: state.schedules,
    routes: state.routes,
    announcements: state.announcements
  });
  const { data, error } = await supabaseClient
    .from("portal_content")
    .select("programs,schedules,routes,announcements")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.warn("Gagal mengambil konten portal dari Supabase:", error.message);
    return;
  }
  if (!data) {
    savedPortalContent = structuredClone({
      programs: state.programs,
      schedules: state.schedules,
      routes: state.routes,
      announcements: state.announcements
    });
    return;
  }
  state.programs = data.programs || state.programs;
  state.schedules = data.schedules || state.schedules;
  state.routes = data.routes || state.routes;
  state.announcements = data.announcements || state.announcements;
  savedPortalContent = structuredClone({
    programs: state.programs,
    schedules: state.schedules,
    routes: state.routes,
    announcements: state.announcements
  });
  save();
}

async function persistPortalContent() {
  try {
    if (!supabaseClient) throw new Error("Supabase belum dikonfigurasi untuk menyimpan konten portal.");
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session) throw new Error("Silakan masuk kembali sebagai panitia.");

    const { error } = await supabaseClient.from("portal_content").upsert({
      id: 1,
      programs: state.programs,
      schedules: state.schedules,
      routes: state.routes,
      announcements: state.announcements,
      updated_by: sessionData.session.user.id
    });
    if (error) throw error;

    savedPortalContent = structuredClone({
      programs: state.programs,
      schedules: state.schedules,
      routes: state.routes,
      announcements: state.announcements
    });
  } catch (error) {
    if (savedPortalContent) Object.assign(state, structuredClone(savedPortalContent));
    save();
    renderPublic();
    if (state.activePage !== "home") renderDashboard();
    throw error;
  }
}

const navConfig = {
  applicant: [
    { group: "MENU PENDAFTAR", items: [["overview", "▦", "Ringkasan"], ["biodata", "◉", "Biodata"], ["choices", "◇", "Pilihan studi"], ["documents", "⇧", "Unggah berkas"]] },
    { group: "HASIL SELEKSI", items: [["verification", "✓", "Verifikasi berkas"], ["result", "✦", "Hasil seleksi"], ["proof", "▤", "Bukti pendaftaran"]] }
  ],
  admin: [
    { group: "MENU ADMIN", items: [["admin-overview", "▦", "Ringkasan"], ["applicants", "◉", "Data pendaftar"], ["verification-admin", "✓", "Pemeriksaan berkas"], ["results-admin", "✦", "Hasil seleksi"]] },
    { group: "PENGELOLAAN", items: [["programs-admin", "◇", "Program studi"], ["routes-admin", "↗", "Jalur pendaftaran"], ["schedule-admin", "▣", "Jadwal penerimaan"], ["announcements-admin", "▤", "Pengumuman"]] }
  ]
};
const pageTitles = {
  overview: "Ringkasan pendaftaran", biodata: "Biodata", choices: "Pilihan program studi", documents: "Unggah berkas",
  verification: "Hasil verifikasi", result: "Hasil seleksi", proof: "Bukti pendaftaran", "admin-overview": "Ringkasan admin",
  applicants: "Data pendaftar", "verification-admin": "Pemeriksaan berkas", "results-admin": "Hasil seleksi",
  "programs-admin": "Program studi", "routes-admin": "Jalur pendaftaran", "schedule-admin": "Jadwal penerimaan", "announcements-admin": "Pengumuman"
};

function renderPublic() {
  $("#publicPrograms").innerHTML = state.programs.slice(0, 4).map((program) => `<article class="program-card"><span class="program-icon">${escapeHTML(program.icon || "◇")}</span><h3>${escapeHTML(program.name)}</h3><p>${escapeHTML(program.description || program.faculty)}</p><div class="program-meta"><span>${escapeHTML(program.faculty)}</span><b>Kuota ${escapeHTML(program.quota)}</b></div></article>`).join("");
  $("#publicSchedules").innerHTML = state.schedules.map((schedule) => `<div><span class="schedule-date">${escapeHTML(schedule.date)}</span><strong>${escapeHTML(schedule.title)}</strong><span class="schedule-status ${schedule.status === "Dibuka" ? "" : "muted"}">${escapeHTML(schedule.status.toUpperCase())}</span></div>`).join("");
  $("#publicPaths").innerHTML = state.routes.map((route, index) => `<article class="path-card"><span>0${index + 1}</span><h3>Jalur ${escapeHTML(route.name)}</h3><p>${escapeHTML(route.description)}</p><small>${escapeHTML(route.status.toUpperCase())}</small></article>`).join("");
  $("#publicAnnouncements").innerHTML = state.announcements.slice(0, 3).map((item) => `<article class="announcement-card"><small>${escapeHTML(item.date)}</small><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.body)}</p></article>`).join("");
}

function showPage(page) {
  state.activePage = page;
  save();
  $("#homeView").classList.toggle("hidden", page !== "home");
  $("#dashboardView").classList.toggle("hidden", page === "home");
  if (page !== "home") renderDashboard();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const publicPageSections = {
  "/tentang": "profil",
  "/program-studi": "program",
  "/jalur-masuk": "jalur",
  "/jadwal": "jadwal",
  "/biaya": "biaya"
};

function showPublicPage(sectionId = null) {
  for (const section of $("#homeView").children) {
    section.classList.toggle("hidden", Boolean(sectionId) && section.id !== sectionId);
  }
  showPage("home");
}

function renderDashboard() {
  const admin = state.role === "admin";
  $("#sideLabel").textContent = admin ? "AREA PANITIA" : "AREA PENDAFTAR";
  $("#sidebarName").textContent = admin ? "Admin PMB" : state.applicant.name;
  $("#sidebarRole").textContent = admin ? "Panitia penerimaan" : "Calon mahasiswa";
  $("#currentSection").textContent = pageTitles[state.activePage] || "Ringkasan";
  $("#dashboardNav").innerHTML = navConfig[state.role].map((group) => `<div class="nav-group-label">${group.group}</div>${group.items.map(([id, icon, label]) => `<button class="${state.activePage === id ? "active" : ""}" data-page="${id}"><span class="nav-icon">${icon}</span>${label}</button>`).join("")}`).join("");
  $("#dashboardContent").innerHTML = admin ? renderAdminPage(state.activePage) : renderApplicantPage(state.activePage);
}

function pageHeading(title, subtitle, action = "") {
  return `<div class="dash-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}
function statCard(label, value, note) {
  return `<article class="stat-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`;
}
function statusBadge(value) {
  const klass = /Terverifikasi|Lulus|Diterima|Dibuka|Aktif/i.test(value) ? "success" : /Perlu perbaikan|Tidak lulus|Ditolak/i.test(value) ? "danger" : "warning";
  return `<span class="status-badge ${klass}">${escapeHTML(value)}</span>`;
}
function progressMarkup(percent, label = "Progres pendaftaran") {
  return `<div class="progress-wrap"><div class="progress-label"><span>${label}</span><b>${percent}%</b></div><div class="progress-track"><span style="width:${percent}%"></span></div></div>`;
}
function greetingName(email, fallbackName) {
  if (fallbackName && fallbackName !== "Alya Rahma Putri") return fallbackName.split(/\s+/)[0];
  const localPart = String(email || "").split("@")[0].split("+")[0];
  const nameParts = localPart.split(/[._-]+/).map((part) => part.replace(/\d+/g, "")).filter(Boolean);
  if (!nameParts.length) return fallbackName.split(/\s+/)[0] || "Mahasiswa";
  return nameParts.map((part) => part.charAt(0).toLocaleUpperCase("id-ID") + part.slice(1).toLocaleLowerCase("id-ID")).join(" ");
}
function stepsMarkup() {
  const current = state.applicant.documents && Object.keys(state.applicant.documents).length ? 3 : 2;
  const verificationDetail = state.applicant.reviewNote
    ? `${state.applicant.verification} — Catatan: ${state.applicant.reviewNote}`
    : state.applicant.verification;
  return [["Buat akun pendaftaran", "Akun berhasil dibuat"], ["Lengkapi biodata", "Pastikan data diri sudah benar"], ["Unggah berkas persyaratan", "Unggah dokumen yang diminta"], ["Verifikasi berkas", verificationDetail], ["Pengumuman hasil seleksi", state.applicant.result]].map(([title, detail], index) => `<div class="status-step"><span class="step-dot ${index < current ? "" : "pending"}">${index < current ? "✓" : index + 1}</span><div><strong>${title}</strong><small>${escapeHTML(detail)}</small></div></div>`).join("");
}

function renderApplicantPage(page) {
  const a = state.applicant;
  if (page === "overview") return `${pageHeading("Halo, " + escapeHTML(greetingName(a.email, a.name)) + " 👋", "Pantau perjalanan pendaftaranmu di sini.")}<div class="welcome-banner"><div><span>PENDAFTARAN TAHUN AKADEMIK 2026/2027</span><h2>${escapeHTML(a.registrationNumber)}</h2><p>${escapeHTML(a.studyChoice)} · Jalur ${escapeHTML(a.path)}</p></div><button class="button button-gold" data-page="proof">Lihat bukti <span>↗</span></button></div><div class="stat-grid">${statCard("Status pendaftaran", escapeHTML(a.verification), "● Status pemeriksaan berkas")}${statCard("Nomor pendaftaran", escapeHTML(a.registrationNumber), "Nomor identitas PMB")}${statCard("Pilihan program studi", escapeHTML(a.studyChoice), "Pilihan utama")}${statCard("Jalur pendaftaran", escapeHTML(a.path), "Tahun akademik 2026/27")}</div><div class="dashboard-columns"><section class="panel-card"><div class="panel-heading"><h3>Progres pendaftaran</h3><button class="plain-link" data-page="documents">Lengkapi berkas →</button></div>${progressMarkup(a.verification === "Terverifikasi" ? 80 : 45)}${stepsMarkup()}</section><section class="panel-card"><div class="panel-heading"><h3>Informasi penting</h3></div><div class="alert-box"><strong>Jangan lupa melengkapi berkasmu.</strong><br>Pastikan semua dokumen terlihat jelas agar proses verifikasi lebih cepat.</div><div class="panel-heading" style="margin-top:20px"><h3>Pengumuman terbaru</h3></div>${state.announcements.slice(0, 2).map((n) => `<div class="announcement-row"><div><strong>${escapeHTML(n.title)}</strong><p>${escapeHTML(n.date)}</p></div></div>`).join("")}</section></div>`;
  if (page === "biodata") return `${pageHeading("Biodata diri", "Lengkapi data diri dengan benar sesuai dokumen resmi.")}<form id="biodataForm" class="panel-card"><div class="panel-heading"><div><h3>Informasi pribadi</h3><p>Nama lengkap dan data pribadi tersimpan di database Supabase.</p></div></div><div class="field-grid">${field("Nama lengkap", "name", a.name, "text", true)}${field("Alamat email", "email", a.email, "email", true)}${field("Nomor telepon", "phone", a.phone, "tel", true)}${field("Jenis kelamin", "gender", a.gender, "select", true, ["Perempuan", "Laki-laki"])}${field("Tempat lahir", "birthPlace", a.birthPlace)}${field("Tanggal lahir", "birthDate", a.birthDate, "date")}${field("Asal sekolah", "school", a.school)}${field("Alamat domisili", "address", a.address)}</div><div class="form-actions"><button class="button button-primary">Simpan biodata <span>→</span></button></div></form>`;
  if (page === "choices") return `${pageHeading("Pilihan program studi", "Tentukan program studi dan jalur yang paling sesuai.")}<form id="choicesForm"><section class="panel-card"><div class="panel-heading"><div><h3>Pilihan pertama</h3><p>Pilih program studi prioritasmu.</p></div></div><div class="choice-cards">${state.programs.map((p) => `<label class="choice-card ${a.studyChoice === p.name ? "selected" : ""}"><input type="radio" name="studyChoice" value="${escapeHTML(p.name)}" ${a.studyChoice === p.name ? "checked" : ""}> <strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.faculty)}</small></label>`).join("")}</div></section><section class="panel-card"><div class="panel-heading"><div><h3>Pilihan kedua</h3><p>Tambahkan alternatif program studi.</p></div></div><div class="form-field"><select name="secondChoice">${state.programs.map((p) => `<option ${a.secondChoice === p.name ? "selected" : ""}>${escapeHTML(p.name)}</option>`).join("")}</select></div></section><section class="panel-card"><div class="panel-heading"><div><h3>Jalur pendaftaran</h3><p>Pilih jalur seleksi yang ingin kamu ikuti.</p></div></div><div class="choice-cards">${["Reguler", "Prestasi", "Beasiswa"].map((path) => `<label class="choice-card ${a.path === path ? "selected" : ""}"><input type="radio" name="path" value="${path}" ${a.path === path ? "checked" : ""}> <strong>Jalur ${path}</strong><small>${path === "Reguler" ? "Seleksi tes akademik" : path === "Prestasi" ? "Seleksi portofolio" : "Beasiswa pendidikan"}</small></label>`).join("")}</div><div class="form-actions"><button class="button button-primary">Simpan pilihan <span>→</span></button></div></section></form>`;
  if (page === "documents") return `${pageHeading("Unggah berkas", "Unggah dokumen persyaratan dengan format PDF, JPG, PNG, atau WEBP.")}<section class="panel-card"><div class="panel-heading"><div><h3>Dokumen persyaratan</h3><p>Ukuran maksimal 5 MB untuk setiap berkas.</p></div>${progressMarkup(Math.min(100, Object.keys(a.documents).length * 25), "Kelengkapan berkas")}</div><div class="upload-grid">${[["ijazah", "Ijazah / surat keterangan lulus"], ["identitas", "Kartu identitas (KTP / KK)"], ["pasfoto", "Pas foto terbaru"], ["rapor", "Rapor semester 1–5"]].map(([key, title]) => `<label class="upload-card"><span class="upload-symbol">⇧</span><span><strong>${title}</strong><small>${a.documents[key] ? escapeHTML(a.documents[key]) : "Belum ada berkas · PDF / JPG / PNG / WEBP"}</small></span><span class="upload-action">${a.documents[key] ? "Ganti" : "Pilih file"}<input type="file" data-document="${key}" accept=".pdf,.jpg,.jpeg,.png,.webp"></span></label>`).join("")}</div><div class="form-actions"><button class="button button-outline" data-page="overview">Kembali</button><button class="button button-primary" data-action="submitDocuments">Kirim untuk verifikasi <span>→</span></button></div></section><div class="alert-box">Berkas diunggah ke penyimpanan Cloudflare R2 dan ditautkan ke pendaftaranmu.</div>`;
  if (page === "verification") return `${pageHeading("Hasil verifikasi berkas", "Pantau status pemeriksaan dokumen pendaftaranmu.")}<section class="panel-card"><div class="panel-heading"><div><h3>Status dokumen</h3><p>Nomor pendaftaran ${escapeHTML(a.registrationNumber)}</p></div>${statusBadge(a.verification)}</div>${[["Ijazah / surat keterangan lulus", "ijazah"], ["Kartu identitas", "identitas"], ["Pas foto", "pasfoto"], ["Rapor semester 1–5", "rapor"]].map(([title, key]) => `<div class="status-step"><span class="step-dot ${a.documents[key] ? "" : "pending"}">${a.documents[key] ? "✓" : "·"}</span><div style="flex:1"><strong>${title}</strong><small>${a.documents[key] ? escapeHTML(a.documents[key]) : "Belum diunggah"}</small></div>${statusBadge(a.documents[key] ? a.verification : "Belum diunggah")}</div>`).join("")}</section><div class="alert-box">Jika berkas perlu diperbaiki, unggah kembali dokumen dengan kualitas gambar yang jelas.</div>`;
  if (page === "result") return `${pageHeading("Hasil seleksi", "Informasi hasil seleksi penerimaan mahasiswa baru.")}<section class="panel-card"><div class="panel-heading"><div><h3>Pengumuman hasil seleksi</h3><p>Nomor pendaftaran ${escapeHTML(a.registrationNumber)}</p></div>${statusBadge(a.result)}</div><div class="welcome-banner"><div><span>PROGRAM STUDI PILIHAN</span><h2>${escapeHTML(a.studyChoice)}</h2><p>Jalur ${escapeHTML(a.path)} · Tahun akademik 2026/2027</p></div></div><p style="font-size:10px;color:#788392;line-height:1.7">Hasil seleksi akan ditampilkan di halaman ini setelah proses seleksi selesai pada 12 Juli 2026. Pastikan data dan dokumenmu sudah lengkap.</p></section>`;
  if (page === "proof") return `${pageHeading("Bukti pendaftaran", "Ringkasan pendaftaranmu. Simpan bukti ini sebagai referensi.")}<section class="panel-card proof-card"><div class="panel-heading"><div><h3>UNIVERSITAS CAKRAWALA NUSANTARA</h3><p>BUKTI PENDAFTARAN MAHASISWA BARU 2026/2027</p></div><span class="brand-mark">C</span></div><div class="field-grid">${proofRow("Nomor pendaftaran", a.registrationNumber)}${proofRow("Nama lengkap", a.name)}${proofRow("Program studi", a.studyChoice)}${proofRow("Pilihan kedua", a.secondChoice)}${proofRow("Jalur pendaftaran", a.path)}${proofRow("Status pendaftaran", a.verification)}</div><div class="form-actions"><button class="button button-outline" data-action="printProof">Cetak / Simpan PDF <span>↗</span></button></div></section>`;
  return "";
}

function field(label, name, value, type = "text", required = false, options = []) {
  const control = type === "select" ? `<select name="${name}" ${required ? "required" : ""}>${options.map((option) => `<option ${value === option ? "selected" : ""}>${option}</option>`).join("")}</select>` : `<input name="${name}" type="${type}" value="${escapeHTML(value)}" ${required ? "required" : ""}>`;
  return `<div class="form-field"><label>${label}${required ? " *" : ""}</label>${control}</div>`;
}
function proofRow(label, value) {
  return `<div class="form-field"><label>${label}</label><strong>${escapeHTML(value || "—")}</strong></div>`;
}

const adminSections = {
  "admin-overview": () => {
    const counts = { verified: state.applicants.filter((a) => a.status === "Terverifikasi").length, pending: state.applicants.filter((a) => ["Draft", "Diajukan", "Menunggu verifikasi"].includes(a.status)).length, needsFix: state.applicants.filter((a) => a.status === "Perlu perbaikan").length };
    const totals = [12, 18, 15, 23, 19, 27, state.applicants.length];
    return `${pageHeading("Ringkasan penerimaan", "Pantau aktivitas pendaftaran mahasiswa baru 2026/2027.")}<div class="stat-grid">${statCard("Total pendaftar", state.applicants.length, "↑ 12% dari periode lalu")}${statCard("Menunggu verifikasi", counts.pending, "Perlu ditinjau")}${statCard("Berkas terverifikasi", counts.verified, "Siap seleksi")}${statCard("Perlu perbaikan", counts.needsFix, "Tindak lanjut")}</div><div class="dashboard-columns"><section class="panel-card"><div class="panel-heading"><div><h3>Pendaftar per hari</h3><p>Aktivitas pendaftaran minggu ini</p></div><span class="status-badge">7 hari terakhir</span></div><div class="admin-chart">${totals.map((v, i) => `<div class="chart-column"><i style="height:${Math.max(14, v * 3)}px"></i><small>${["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i]}</small></div>`).join("")}</div></section><section class="panel-card"><div class="panel-heading"><div><h3>Peminat per program studi</h3><p>Dibanding kuota penerimaan</p></div></div>${state.programs.slice(0, 5).map((p) => { const interest = state.applicants.filter((applicant) => applicant.study === p.name).length; const percentage = Math.min(100, (interest / Math.max(1, Number(p.quota))) * 100); return `<div class="quota-row"><span class="quota-name">${escapeHTML(p.name)}</span><span class="quota-track"><i style="width:${Math.max(percentage, interest ? 4 : 0)}%"></i></span><span class="quota-count">${interest}/${escapeHTML(p.quota)}</span></div>`; }).join("")}</section></div><section class="panel-card"><div class="panel-heading"><h3>Pendaftar terbaru</h3><button class="plain-link" data-page="applicants">Lihat semua →</button></div>${renderApplicantTable(state.applicants.slice(0, 4), false)}</section>`;
  },
  applicants: () => `${pageHeading("Data pendaftar", "Kelola dan pantau seluruh data calon mahasiswa.")}<section class="panel-card"><div class="search-row"><input class="search-input" id="applicantSearch" placeholder="Cari nama atau nomor pendaftaran"><select class="select-small" id="statusFilter"><option value="">Semua status</option><option>Draft</option><option>Diajukan</option><option>Menunggu verifikasi</option><option>Terverifikasi</option><option>Perlu perbaikan</option></select><button class="button button-outline" data-action="exportApplicants">Ekspor CSV ↓</button></div><div id="applicantTable">${renderApplicantTable(state.applicants, true)}</div></section>`,
  "verification-admin": () => `${pageHeading("Pemeriksaan berkas", "Tinjau dan perbarui status verifikasi calon mahasiswa.")}<section class="panel-card"><div class="panel-heading"><div><h3>Antrian verifikasi</h3><p>${state.applicants.filter((a) => a.status !== "Terverifikasi").length} pendaftar menunggu pemeriksaan</p></div><select class="select-small" id="verificationFilter"><option value="">Semua status</option><option>Draft</option><option>Diajukan</option><option>Menunggu verifikasi</option><option>Perlu perbaikan</option><option>Terverifikasi</option></select></div><div id="applicantTable">${renderApplicantTable(state.applicants, true, true)}</div></section>`,
  "results-admin": () => `${pageHeading("Hasil seleksi", "Kelola dan umumkan hasil seleksi calon mahasiswa.")}<section class="panel-card"><div class="panel-heading"><div><h3>Kelulusan pendaftar</h3><p>Hasil dapat diperbarui setelah proses seleksi selesai.</p></div></div><div class="alert-box">Catatan: pembaruan hasil seleksi tersimpan ke database jika Supabase aktif.</div>${renderResultsTable()}</section>`,
  "programs-admin": () => `${pageHeading("Program studi", "Kelola daftar program studi dan kuota penerimaan.", `<button class="button button-primary" data-action="addProgram">＋ Tambah program</button>`)}<section class="panel-card">${renderProgramsTable()}</section>`,
  "routes-admin": () => `${pageHeading("Jalur pendaftaran", "Atur pilihan jalur seleksi untuk calon mahasiswa.")}<section class="panel-card">${state.routes.map((route) => `<div class="announcement-row"><div><strong>${escapeHTML(route.name)}</strong><p>${escapeHTML(route.description)}</p>${statusBadge(route.status)}</div><button class="table-action" data-action="editRoute" data-name="${escapeHTML(route.name)}">Edit</button></div>`).join("")}</section>`,
  "schedule-admin": () => `${pageHeading("Jadwal penerimaan", "Kelola tahapan dan tanggal penting penerimaan.", `<button class="button button-primary" data-action="addSchedule">＋ Tambah jadwal</button>`)}<section class="panel-card">${renderScheduleTable()}</section>`,
  "announcements-admin": () => `${pageHeading("Pengumuman", "Kelola informasi yang tampil di halaman utama.", `<button class="button button-primary" data-action="addAnnouncement">＋ Buat pengumuman</button>`)}<section class="panel-card">${state.announcements.map((n, i) => `<div class="announcement-row"><div><small>${escapeHTML(n.date)}</small><strong style="display:block;margin-top:7px">${escapeHTML(n.title)}</strong><p>${escapeHTML(n.body)}</p></div><button class="table-action" data-action="deleteAnnouncement" data-index="${i}">Hapus</button></div>`).join("")}</section>`
};

function renderAdminPage(page) { return adminSections[page] ? adminSections[page]() : adminSections["admin-overview"](); }
function renderApplicantTable(rows, showAction, verificationOnly = false) {
  return `<div class="table-wrap"><table><thead><tr><th>Nomor / Nama</th><th>Program studi</th><th>Jalur</th><th>Status</th>${showAction ? "<th>Aksi</th>" : ""}</tr></thead><tbody>${rows.map((a) => `<tr data-status="${escapeHTML(a.status)}"><td><strong>${escapeHTML(a.number)}</strong><br>${escapeHTML(a.name)}</td><td>${escapeHTML(a.study)}</td><td>${escapeHTML(a.path)}</td><td>${statusBadge(a.status)}</td>${showAction ? `<td><button class="table-action" data-action="${verificationOnly ? "reviewApplicant" : "editApplicant"}" data-number="${escapeHTML(a.number)}">${verificationOnly ? "Tinjau" : "Detail →"}</button></td>` : ""}</tr>`).join("")}</tbody></table></div>`;
}
function renderResultsTable() {
  return `<div class="table-wrap"><table><thead><tr><th>Nama pendaftar</th><th>Program studi</th><th>Status seleksi</th><th>Perbarui hasil</th></tr></thead><tbody>${state.applicants.map((a) => `<tr><td><strong>${escapeHTML(a.number)}</strong><br>${escapeHTML(a.name)}</td><td>${escapeHTML(a.study)}</td><td>${statusBadge(a.result || "Belum diumumkan")}</td><td><select class="select-small result-select" data-number="${escapeHTML(a.number)}">${["Belum diumumkan", "Lulus", "Tidak lulus"].map((result) => `<option ${result === (a.result || "Belum diumumkan") ? "selected" : ""}>${result}</option>`).join("")}</select></td></tr>`).join("")}</tbody></table></div>`;
}
function renderProgramsTable() {
  return `<div class="table-wrap"><table><thead><tr><th>Program studi</th><th>Fakultas</th><th>Kuota</th><th>Aksi</th></tr></thead><tbody>${state.programs.map((p, i) => `<tr><td><strong>${escapeHTML(p.name)}</strong></td><td>${escapeHTML(p.faculty)}</td><td>${escapeHTML(p.quota)}</td><td><button class="table-action" data-action="deleteProgram" data-index="${i}">Hapus</button></td></tr>`).join("")}</tbody></table></div>`;
}
function renderScheduleTable() {
  return `<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Kegiatan</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${state.schedules.map((s, i) => `<tr><td>${escapeHTML(s.date)}</td><td><strong>${escapeHTML(s.title)}</strong></td><td>${statusBadge(s.status)}</td><td><button class="table-action" data-action="deleteSchedule" data-index="${i}">Hapus</button></td></tr>`).join("")}</tbody></table></div>`;
}

function openModal(title, description, fields, submitLabel, onSubmit, { requiredAuth = false, accountSwitch = "" } = {}) {
  const closeButton = requiredAuth ? "" : '<button type="button" class="modal-close" data-action="closeModal">×</button>';
  $("#modalRoot").innerHTML = `<div class="modal-backdrop"><form class="modal" id="modalForm" data-required-auth="${requiredAuth}"><div class="modal-top"><h2>${title}</h2>${closeButton}</div><p>${description}</p>${fields}${accountSwitch}<button class="button button-primary">${submitLabel}</button></form></div>`;
  $("#modalForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      await onSubmit(data);
      if ($("#modalForm") === form) $("#modalRoot").innerHTML = "";
    } catch (error) {
      const message = error.message || "Terjadi kesalahan. Silakan coba lagi.";
      if (error.code === "weak_password") {
        const reasons = Array.isArray(error.reasons) ? error.reasons : [];
        if (reasons.includes("pwned")) {
          toast("Kata sandi ini terdeteksi tidak aman. Pilih kata sandi lain yang belum pernah digunakan.");
        } else if (reasons.includes("length")) {
          toast("Supabase menolak panjang kata sandi ini. Jika sudah 8 karakter atau lebih, admin perlu menurunkan batas minimum di pengaturan Auth Supabase.");
        } else if (reasons.includes("characters")) {
          toast("Kata sandi belum memenuhi aturan karakter di Supabase. Admin perlu memeriksa Authentication → Settings → Password.");
        } else {
          toast("Supabase menolak kata sandi ini. Coba kata sandi lain; jika tetap gagal, admin perlu memeriksa aturan kata sandi pada pengaturan Auth Supabase.");
        }
      } else if (/password.*(at least|minimum|shorter than)|signup requires a valid password/i.test(message)) {
        toast("Supabase menolak kata sandi ini. Aplikasi meminta minimal 8 karakter; jika sandi sudah 8 karakter atau lebih, admin perlu memeriksa batas minimum di pengaturan Auth Supabase.");
      } else if (/Database error saving new user/i.test(message)) {
        toast("Supabase gagal membuat akun. Minta admin memeriksa Supabase Auth Logs dan trigger database.");
      } else if (/email rate limit exceeded|rate limit/i.test(message)) {
        toast("Batas pengiriman email tercapai. Tunggu beberapa saat sebelum meminta tautan reset lagi.");
      } else if (/invalid login credentials/i.test(message)) {
        toast("Email atau kata sandi tidak cocok. Gunakan email yang sama saat mendaftar; jika lupa kata sandi, pilih “Lupa kata sandi?”. Jika belum punya akun, pilih “Daftar sekarang”.");
      } else {
        toast(message);
      }
    }
  });
}

function passwordInputMarkup(id, label, autocomplete, withHint = false) {
  const passwordRequirements = 'minlength="8" aria-describedby="passwordHint"';
  return `<div class="form-field"><label for="${id}">${label}</label><div class="password-input-wrap"><input id="${id}" name="${id}" type="password" required ${withHint ? passwordRequirements : ""} autocomplete="${autocomplete}" placeholder="${withHint ? "Minimal 8 karakter" : "Masukkan kata sandi"}"><button class="password-toggle" type="button" data-action="togglePassword" aria-label="Tampilkan kata sandi" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle><path class="password-eye-slash" d="m4 4 16 16"></path></svg></button></div>${withHint ? '<small id="passwordHint">Minimal 8 karakter. Huruf besar, angka, dan simbol tidak diwajibkan.</small>' : ""}</div>`;
}

function requestPasswordReset(email = "") {
  openModal(
    "Reset kata sandi",
    "Masukkan email akunmu. Kami akan mengirim tautan untuk membuat kata sandi baru.",
    `<div class="form-field"><label for="resetEmail">Alamat email</label><input id="resetEmail" name="email" type="email" value="${escapeHTML(email)}" required autocomplete="email" placeholder="nama@email.com"></div>`,
    "Kirim tautan reset",
    async (data) => {
      if (!supabaseClient) throw new Error("Supabase belum dikonfigurasi.");
      const { error } = await supabaseClient.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/login?mode=recovery`
      });
      if (error) throw error;
      $("#modalRoot").innerHTML = "";
      toast("Jika email terdaftar, tautan reset akan segera dikirim. Periksa juga folder spam.");
    }
  );
}

function showPasswordRecoveryForm() {
  if (passwordRecoveryFormShown) return;
  passwordRecoveryFormShown = true;
  openModal(
    "Buat kata sandi baru",
    "Masukkan kata sandi baru untuk akun PMB-mu.",
    `${passwordInputMarkup("newPassword", "Kata sandi baru", "new-password", true)}<div class="form-field"><label for="confirmPassword">Ulangi kata sandi baru</label><input id="confirmPassword" name="confirmPassword" type="password" required minlength="8" autocomplete="new-password" placeholder="Ulangi kata sandi baru"></div>`,
    "Simpan kata sandi baru",
    async (data) => {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("Kedua kata sandi tidak sama.");
      }
      const { error } = await supabaseClient.auth.updateUser({ password: data.newPassword });
      if (error) throw error;
      const { error: signOutError } = await supabaseClient.auth.signOut();
      if (signOutError) throw signOutError;
      window.history.replaceState({}, "", "/login");
      passwordRecoveryFormShown = false;
      loginModal(false, "applicant");
      toast("Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.");
    }
  );
}

async function createApplicantProfile(user, fullName) {
  const { data: registrationNumber, error: numberError } = await supabaseClient.rpc("next_pmb_registration_number");
  if (numberError) throw numberError;

  state.applicant = {
    ...structuredClone(initialState.applicant),
    id: user.id,
    name: fullName || user.email || "Calon Mahasiswa",
    email: user.email || "",
    phone: "",
    birthPlace: "",
    birthDate: "",
    address: "",
    school: "",
    registrationNumber,
    studyChoice: state.programs[0]?.name || "",
    secondChoice: state.programs[1]?.name || "",
    path: state.routes[0]?.name || "Reguler",
    documents: {},
    verification: "Draft",
    result: "Belum diumumkan"
  };
  const profileResult = await upsertProfileToSupabase(state.applicant, "applicant", user.id);
  if (profileResult?.error || !profileResult?.data) {
    throw new Error("Akun masuk, tetapi profil pendaftaran gagal disimpan. Hubungi panitia.");
  }
  state.applicants.push({
    number: registrationNumber,
    name: state.applicant.name,
    study: state.applicant.studyChoice,
    path: state.applicant.path,
    status: state.applicant.verification,
    result: state.applicant.result,
    documents: {}
  });
}

function loginModal(register = false, defaultRole = state.role || "applicant", requiredAuth = false) {
  syncUrlForRole(defaultRole);
  const fields = `${register ? '<div class="form-field"><label>Nama lengkap</label><input name="name" required placeholder="Nama sesuai identitas"></div>' : ""}<div class="form-field"><label>Alamat email</label><input name="email" type="email" required placeholder="nama@email.com"></div>${passwordInputMarkup("loginPassword", "Kata sandi", register ? "new-password" : "current-password", register)}${register ? "" : `<input type="hidden" name="role" value="${escapeHTML(defaultRole)}"><div class="forgot-password-row"><button type="button" class="forgot-password-link" data-action="forgotPassword">Lupa kata sandi?</button></div>`}`;
  const accountSwitch = defaultRole === "admin" ? "" : `<p class="account-switch">${register ? "Sudah punya akun?" : "Belum punya akun?"} <button type="button" class="forgot-password-link" data-action="${register ? "switchToLogin" : "switchToRegister"}">${register ? "Masuk" : "Daftar sekarang"}</button></p>`;

  openModal(
    register ? "Buat akun PMB" : "Selamat datang kembali",
    register ? "Daftar dan mulai langkah pertamamu bersama Cakrawala." : "Masuk untuk melanjutkan proses pendaftaran.",
    fields,
    register ? "Buat akun & lanjutkan →" : "Masuk ke portal →",
    async (data) => {
      if (!supabaseClient) throw new Error("Supabase belum dikonfigurasi. Admin perlu mengatur NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      let user;
      let profile = null;
      if (register) {
        const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
          email: data.email,
          password: data.loginPassword,
          options: { data: { full_name: data.name || "", role: "applicant" } }
        });
        if (signUpError) throw signUpError;
        if (!signUpData.user || !signUpData.session) {
          loginModal(false, "applicant", requiredAuth);
          toast("Akun berhasil didaftarkan. Konfirmasi emailmu, lalu masuk dengan akun tersebut.");
          return;
        }
        user = signUpData.user;
        data.role = "applicant";
      } else {
        const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
          email: data.email,
          password: data.loginPassword
        });
        if (signInError) throw signInError;
        user = signInData.user;
        const { data: profileData, error: profileError } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        profile = profileData;
        if (profile && profile.role !== data.role) throw new Error("Akun ini tidak memiliki akses untuk peran tersebut.");
        if (!profile && data.role === "admin") throw new Error("Akun ini belum diberi akses panitia oleh administrator.");
      }

      state.role = data.role;
      syncUrlForRole(state.role);

      if (data.role === "applicant") {
        if (!profile) {
          await createApplicantProfile(user, user.user_metadata?.full_name);
        } else {
          state.applicant = mapRowToApplicant(profile);
        }
      }

      await syncProfilesFromSupabase();
      await syncPortalContentFromSupabase();
      save();
      showPage(data.role === "admin" ? "admin-overview" : "overview");
      toast(register ? `Akun berhasil dibuat. Nomor pendaftaran ${state.applicant.registrationNumber}.` : "Berhasil masuk ke portal PMB.");
    },
    { requiredAuth, accountSwitch }
  );
}

async function handleAction(button) {
  const { action, number, index, name } = button.dataset;
  if (action === "home") {
    syncUrlForHome();
    showPublicPage();
  }
  if (action === "dashboard") {
    const targetPath = state.role === "admin" ? "/admin" : "/login";
    window.history.pushState({ path: targetPath }, "", targetPath);
    showPage(state.role === "admin" ? "admin-overview" : "overview");
  }
  if (action === "logout") {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    state.role = "applicant";
    save();
    window.history.replaceState({ path: "/login" }, "", "/login");
    await applyRouteFromUrl();
    toast("Anda berhasil keluar.");
  }
  if (action === "login") loginModal(false, state.role || "applicant");
  if (action === "register") loginModal(true, "applicant");
  if (action === "switchToRegister") loginModal(true, "applicant", $("#modalForm")?.dataset.requiredAuth === "true");
  if (action === "switchToLogin") loginModal(false, "applicant", $("#modalForm")?.dataset.requiredAuth === "true");
  if (action === "forgotPassword") {
    const email = $("#modalForm input[name='email']")?.value || "";
    requestPasswordReset(email);
  }
  if (action === "closeModal" && $("#modalForm")?.dataset.requiredAuth !== "true") $("#modalRoot").innerHTML = "";
  if (action === "togglePassword") {
    const input = button.closest(".password-input-wrap").querySelector("input");
    const visible = input.type === "password";
    input.type = visible ? "text" : "password";
    button.setAttribute("aria-pressed", String(visible));
    button.setAttribute("aria-label", visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
  }
  if (action === "viewDocument") {
    const documentTab = window.open("about:blank", "_blank");
    try {
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error("Silakan masuk kembali untuk melihat dokumen.");
      const response = await fetch(`/api/dokumen?key=${encodeURIComponent(button.dataset.key)}`, {
        headers: { Authorization: `Bearer ${sessionData.session.access_token}` }
      });
      const result = await response.json();
      if (!response.ok || !result.url) {
        throw new Error(result.error || "Dokumen tidak dapat dibuka.");
      }
      if (documentTab) {
        documentTab.opener = null;
        documentTab.location.href = result.url;
      } else {
        window.location.href = result.url;
      }
    } catch (error) {
      documentTab?.close();
      throw error;
    }
  }
  if (action === "submitDocuments") {
    const requiredDocuments = ["ijazah", "identitas", "pasfoto", "rapor"];
    const missingDocuments = requiredDocuments.filter((key) => !state.applicant.documents[key]);
    if (missingDocuments.length) return toast(`Lengkapi ${missingDocuments.length} berkas yang masih belum diunggah.`);
    state.applicant.verification = "Diajukan";
    const own = state.applicants.find((a) => a.number === state.applicant.registrationNumber);
    if (own) own.status = state.applicant.verification;
    const result = await updateApplicantFieldsInSupabase(state.applicant.registrationNumber, { verification: state.applicant.verification });
    if (result.error) throw result.error;
    save(); renderDashboard(); toast("Berkas berhasil dikirim untuk verifikasi.");
  }
  if (action === "printProof") window.print();
  if (action === "reviewApplicant" || action === "editApplicant") {
    const applicant = state.applicants.find((item) => item.number === number);
    if (!applicant) return;
    const previousStatus = applicant.status;
    const previousReviewNote = applicant.reviewNote || "";
    const documentList = ["ijazah", "identitas", "pasfoto", "rapor"].map((key) => {
      const objectKey = applicant.documents?.[key];
      const safeLink = typeof objectKey === "string" && objectKey.startsWith(`${applicant.number}/`)
        ? `<button type="button" class="table-action" data-action="viewDocument" data-key="${escapeHTML(objectKey)}">Buka dokumen</button>`
        : escapeHTML(objectKey || "Belum diunggah");
      return `<div class="status-step"><div><strong>${escapeHTML(key)}</strong><small>${safeLink}</small></div></div>`;
    }).join("");
    openModal(action === "reviewApplicant" ? "Tinjau berkas pendaftar" : "Detail pendaftar", `${applicant.number} · ${applicant.name}`, `<div class="form-field"><label>Status pendaftaran</label><select name="status"><option ${applicant.status === "Draft" ? "selected" : ""}>Draft</option><option ${applicant.status === "Diajukan" ? "selected" : ""}>Diajukan</option><option ${applicant.status === "Menunggu verifikasi" ? "selected" : ""}>Menunggu verifikasi</option><option ${applicant.status === "Terverifikasi" ? "selected" : ""}>Terverifikasi</option><option ${applicant.status === "Perlu perbaikan" ? "selected" : ""}>Perlu perbaikan</option></select></div><div class="form-field"><label>Program studi</label><input value="${escapeHTML(applicant.study)}" disabled></div><div class="form-field"><label>Berkas persyaratan</label>${documentList}</div><div class="form-field"><label>Catatan revisi untuk pendaftar</label><textarea name="review_note">${escapeHTML(applicant.reviewNote || "")}</textarea></div>`, "Simpan status", async (data) => {
      applicant.status = data.status;
      applicant.reviewNote = data.review_note;
      if (number === state.applicant.registrationNumber) {
        state.applicant.verification = data.status;
        state.applicant.reviewNote = data.review_note;
      }
      const result = await updateApplicantFieldsInSupabase(applicant.number, {
        verification: data.status,
        review_note: data.review_note
      });
      if (result.error) {
        applicant.status = previousStatus;
        applicant.reviewNote = previousReviewNote;
        if (number === state.applicant.registrationNumber) {
          state.applicant.verification = previousStatus;
          state.applicant.reviewNote = previousReviewNote;
        }
        renderDashboard();
        throw result.error;
      }
      save(); renderDashboard(); toast("Status pendaftar berhasil diperbarui.");
    });
  }
  if (action === "addProgram") openModal("Tambah program studi", "Program baru langsung tersedia pada pilihan pendaftar.", `<div class="form-field"><label>Nama program studi</label><input name="name" required></div><div class="form-field"><label>Fakultas</label><input name="faculty" required></div><div class="form-field"><label>Kuota</label><input name="quota" type="number" min="1" required></div>`, "Tambah program", async (data) => {
    state.programs.push({ name: data.name, faculty: data.faculty, quota: Number(data.quota), icon: "◇", description: `Program studi ${data.name}.` });
    save(); await persistPortalContent(); renderPublic(); renderDashboard(); toast("Program studi berhasil ditambahkan.");
  });
  if (action === "deleteProgram") {
    state.programs.splice(Number(index), 1); save(); await persistPortalContent(); renderPublic(); renderDashboard(); toast("Program studi dihapus.");
  }
  if (action === "addSchedule") openModal("Tambah jadwal", "Tambahkan tahapan penerimaan mahasiswa baru.", `<div class="form-field"><label>Tanggal</label><input name="date" required placeholder="Contoh: 01 Sep 2026"></div><div class="form-field"><label>Nama kegiatan</label><input name="title" required></div><div class="form-field"><label>Status</label><select name="status"><option>Dibuka</option><option>Segera</option><option>Selesai</option></select></div>`, "Tambah jadwal", async (data) => {
    state.schedules.push(data); save(); await persistPortalContent(); renderPublic(); renderDashboard(); toast("Jadwal berhasil ditambahkan.");
  });
  if (action === "deleteSchedule") { state.schedules.splice(Number(index), 1); save(); await persistPortalContent(); renderPublic(); renderDashboard(); toast("Jadwal dihapus."); }
  if (action === "addAnnouncement") openModal("Buat pengumuman", "Pengumuman akan tampil pada halaman utama.", `<div class="form-field"><label>Tanggal</label><input name="date" required placeholder="04 NOV 2026"></div><div class="form-field"><label>Judul</label><input name="title" required></div><div class="form-field"><label>Isi pengumuman</label><textarea name="body" required></textarea></div>`, "Terbitkan pengumuman", async (data) => {
    state.announcements.unshift(data); save(); await persistPortalContent(); renderPublic(); renderDashboard(); toast("Pengumuman berhasil diterbitkan.");
  });
  if (action === "deleteAnnouncement") { state.announcements.splice(Number(index), 1); save(); await persistPortalContent(); renderPublic(); renderDashboard(); toast("Pengumuman dihapus."); }
  if (action === "exportApplicants") {
    const rows = [["Nomor Pendaftaran", "Nama", "Program Studi", "Jalur", "Status"], ...state.applicants.map((a) => [a.number, a.name, a.study, a.path, a.status])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "data-pendaftar-pmb.csv"; link.click(); URL.revokeObjectURL(link.href);
  }
  if (action === "editRoute") {
    const route = state.routes.find((item) => item.name === name);
    if (!route) return;
    openModal(`Jalur ${name}`, "Informasi jalur pendaftaran.", `<div class="form-field"><label>Deskripsi jalur</label><textarea name="description" required>${escapeHTML(route.description)}</textarea></div><div class="form-field"><label>Status</label><select name="status"><option ${route.status === "Aktif" ? "selected" : ""}>Aktif</option><option ${route.status === "Segera" ? "selected" : ""}>Segera</option><option ${route.status === "Ditutup" ? "selected" : ""}>Ditutup</option></select></div>`, "Simpan perubahan", async (data) => {
      route.description = data.description;
      route.status = data.status;
      save(); await persistPortalContent(); renderPublic(); renderDashboard(); toast(`Informasi jalur ${name} diperbarui.`);
    });
  }
}

document.addEventListener("click", (event) => {
  const pageControl = event.target.closest("[data-page]");
  const actionControl = event.target.closest("[data-action]");
  if (pageControl) {
    event.preventDefault();
    const page = pageControl.dataset.page;
    if (page === "home") {
      syncUrlForHome();
    return showPublicPage();
    }
      if (page === "overview" || page === "biodata" || page === "choices" || page === "documents" || page === "verification" || page === "result" || page === "proof" || (state.role === "admin" && (page === "admin-overview" || page === "applicants" || page.endsWith("-admin")))) return showPage(page);
  }
  if (actionControl) {
    handleAction(actionControl).catch((error) => {
      toast(error.message || "Aksi gagal diproses. Silakan coba lagi.");
    });
  }
  if (event.target.classList.contains("modal-backdrop") && $("#modalForm")?.dataset.requiredAuth !== "true") $("#modalRoot").innerHTML = "";
});

document.addEventListener("change", async (event) => {
  if (event.target.matches("[data-document]")) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast("Ukuran file maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    const docType = event.target.dataset.document;
    const regNumber = state.applicant.registrationNumber || "pendaftar";
    toast(`Mengunggah ${file.name} ke R2...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", docType);
      formData.append("registration_number", regNumber);

      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error("Silakan masuk kembali sebelum mengunggah berkas.");

      const response = await fetch("/api/upload-dokumen", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
        body: formData
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Gagal mengunggah dokumen.");
      }

      const previousDocument = state.applicant.documents[docType];
      state.applicant.documents[docType] = result.key;
      const updateResult = await updateApplicantFieldsInSupabase(regNumber, { documents: state.applicant.documents });
      if (updateResult.error) {
        if (previousDocument) state.applicant.documents[docType] = previousDocument;
        else delete state.applicant.documents[docType];
        throw new Error("Berkas terunggah ke penyimpanan, tetapi gagal ditautkan ke pendaftaran.");
      }
      save();
      renderDashboard();
      toast(`${file.name} berhasil diunggah ke R2.`);
    } catch (err) {
      event.target.value = "";
      toast(err.message || "Terjadi kesalahan saat mengunggah dokumen.");
    }
  }
  if (event.target.matches(".result-select")) {
    const applicant = state.applicants.find((a) => a.number === event.target.dataset.number);
    if (applicant) {
      const result = await updateApplicantFieldsInSupabase(applicant.number, { result: event.target.value });
      if (result.error) {
        toast("Hasil seleksi gagal disimpan ke Supabase.");
        renderDashboard();
        return;
      }
      applicant.result = event.target.value;
      if (applicant.number === state.applicant.registrationNumber) state.applicant.result = event.target.value;
      save(); renderDashboard(); toast("Hasil seleksi berhasil diperbarui.");
    }
  }
  if (event.target.id === "statusFilter" || event.target.id === "verificationFilter") filterApplicants();
  if (event.target.matches('input[name="studyChoice"],input[name="path"]')) event.target.closest(".choice-card").parentElement.querySelectorAll(".choice-card").forEach((card) => card.classList.toggle("selected", card.contains(event.target)));
});

document.addEventListener("submit", async (event) => {
  if (event.target.id === "biodataForm") {
    event.preventDefault();
    Object.assign(state.applicant, Object.fromEntries(new FormData(event.target).entries()));
    const ownApplicant = state.applicants.find((a) => a.number === state.applicant.registrationNumber);
    if (ownApplicant) ownApplicant.name = state.applicant.name;

    const dbResult = await upsertProfileToSupabase(state.applicant, "applicant");
    if (dbResult?.error || !dbResult?.data) {
      toast("Biodata gagal disimpan ke Supabase. Periksa koneksi dan coba lagi.");
      return;
    }
    save();
    renderDashboard();
    toast("Biodata & data pribadi tersimpan ke Supabase.");
  }
  if (event.target.id === "choicesForm") {
    event.preventDefault();
    const data = new FormData(event.target);
    state.applicant.studyChoice = data.get("studyChoice") || state.applicant.studyChoice;
    state.applicant.secondChoice = data.get("secondChoice");
    state.applicant.path = data.get("path") || state.applicant.path;
    const own = state.applicants.find((a) => a.number === state.applicant.registrationNumber);
    if (own) { own.study = state.applicant.studyChoice; own.path = state.applicant.path; }

    const result = await updateApplicantFieldsInSupabase(state.applicant.registrationNumber, {
      study_choice: state.applicant.studyChoice,
      second_choice: state.applicant.secondChoice,
      path: state.applicant.path
    });
    if (result.error) {
      toast("Pilihan program studi gagal disimpan ke Supabase.");
      return;
    }
    save(); renderDashboard(); toast("Pilihan program studi berhasil disimpan.");
  }
});

document.addEventListener("input", (event) => { if (event.target.id === "applicantSearch") filterApplicants(); });
function filterApplicants() {
  if (!["applicants", "verification-admin"].includes(state.activePage)) return;
  const query = ($("#applicantSearch")?.value || "").toLowerCase();
  const status = ($("#statusFilter")?.value || $("#verificationFilter")?.value || "");
  const rows = state.applicants.filter((a) => `${a.name} ${a.number}`.toLowerCase().includes(query) && (!status || a.status === status));
  $("#applicantTable") && ($("#applicantTable").innerHTML = renderApplicantTable(rows, true));
  if (state.activePage === "verification-admin") $("#applicantTable").innerHTML = renderApplicantTable(rows, true, true);
}

async function applyRouteFromUrl() {
  const cleanPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const publicSectionId = publicPageSections[cleanPath] || null;
  $("#modalRoot").innerHTML = "";
  let session = null;
  if (supabaseClient) {
    const { data: sessionData, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    session = sessionData.session;
  }
  setAuthenticatedNavigation(Boolean(session));

  if (session) {
    try {
      await syncProfilesFromSupabase();
      await syncPortalContentFromSupabase();
      renderPublic();
      if (publicSectionId) {
        showPublicPage(publicSectionId);
        return;
      }
      const page = state.role === "admin" ? "admin-overview" : "overview";
      showPage(page);
      return;
    } catch (error) {
      console.error("Gagal memuat data akun yang sedang masuk.", error);
      toast("Sesi aktif, tetapi data akun gagal dimuat. Coba muat ulang halaman.");
      return;
    }
  }

  const isRecoveryRoute = cleanPath === "/login" && new URLSearchParams(window.location.search).get("mode") === "recovery";
  if (cleanPath !== "/login" && cleanPath !== "/admin" && !isRecoveryRoute) {
    window.history.replaceState({ path: "/login" }, "", "/login");
    return applyRouteFromUrl();
  }

  renderPublic();
  showPublicPage();
  if (cleanPath === "/admin") {
    loginModal(false, "admin", true);
  } else if (isRecoveryRoute) {
    const { data: sessionData, error } = await supabaseClient.auth.getSession();
    if (error) {
      toast("Tautan reset tidak dapat diverifikasi. Minta tautan reset baru.");
    } else if (sessionData.session) {
      showPasswordRecoveryForm();
    } else {
      toast("Tautan reset sudah kedaluwarsa atau tidak valid. Minta tautan reset baru.");
      loginModal(false, "applicant", true);
    }
  } else {
    loginModal(false, "applicant", true);
  }
}

if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    setAuthenticatedNavigation(Boolean(session));
    if (event === "PASSWORD_RECOVERY") showPasswordRecoveryForm();
  });
}

window.addEventListener("popstate", () => {
  applyRouteFromUrl().catch((error) => {
    console.error("Gagal membuka halaman yang diminta.", error);
    toast("Halaman gagal dimuat. Coba muat ulang.");
  });
});
$("#mobileMenu").addEventListener("click", () => $("#mainNav").classList.toggle("open"));
document.addEventListener("click", (event) => {
  const link = event.target.closest("#mainNav a");
  if (!link) return;
  $("#mainNav").classList.remove("open");

  if (link.dataset.action === "dashboard") {
    event.preventDefault();
    return;
  }

  const url = new URL(link.href, window.location.href);
  const sectionId = publicPageSections[url.pathname.replace(/\/+$/, "")];
  if (url.origin !== window.location.origin || !sectionId) return;

  event.preventDefault();
  if (url.pathname !== window.location.pathname) {
    window.history.pushState({ path: url.pathname }, "", url.pathname);
  }
  showPublicPage(sectionId);
});
applyRouteFromUrl().catch((error) => {
  console.error("Portal PMB gagal memuat halaman.", error);
  toast("Halaman gagal dimuat. Coba muat ulang.");
});