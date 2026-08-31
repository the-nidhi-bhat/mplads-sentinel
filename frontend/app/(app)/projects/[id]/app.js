/* 
   MPLADS AI Monitor Platform - Core Logic
   Features: Dynamic routing, mock data engine, Leaflet GIS Map, ApexCharts, investigation state
*/

// Projects data - loaded from API
let projectsData = [];

// ==================== API CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINT = API_BASE_URL + '/api/projects';

// ==================== LOADING STATE MANAGEMENT ====================
function showLoadingState() {
  ['priority-queue-tbody', 'pq-dedicated-tbody', 'projdir-tbody'].forEach(function(id) {
    var t = document.getElementById(id);
    if (t) t.innerHTML = "<tr><td colspan=\"10\" class=\"loading-cell\"><div class=\"loading-spinner\"></div><span>Loading project data...</span></td></tr>";
  });
  var cg = document.querySelector('.charts-grid');
  if (cg) {
    var ov = cg.querySelector('.charts-loading-overlay');
    if (!ov) {
      ov = document.createElement("div");
      ov.className = "charts-loading-overlay";
      cg.style.position = "relative";
      cg.appendChild(ov);
    }
    ov.innerHTML = '<div class="loading-spinner"></div><span>Loading analytics...</span>';
    ov.style.display = 'flex';
  }
  document.querySelectorAll('.kpi-value').forEach(function(el) {
    el.setAttribute('data-original', el.textContent);
    el.textContent = '...';
    el.style.opacity = '0.5';
  });
}

function hideLoadingState() {
  document.querySelectorAll('.charts-loading-overlay').forEach(function(el) { el.remove(); });
  document.querySelectorAll('.map-loading-overlay').forEach(function(el) { el.remove(); });
  document.querySelectorAll('.kpi-value').forEach(function(el) {
    var orig = el.getAttribute('data-original');
    if (orig) { el.textContent = orig; }
    el.style.opacity = '1';
  });
}

function showErrorState(message) {
  hideLoadingState();
  ['priority-queue-tbody', 'pq-dedicated-tbody', 'projdir-tbody'].forEach(function(id) {
    var t = document.getElementById(id);
    if (t) t.innerHTML = "<tr><td colspan=\"10\" class=\"error-cell\"><div class=\"error-icon\">&#9888;</div><span>" + message + "</span></td></tr>";
  });
  showToast(message, "error");
}

// ==================== TOAST NOTIFICATION SYSTEM ====================
function showToast(message, type, duration) {
  type = type || "info";
  duration = duration || 5000;
  var container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  var toast = document.createElement("div");
  toast.className = "toast toast-" + type;
  var iconMap = { success: "&#10003;", error: "&#10007;", warning: "&#9888;", info: "&#8505;" };
  var html = '<span class="toast-icon">' + (iconMap[type] || iconMap.info) + '</span>';
  html += '<span class="toast-message">' + message + '</span>';
  html += '<button class="toast-close">&#215;</button>';
  toast.innerHTML = html;
  toast.querySelector('.toast-close').addEventListener('click', function() { toast.remove(); });
  container.appendChild(toast);
  requestAnimationFrame(function() { toast.classList.add("toast-visible"); });
  setTimeout(function() {
    toast.classList.remove("toast-visible");
    toast.classList.add("toast-hiding");
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}

// ==================== API DATA FETCHING ====================
async function fetchProjectsData() {
  showLoadingState();
  try {
    var response = await fetch(API_ENDPOINT, {
      method: "GET",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) {
      var errorText = await response.text().catch(function() { return "Unknown error"; });
      throw new Error("API returned " + response.status + ": " + errorText);
    }
    var data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Expected array from API, got " + typeof data);
    }
    if (data.length === 0) { showToast("API returned no projects.", "warning"); }
    projectsData = data.map(normalizeProjectData);
    if (projectsData.length > 0) { selectedProject = projectsData[0]; }
    hideLoadingState();
    showToast("Loaded " + projectsData.length + " projects from API.", "success", 3000);
    return projectsData;
  } catch (err) {
    console.error("Failed to fetch project data:", err);
    if (err.name === "TimeoutError") {
      showErrorState("Request timed out. The API server may be down.");
    } else if (err.message.indexOf("Failed to fetch") !== -1 || err.message.indexOf("NetworkError") !== -1) {
      showErrorState("Cannot connect to API at " + API_BASE_URL + ". Make sure the backend server is running.");
    } else if (err.message.indexOf("API returned") !== -1) {
      showErrorState(err.message);
    } else {
      showErrorState("Unexpected error: " + err.message);
    }
    return [];
  }
}

// Normalize API response to match expected UI data structure
function normalizeProjectData(raw) {
  return {
    id: raw.id || raw.project_id || 'N/A',
    title: raw.title || raw.project_name || 'Untitled Project',
    district: raw.district || raw.district_name || 'Unknown',
    state: raw.state || raw.state_name || 'Unknown',
    riskLevel: raw.riskLevel || raw.risk_level || 'low',
    riskScore: raw.riskScore || raw.risk_score || 0,
    confidence: raw.confidence || 0,
    primaryFinding: raw.primaryFinding || raw.primary_finding || 'No findings',
    exposure: raw.exposure || '₹0.0L',
    assignedTo: raw.assignedTo || raw.assigned_to || 'Unassigned',
    agency: raw.agency || raw.agency_name || 'Unknown Agency',
    workType: raw.workType || raw.work_type || 'Other',
    sanctionedAmount: raw.sanctionedAmount || raw.sanctioned_amount || '₹0.00 Lakh',
    expenditure: raw.expenditure || '₹0.00 Lakh',
    expenditurePercent: raw.expenditurePercent || raw.expenditure_percent || 0,
    sanctionDate: raw.sanctionDate || raw.sanction_date || 'N/A',
    expectedCompletion: raw.expectedCompletion || raw.expected_completion || 'N/A',
    actualStatus: raw.actualStatus || raw.actual_status || 'Unknown',
    physicalProgress: raw.physicalProgress || raw.physical_progress || 0,
    financialProgress: raw.financialProgress || raw.financial_progress || 0,
    coordinates: raw.coordinates || [0, 0],
    evidence: Array.isArray(raw.evidence) ? raw.evidence.map(function(ev) {
      return {
        factor: ev.factor || 'Unknown',
        icon: ev.icon || 'alert-triangle',
        observed: ev.observed || 'N/A',
        benchmark: ev.benchmark || 'N/A',
        deviation: ev.deviation || 'N/A',
        points: ev.points || '+0 Points',
        riskClass: ev.riskClass || ev.risk_class || 'low',
        devClass: ev.devClass || ev.dev_class || 'good'
      };
    }) : [],
    investigation: raw.investigation ? {
      caseId: raw.investigation.caseId || raw.investigation.case_id || 'N/A',
      currentStep: raw.investigation.currentStep || raw.investigation.current_step || 1,
      stepDates: raw.investigation.stepDates || raw.investigation.step_dates || ['Pending','Pending','Pending','Pending','Pending'],
      notes: raw.investigation.notes || ''
    } : null
  };
}


// ==================== STATE MANAGEMENT ====================
let currentActiveView = "dashboard";
let selectedProject = null; // Set after API data loads
let leafletMapInstance = null;
let mapMarkersGroup = null;
let mapClusterGroup = null;
let mapHeatLayer = null;
let mapBoundariesLayer = null;
let activeBasemap = 'dark';
let basemapLayers = {};
let activeFilters = {
  state: "Karnataka",
  district: "All",
  type: "All",
  risk: "All"
};

// Chart Instances
let riskDistChart = null;
let riskDriversChart = null;

// ==================== ROUTING SYSTEM ====================
function switchView(viewName) {
  // Hide all views
  document.querySelectorAll(".view-container").forEach(el => {
    el.classList.add("hidden");
  });

  // Show target view
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.remove("hidden");
  }

  // Update sidebar active state
  document.querySelectorAll(".sidebar-menu .menu-item").forEach(el => {
    el.classList.remove("active");
    if (el.getAttribute("data-view") === viewName) {
      el.classList.add("active");
    }
  });

  // Specific Project details tab handling
  if (viewName === "project-details") {
    document.getElementById("nav-item-projects").classList.add("active");
  } else if (viewName === "investigation") {
    document.getElementById("nav-item-investigations").classList.add("active");
  }

  currentActiveView = viewName;

  // Update Header Title Text
  const titleMap = {
    "dashboard": "MPLADS SENTINEL",
    "priority-queue": "PRIORITY QUEUE",
    "projects": "PROJECT WORKSPACE",
    "project-details": "PROJECT DETAILS WORKSPACE",
    "map": "GIS RISK MAP WORKSPACE",
    "investigation": "INVESTIGATIONS WORKSPACE",
    "data-ingestion": "DATA INGESTION MODULE",
    "audit-logs": "SYSTEM AUDIT LOGS"
  };
  document.getElementById("header-view-title").textContent = titleMap[viewName] || "MPLADS SENTINEL";

  // Re-draw or resize maps and charts since hidden container might have messed up calculations
  if (viewName === "dashboard") {
    renderCharts();
  } else if (viewName === "map") {
    setTimeout(initOrRefreshMap, 200);
  }
}

// ==================== SIDEBAR BEHAVIOR ====================
function initSidebar() {
  const sidebar = document.getElementById("app-sidebar");
  const toggleBtn = document.getElementById("btn-sidebar-toggle");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    // Change chevron icon
    const icon = toggleBtn.querySelector("i");
    if (sidebar.classList.contains("collapsed")) {
      icon.setAttribute("data-lucide", "chevron-right");
    } else {
      icon.setAttribute("data-lucide", "chevron-left");
    }
    lucide.createIcons();

    // Resize map and charts if sidebar changes size
    if (currentActiveView === "map" && leafletMapInstance) {
      setTimeout(() => leafletMapInstance.invalidateSize(), 300);
    }
  });

  // Sidebar navigation click handlers
  document.querySelectorAll(".sidebar-menu .menu-item[data-view]").forEach(item => {
    item.addEventListener("click", () => {
      const view = item.getAttribute("data-view");
      switchView(view);
    });
  });

  // Exit App
  document.getElementById("btn-sidebar-exit").addEventListener("click", () => {
    document.getElementById("app-workspace").classList.add("hidden");
    document.getElementById("landing-page").classList.remove("hidden");
  });
}

// ==================== LANDING PAGE HANDLERS ====================
function initLandingPage() {
  const launchLogin = () => {
    document.getElementById("landing-page").classList.add("hidden");
    document.getElementById("view-login").classList.remove("hidden");
  };

  document.getElementById("btn-nav-launch").addEventListener("click", launchLogin);
  document.getElementById("btn-hero-launch").addEventListener("click", launchLogin);

  // Login flow
  const loginSubmit = document.getElementById("btn-login-submit");
  if (loginSubmit) {
    loginSubmit.addEventListener("click", () => {
      document.getElementById("view-login").classList.add("hidden");
      document.getElementById("app-workspace").classList.remove("hidden");
      switchView("dashboard");
    });
  }

  // Theme Toggle (landing page & dashboard)
  const toggleTheme = () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', 'dark');
    }
  };

  const btnThemeLanding = document.getElementById("btn-theme-toggle-landing");
  if (btnThemeLanding) btnThemeLanding.addEventListener("click", toggleTheme);

  const btnThemeApp = document.getElementById("btn-theme-toggle");
  if (btnThemeApp) btnThemeApp.addEventListener("click", toggleTheme);

  // Language Selector mock
  const langSelect = document.getElementById("lang-select");
  if (langSelect) {
    langSelect.addEventListener("change", (e) => {
      console.log(`Language changed to ${e.target.value}`);
      // A full implementation would load translation files and apply them here
    });
  }
}

// ==================== APEX CHARTS RENDERING ====================
function renderCharts() {
  // Destroy existing charts to prevent duplication
  if (riskDistChart) riskDistChart.destroy();
  if (riskDriversChart) riskDriversChart.destroy();

  // Calculate filtered counts for Risk Distribution
  const filteredProjects = getFilteredProjects();
  let lowCount = 0, medCount = 0, highCount = 0, critCount = 0;

  filteredProjects.forEach(p => {
    if (p.riskLevel === "low") lowCount++;
    else if (p.riskLevel === "medium") medCount++;
    else if (p.riskLevel === "high") highCount++;
    else if (p.riskLevel === "critical") critCount++;
  });

  // 1. Risk Distribution Bar Chart
  const distOptions = {
    series: [{
      name: 'Projects Count',
      data: [lowCount, medCount, highCount, critCount]
    }],
    chart: {
      type: 'bar',
      height: 260,
      background: 'transparent',
      toolbar: { show: false },
      foreColor: '#94a3b8'
    },
    colors: ['#10b981', '#eab308', '#f97316', '#ef4444'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
        distributed: true,
      }
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: ['Low', 'Medium', 'High', 'Critical'],
      labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { colors: '#94a3b8' } }
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val) => `${val} Projects` }
    }
  };

  riskDistChart = new ApexCharts(document.querySelector("#chart-risk-dist"), distOptions);
  riskDistChart.render();

  // 2. Top AI Risk Drivers Donut Chart
  // Based on the percentages: Cost Anomaly 34%, Payment Pattern 26%, Project Delay 19%, Duplicate Work 12%, Fund Util 9%
  const driversOptions = {
    series: [34, 26, 19, 12, 9],
    chart: {
      type: 'donut',
      height: 260,
      background: 'transparent',
      foreColor: '#94a3b8'
    },
    labels: ['Cost Anomaly', 'Payment Pattern', 'Project Delay', 'Duplicate Work', 'Fund Utilization Deviation'],
    colors: ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6'],
    stroke: { colors: ['#0f172a'], width: 2 },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: true, fontSize: '12px', fontWeight: 600, color: '#94a3b8' },
            value: { show: true, fontSize: '20px', fontWeight: 800, color: '#fff', formatter: (val) => `${val}%` },
            total: {
              show: true,
              label: 'Risk Weight',
              color: '#94a3b8',
              fontSize: '11px',
              formatter: () => '100%'
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '11px',
      labels: { colors: '#94a3b8' },
      markers: { width: 8, height: 8, radius: 4 }
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val) => `${val}% influence` }
    }
  };

  riskDriversChart = new ApexCharts(document.querySelector("#chart-risk-drivers"), driversOptions);
  riskDriversChart.render();
}

// ==================== FILTERING & TABLE POPULATING ====================
function getFilteredProjects() {
  return projectsData.filter(p => {
    // State Filter
    if (activeFilters.state !== "All" && p.state !== activeFilters.state) return false;

    // District Filter
    if (activeFilters.district !== "All" && p.district !== activeFilters.district) return false;

    // Work Type Filter
    if (activeFilters.type !== "All" && p.workType !== activeFilters.type) return false;

    // Risk Filter
    if (activeFilters.risk !== "All" && p.riskLevel.toLowerCase() !== activeFilters.risk.toLowerCase()) return false;

    return true;
  });
}

function fillTableBody(tbody, list) {
  tbody.innerHTML = "";
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No high-risk anomaly records match selected filter criteria.</td></tr>`;
    return;
  }

  list.forEach((proj) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="project-id-cell">${proj.id}</td>
      <td class="project-name-cell" title="${proj.title}">${proj.title}</td>
      <td>${proj.district}</td>
      <td><span class="risk-badge ${proj.riskLevel}">${proj.riskLevel}</span></td>
      <td style="color: var(--text-secondary); font-weight: 500;">${proj.primaryFinding}</td>
      <td style="color: var(--text-secondary);">${proj.assignedTo}</td>
      <td><button class="btn-table-action" data-id="${proj.id}">Review</button></td>
    `;

    // Click handler for Review button
    tr.querySelector(".btn-table-action").addEventListener("click", () => {
      loadProjectDetails(proj.id);
    });

    tbody.appendChild(tr);
  });
}

function populatePriorityQueueTable() {
  const list = getFilteredProjects();

  // Populate dashboard table
  const dashTbody = document.getElementById("priority-queue-tbody");
  if (dashTbody) fillTableBody(dashTbody, list);

  // Populate dedicated Priority Queue view table
  const dedicatedTbody = document.getElementById("pq-dedicated-tbody");
  if (dedicatedTbody) fillTableBody(dedicatedTbody, list);

  // Update dedicated view project count
  const countEl = document.getElementById("pq-dedicated-count");
  if (countEl) countEl.textContent = `${list.length} Projects`;
}

function initFilters() {
  const stateSel = document.getElementById("filter-state");
  const distSel = document.getElementById("filter-district");
  const typeSel = document.getElementById("filter-type");
  const riskSel = document.getElementById("filter-risk");
  const resetBtn = document.getElementById("btn-filter-reset");

  const triggerUpdate = () => {
    activeFilters.state = stateSel.value;
    activeFilters.district = distSel.value;
    activeFilters.type = typeSel.value;
    activeFilters.risk = riskSel.value;

    populatePriorityQueueTable();
    renderCharts();
  };

  stateSel.addEventListener("change", triggerUpdate);
  distSel.addEventListener("change", triggerUpdate);
  typeSel.addEventListener("change", triggerUpdate);
  riskSel.addEventListener("change", triggerUpdate);

  resetBtn.addEventListener("click", () => {
    stateSel.value = "Karnataka";
    distSel.value = "All";
    typeSel.value = "All";
    riskSel.value = "All";
    triggerUpdate();
  });
}

// Dedicated Priority Queue view filters
function initPQFilters() {
  const stateSel = document.getElementById("pq-filter-state");
  const distSel = document.getElementById("pq-filter-district");
  const typeSel = document.getElementById("pq-filter-type");
  const riskSel = document.getElementById("pq-filter-risk");
  const resetBtn = document.getElementById("pq-btn-filter-reset");
  if (!stateSel) return; // view not yet in DOM

  const triggerUpdate = () => {
    activeFilters.state = stateSel.value;
    activeFilters.district = distSel.value;
    activeFilters.type = typeSel.value;
    activeFilters.risk = riskSel.value;

    populatePriorityQueueTable();
  };

  stateSel.addEventListener("change", triggerUpdate);
  distSel.addEventListener("change", triggerUpdate);
  typeSel.addEventListener("change", triggerUpdate);
  riskSel.addEventListener("change", triggerUpdate);

  resetBtn.addEventListener("click", () => {
    stateSel.value = "Karnataka";
    distSel.value = "All";
    typeSel.value = "All";
    riskSel.value = "All";
    triggerUpdate();
  });
}

// ==================== PROJECT DETAILS VIEW ====================
function loadProjectDetails(projectId) {
  const proj = projectsData.find(p => p.id === projectId);
  if (!proj) return;

  selectedProject = proj;

  // Fill text details
  document.getElementById("detail-proj-id").textContent = proj.id;
  document.getElementById("detail-risk-badge").textContent = proj.riskLevel;
  // Set proper badge colors
  const badge = document.getElementById("detail-risk-badge");
  badge.className = `risk-badge ${proj.riskLevel}`;

  document.getElementById("detail-proj-title").textContent = proj.title;
  document.getElementById("detail-proj-loc").innerHTML = `<i data-lucide="map-pin" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>${proj.district}, ${proj.state}`;

  document.getElementById("detail-loc-val").textContent = `${proj.district}, ${proj.state}`;
  document.getElementById("detail-agency-val").textContent = proj.agency;
  document.getElementById("detail-type-val").textContent = proj.workType;
  document.getElementById("detail-sanctioned-val").textContent = proj.sanctionedAmount;
  document.getElementById("detail-expenditure-val").textContent = `${proj.expenditure} (${proj.expenditurePercent}%)`;
  document.getElementById("detail-date-val").textContent = proj.sanctionDate;
  document.getElementById("detail-completion-val").textContent = proj.expectedCompletion;

  const statusVal = document.getElementById("detail-status-val");
  statusVal.textContent = proj.actualStatus;
  if (proj.riskLevel === "critical" || proj.riskLevel === "high") {
    statusVal.style.color = "var(--color-critical)";
  } else if (proj.riskLevel === "medium") {
    statusVal.style.color = "var(--color-high)";
  } else {
    statusVal.style.color = "var(--color-low)";
  }

  document.getElementById("detail-phys-progress-val").textContent = `${proj.physicalProgress}%`;
  document.getElementById("detail-phys-progress-bar").style.width = `${proj.physicalProgress}%`;
  document.getElementById("detail-fin-progress-val").textContent = `${proj.financialProgress}%`;

  const finBar = document.getElementById("detail-fin-progress-bar");
  finBar.style.width = `${proj.financialProgress}%`;
  if (proj.financialProgress > proj.physicalProgress + 20) {
    finBar.style.backgroundColor = "var(--color-critical)";
  } else {
    finBar.style.backgroundColor = "var(--primary-blue)";
  }

  // Score display removed

  // Evidence grid populating
  const evidenceGrid = document.getElementById("detail-evidence-container");
  evidenceGrid.innerHTML = "";

  if (!proj.evidence || proj.evidence.length === 0) {
    evidenceGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">No active anomalies flagged for this project. Status is normal.</div>`;
  } else {
    proj.evidence.forEach(ev => {
      const card = document.createElement("div");
      card.className = "evidence-card";
      card.innerHTML = `
        <div class="evidence-card-header">
          <span class="evidence-factor">
            <i data-lucide="${ev.icon}"></i>
            ${ev.factor}
          </span>
          <span class="evidence-points ${ev.riskClass}">${ev.points}</span>
        </div>
        <div class="evidence-details">
          <div class="evidence-data-row">
            <span class="evidence-data-label">Observed Value</span>
            <span class="evidence-data-val">${ev.observed}</span>
          </div>
          <div class="evidence-data-row">
            <span class="evidence-data-label">Peer Benchmark</span>
            <span class="evidence-data-val">${ev.benchmark}</span>
          </div>
          <div class="evidence-deviation ${ev.devClass}">
            <span>Deviation</span>
            <span>${ev.deviation}</span>
          </div>
        </div>
      `;
      evidenceGrid.appendChild(card);
    });
  }

  // Handle Investigate case routing
  const investigateBtn = document.getElementById("btn-detail-investigate");
  if (proj.investigation) {
    investigateBtn.classList.remove("hidden");
  } else {
    investigateBtn.classList.add("hidden");
  }

  // Reload icons
  lucide.createIcons();

  // Slide view
  switchView("project-details");
}

document.getElementById("btn-detail-investigate").addEventListener("click", () => {
  if (selectedProject && selectedProject.investigation) {
    loadInvestigationCase(selectedProject.id);
  }
});

document.getElementById("btn-detail-show-map").addEventListener("click", () => {
  if (selectedProject) {
    showProjectOnMap(selectedProject.id);
  }
});

// ==================== PROJECTS DIRECTORY VIEW ====================

// Projects directory state: search + sort
let projdirSearchText = '';
let projdirSortKey = '';
let projdirSortDir = 'asc';

function getProjdirSortedList() {
  // Always use ALL projects — no global filter dependency
  let list = [...projectsData];

  // Apply search filter (by name, ID, or district)
  if (projdirSearchText) {
    const q = projdirSearchText.toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q)
    );
  }

  // Apply sort
  if (projdirSortKey) {
    list.sort((a, b) => {
      let va = a[projdirSortKey];
      let vb = b[projdirSortKey];
      if (typeof va === 'string' && va.startsWith('₹')) {
        va = parseFloat(va.replace(/[₹,]/g, '')) || 0;
        vb = parseFloat(String(vb).replace(/[₹,]/g, '')) || 0;
      }
      if (typeof va === 'string') {
        return projdirSortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return projdirSortDir === 'asc' ? va - vb : vb - va;
    });
  }

  return list;
}

function populateProjectsDirectory() {
  const list = getProjdirSortedList();
  const tbody = document.getElementById('projdir-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2rem;">No projects found.</td></tr>';
    const countEl = document.getElementById('projdir-count');
    if (countEl) countEl.textContent = '0 Projects';
    return;
  }

  list.forEach((proj) => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.innerHTML = `
      <td class="project-id-cell" data-label="ID">${proj.id}</td>
      <td class="project-name-cell" title="${proj.title}" data-label="Title">${proj.title}</td>
      <td data-label="District">${proj.district}</td>
      <td style="color: var(--text-secondary); font-weight: 500;" data-label="Work Type">${proj.workType}</td>
      <td data-label="Risk"><span class="risk-badge ${proj.riskLevel}">${proj.riskLevel}</span></td>
      <td style="color: var(--text-secondary);" data-label="Sanctioned">${proj.sanctionedAmount}</td>
      <td style="color: var(--text-secondary);" data-label="Expenditure">${proj.expenditure}</td>
      <td data-label="Progress">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:0.8rem; color:var(--text-secondary); min-width:32px;">${proj.physicalProgress}%</span>
          <div class="mini-progress-bg" style="flex:1; height:6px;">
            <div class="mini-progress-fill" style="width: ${proj.physicalProgress}%;"></div>
          </div>
        </div>
      </td>
      <td style="color: var(--text-secondary); font-weight: 500;" data-label="Status">${proj.actualStatus}</td>
      <td><button class="btn-table-action" data-proj-id="${proj.id}">View Details</button></td>
    `;

    tr.addEventListener('click', (e) => {
      if (e.target.closest('.btn-table-action')) return;
      loadProjectDetails(proj.id);
    });

    tr.querySelector('.btn-table-action').addEventListener('click', () => {
      loadProjectDetails(proj.id);
    });

    tbody.appendChild(tr);
  });

  const countEl = document.getElementById('projdir-count');
  if (countEl) countEl.textContent = `${list.length} Projects`;
}

function initProjectDirectorySearch() {
  const searchInput = document.getElementById('projdir-search');
  if (!searchInput) return;

  // Search with debounce
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      projdirSearchText = searchInput.value.trim();
      populateProjectsDirectory();
    }, 200);
  });

  // Column sort click handlers
  document.querySelectorAll('#projdir-table .sortable-th').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-sort');
      if (!key) return;
      if (projdirSortKey === key) {
        projdirSortDir = projdirSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        projdirSortKey = key;
        projdirSortDir = 'asc';
      }
      document.querySelectorAll('#projdir-table .sortable-th').forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
      th.classList.add(projdirSortDir === 'asc' ? 'sort-asc' : 'sort-desc');
      populateProjectsDirectory();
    });
  });
}


// GIS Map code has been moved to map.js (loaded separately)

// ==================== INVESTIGATION WORKSPACE ====================
function loadInvestigationCase(projectId) {
  const proj = projectsData.find(p => p.id === projectId);
  if (!proj || !proj.investigation) return;

  selectedProject = proj;
  const inv = proj.investigation;

  // Fill textual data
  document.getElementById("inv-case-id").textContent = inv.caseId;
  document.getElementById("inv-proj-id").textContent = proj.id;
  document.getElementById("inv-proj-title").textContent = `${proj.title}, ${proj.district}`;

  // Fill AI Findings List
  const findingsList = document.getElementById("inv-findings-list");
  findingsList.innerHTML = "";

  proj.evidence.forEach(ev => {
    const item = document.createElement("div");
    item.className = "finding-summary-item";
    item.innerHTML = `
      <span class="finding-summary-name">${ev.factor}</span>
      <span class="finding-summary-points ${ev.riskClass}">${ev.points}</span>
    `;
    findingsList.appendChild(item);
  });

  // Risk score removed

  // Fill Notes Area
  document.getElementById("inv-notes-editor").value = inv.notes;
  updateCharCounter();

  // Update Stepper steps
  updateStepperDisplay(inv.currentStep, inv.stepDates);

  switchView("investigation");
}

function updateStepperDisplay(currentStep, stepDates) {
  // Stepper dates bindings
  for (let i = 1; i <= 5; i++) {
    const dateEl = document.getElementById(`step-date-${i}`);
    if (dateEl && stepDates[i - 1]) {
      dateEl.textContent = stepDates[i - 1];
    }
  }

  // Node styles
  document.querySelectorAll(".stepper-wrapper .step-item").forEach(node => {
    const stepNum = parseInt(node.getAttribute("data-step"));
    node.classList.remove("completed", "active");

    if (stepNum < currentStep) {
      node.classList.add("completed");
      // Change node icon to checkmark
      node.querySelector(".step-node").innerHTML = `<i data-lucide="check" style="width: 14px;"></i>`;
    } else if (stepNum === currentStep) {
      node.classList.add("active");
      // Restore standard icons for active
      const iconMap = ["plus", "search", "map-pin", "file-check", "check-circle-2"];
      node.querySelector(".step-node").innerHTML = `<i data-lucide="${iconMap[stepNum - 1]}" style="width: 14px;"></i>`;
    } else {
      // Restore standard icons for pending
      const iconMap = ["plus", "search", "map-pin", "file-check", "check-circle-2"];
      node.querySelector(".step-node").innerHTML = `<i data-lucide="${iconMap[stepNum - 1]}" style="width: 14px;"></i>`;
    }
  });

  // Stepper fill bar percentage: Step 1 (0%), Step 2 (25%), Step 3 (50%), Step 4 (75%), Step 5 (100%)
  const percentage = (currentStep - 1) * 25;
  document.getElementById("inv-stepper-progress").style.width = `${percentage}%`;

  lucide.createIcons();
}

function updateCharCounter() {
  const textarea = document.getElementById("inv-notes-editor");
  const counter = document.getElementById("inv-char-counter");
  const len = textarea.value.length;
  counter.textContent = `${len} / 2000 characters`;
}

// Investigation Button Action Handlers
function initInvestigationControls() {
  const textarea = document.getElementById("inv-notes-editor");
  textarea.addEventListener("input", updateCharCounter);

  const verifyBtn = document.getElementById("btn-act-verify");
  const escalateBtn = document.getElementById("btn-act-escalate");
  const closeBtn = document.getElementById("btn-act-close");

  const todayStr = () => {
    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const addNoteLog = (logMsg) => {
    const timeStamp = todayStr();
    textarea.value += `\n\n-- ${timeStamp}: ${logMsg}`;
    updateCharCounter();
    if (selectedProject && selectedProject.investigation) {
      selectedProject.investigation.notes = textarea.value;
    }
  };

  verifyBtn.addEventListener("click", () => {
    if (!selectedProject || !selectedProject.investigation) return;
    const inv = selectedProject.investigation;

    if (inv.currentStep < 3) {
      inv.currentStep = 3;
      inv.stepDates[2] = todayStr();
      addNoteLog("Status advanced to Field Verification.");
      updateStepperDisplay(3, inv.stepDates);
    }
  });

  escalateBtn.addEventListener("click", () => {
    if (!selectedProject || !selectedProject.investigation) return;
    const inv = selectedProject.investigation;

    if (inv.currentStep < 4) {
      // Ensure preceding steps are marked filled
      if (inv.currentStep < 3) inv.stepDates[2] = todayStr();
      inv.currentStep = 4;
      inv.stepDates[3] = todayStr();
      addNoteLog("Case escalated. Finding Recorded: Potential Unit-Rate Overrun, recommending administrative hold.");
      updateStepperDisplay(4, inv.stepDates);
    }
  });

  closeBtn.addEventListener("click", () => {
    if (!selectedProject || !selectedProject.investigation) return;
    const inv = selectedProject.investigation;

    if (inv.currentStep < 5) {
      // Ensure all preceding steps are marked
      if (inv.currentStep < 3) inv.stepDates[2] = todayStr();
      if (inv.currentStep < 4) inv.stepDates[3] = todayStr();
      inv.currentStep = 5;
      inv.stepDates[4] = todayStr();
      addNoteLog("Investigation closed. Administrative corrective action initiated.");
      updateStepperDisplay(5, inv.stepDates);
    }
  });
}

// ==================== THEME MANAGER ====================
function initTheme() {
  const toggleBtn = document.getElementById("btn-theme-toggle");
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem("mplads-theme") || "light";
  applyTheme(savedTheme);

  toggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    applyTheme(newTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("mplads-theme", theme);

  const toggleIcon = document.querySelector("#btn-theme-toggle i");
  if (toggleIcon) {
    if (theme === "dark") {
      toggleIcon.setAttribute("data-lucide", "moon");
    } else {
      toggleIcon.setAttribute("data-lucide", "sun");
    }
    lucide.createIcons();
  }

  // Switch map basemap to match theme
  if (leafletMapInstance && basemapLayers.current) {
    const targetBasemap = theme === 'dark' ? 'dark' : 'street';
    if (activeBasemap !== targetBasemap) {
      switchBasemap(targetBasemap);
      // Update basemap control buttons
      document.querySelectorAll('.basemap-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.basemap === targetBasemap);
      });
    }
  }

  // Update ApexCharts if they exist
  if (window.riskDistributionChart && typeof window.riskDistributionChart.updateOptions === 'function') {
    window.riskDistributionChart.updateOptions({ theme: { mode: theme } });
  }
  if (window.riskDriversChart && typeof window.riskDriversChart.updateOptions === 'function') {
    window.riskDriversChart.updateOptions({ theme: { mode: theme } });
  }
}

// ==================== APP INITIALIZER ====================
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize Theme
  initTheme();

  // Initialize Landing page triggers
  initLandingPage();

  // Initialize app layout sidebar
  initSidebar();

  // Initialize Global Filter events
  initFilters();

  // Initialize Priority Queue dedicated view filters
  initPQFilters();

  // Initialize Projects Directory
  populateProjectsDirectory();
  initProjectDirectorySearch();

  // Initialize Investigation buttons
  initInvestigationControls();

  // Initialize Lucide Icons vectors
  lucide.createIcons();

  // Fetch project data from API
  await fetchProjectsData();

  // Populate all views with fetched data
  populatePriorityQueueTable();
  populateProjectsDirectory();
  renderCharts();
});
