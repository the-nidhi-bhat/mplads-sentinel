/* 
   MPLADS AI Monitor Platform - Core Logic
   Features: Dynamic routing, mock data engine, Leaflet GIS Map, ApexCharts, investigation state
*/
// app.js
// ==================== MOCK DATA ENGINE ====================
const projectsData = [
  {
    id: "MPL/KA/24081",
    title: "Construction of Community Hall",
    district: "Belagavi",
    state: "Karnataka",
    riskLevel: "critical",
    riskScore: 91,
    confidence: 87,
    primaryFinding: "Cost anomaly (+34.6%)",
    exposure: "₹42.0L",
    assignedTo: "Ravi Kumar",
    agency: "Zilla Panchayat Belagavi",
    workType: "Community Infrastructure",
    sanctionedAmount: "₹82.40 Lakh",
    expenditure: "₹79.80 Lakh",
    expenditurePercent: 96.8,
    sanctionDate: "12 May 2023",
    expectedCompletion: "10 Nov 2023",
    actualStatus: "In Progress (Delay)",
    physicalProgress: 48,
    financialProgress: 96.8,
    coordinates: [15.8497, 74.4977],
    evidence: [
      {
        factor: "Cost Anomaly",
        icon: "dollar-sign",
        observed: "₹82.40 Lakh",
        benchmark: "₹61.20 Lakh",
        deviation: "+34.6%",
        points: "+28 Points",
        riskClass: "critical",
        devClass: "bad"
      },
      {
        factor: "Payment Pattern",
        icon: "activity",
        observed: "78% spent in last 12 days",
        benchmark: "Gradual expenditure over time",
        deviation: "High concentration",
        points: "+21 Points",
        riskClass: "critical",
        devClass: "bad"
      },
      {
        factor: "Project Delay",
        icon: "clock",
        observed: "326 days elapsed",
        benchmark: "180 days limit",
        deviation: "+146 days",
        points: "+16 Points",
        riskClass: "high",
        devClass: "warning"
      },
      {
        factor: "Progress-Payment Mismatch",
        icon: "percent",
        observed: "Fin: 96.8% | Phys: 48%",
        benchmark: "Proportional progress matching",
        deviation: "High mismatch",
        points: "+14 Points",
        riskClass: "high",
        devClass: "bad"
      }
    ],
    investigation: {
      caseId: "INV-24081",
      currentStep: 2,
      stepDates: ["21 May 2024", "25 May 2024", "Pending", "Pending", "Pending"],
      notes: "Initial risk assessment suggests significant deviation in cost metrics compared to similar community halls in the region. Progress and payments mismatch also needs verification.\n\n-- 25 May 2024: Assigned to Nodal Officer for Karnataka for field validation."
    }
  },
  {
    id: "MPL/KA/24102",
    title: "Water Supply Scheme",
    district: "Dharwad",
    state: "Karnataka",
    riskLevel: "high",
    riskScore: 78,
    confidence: 82,
    primaryFinding: "Delayed by 146 days",
    exposure: "₹18.0L",
    assignedTo: "Anita Patil",
    agency: "Rural Water Supply Dept",
    workType: "Water & Sanitation",
    sanctionedAmount: "₹45.00 Lakh",
    expenditure: "₹22.50 Lakh",
    expenditurePercent: 50.0,
    sanctionDate: "18 Jun 2023",
    expectedCompletion: "18 Dec 2023",
    actualStatus: "In Progress (Delay)",
    physicalProgress: 30,
    financialProgress: 50.0,
    coordinates: [15.4589, 75.0078],
    evidence: [
      {
        factor: "Project Delay",
        icon: "clock",
        observed: "350 days elapsed",
        benchmark: "180 days limit",
        deviation: "+170 days",
        points: "+45 Points",
        riskClass: "critical",
        devClass: "bad"
      },
      {
        factor: "Progress-Payment Mismatch",
        icon: "percent",
        observed: "Fin: 50% | Phys: 30%",
        benchmark: "Proportional matching",
        deviation: "Moderate mismatch",
        points: "+12 Points",
        riskClass: "medium",
        devClass: "warning"
      },
      {
        factor: "Cost Anomaly",
        icon: "dollar-sign",
        observed: "₹45.00 Lakh",
        benchmark: "₹43.00 Lakh",
        deviation: "+4.6%",
        points: "+5 Points",
        riskClass: "low",
        devClass: "good"
      }
    ],
    investigation: {
      caseId: "INV-24102",
      currentStep: 1,
      stepDates: ["22 May 2024", "Pending", "Pending", "Pending", "Pending"],
      notes: "Case opened automatically due to chronic completion delays exceeding 5 months."
    }
  },
  {
    id: "MPL/MH/23821",
    title: "Road Construction",
    district: "Kolhapur",
    state: "Maharashtra",
    riskLevel: "high",
    riskScore: 74,
    confidence: 89,
    primaryFinding: "Similar work nearby",
    exposure: "₹26.0L",
    assignedTo: "S. Deshmukh",
    agency: "Public Works Department",
    workType: "Roads & Bridges",
    sanctionedAmount: "₹65.00 Lakh",
    expenditure: "₹32.50 Lakh",
    expenditurePercent: 50.0,
    sanctionDate: "05 Jan 2023",
    expectedCompletion: "05 Jul 2023",
    actualStatus: "In Progress",
    physicalProgress: 45,
    financialProgress: 50.0,
    coordinates: [16.7050, 74.2433],
    evidence: [
      {
        factor: "Duplicate / Similar Work",
        icon: "copy",
        observed: "Work overlapping existing road",
        benchmark: "No identical work within 2km",
        deviation: "92% similarity rating",
        points: "+35 Points",
        riskClass: "critical",
        devClass: "bad"
      },
      {
        factor: "Project Delay",
        icon: "clock",
        observed: "420 days elapsed",
        benchmark: "180 days limit",
        deviation: "+240 days",
        points: "+25 Points",
        riskClass: "high",
        devClass: "warning"
      }
    ],
    investigation: {
      caseId: "INV-23821",
      currentStep: 1,
      stepDates: ["23 May 2024", "Pending", "Pending", "Pending", "Pending"],
      notes: "Cross-referencing satellite mappings to verify if road work overlaps with a municipality road completed in late 2022."
    }
  },
  {
    id: "MPL/KA/23911",
    title: "Drainage System",
    district: "Vijayapura",
    state: "Karnataka",
    riskLevel: "high",
    riskScore: 72,
    confidence: 76,
    primaryFinding: "Payment pattern anomaly",
    exposure: "₹31.2L",
    assignedTo: "Meera N.",
    agency: "Municipal Corporation",
    workType: "Drainage & Sewerage",
    sanctionedAmount: "₹52.00 Lakh",
    expenditure: "₹48.00 Lakh",
    expenditurePercent: 92.3,
    sanctionDate: "10 Sep 2023",
    expectedCompletion: "10 Mar 2024",
    actualStatus: "Completed",
    physicalProgress: 100,
    financialProgress: 92.3,
    coordinates: [16.8244, 75.7242],
    evidence: [
      {
        factor: "Payment Pattern",
        icon: "activity",
        observed: "65% of budget paid on Mar 30",
        benchmark: "Gradual phase payments",
        deviation: "Severe end-of-year spike",
        points: "+40 Points",
        riskClass: "critical",
        devClass: "bad"
      },
      {
        factor: "Cost Anomaly",
        icon: "dollar-sign",
        observed: "₹52.00 Lakh",
        benchmark: "₹46.00 Lakh",
        deviation: "+13.0%",
        points: "+18 Points",
        riskClass: "medium",
        devClass: "warning"
      }
    ],
    investigation: {
      caseId: "INV-23911",
      currentStep: 1,
      stepDates: ["24 May 2024", "Pending", "Pending", "Pending", "Pending"],
      notes: "High disbursement concentration on March 30. Checking if payment matches field certification dates."
    }
  },
  {
    id: "MPL/KA/24177",
    title: "School Building",
    district: "Haveri",
    state: "Karnataka",
    riskLevel: "medium",
    riskScore: 58,
    confidence: 80,
    primaryFinding: "Low utilization (22%)",
    exposure: "₹15.7L",
    assignedTo: "Pooja S.",
    agency: "Zilla Panchayat Haveri",
    workType: "Education Infrastructure",
    sanctionedAmount: "₹71.50 Lakh",
    expenditure: "₹15.70 Lakh",
    expenditurePercent: 22.0,
    sanctionDate: "01 Nov 2023",
    expectedCompletion: "01 May 2024",
    actualStatus: "In Progress",
    physicalProgress: 20,
    financialProgress: 22.0,
    coordinates: [14.7963, 75.3995],
    evidence: [
      {
        factor: "Fund Utilization Anomaly",
        icon: "alert-triangle",
        observed: "22% spent after 270 days",
        benchmark: "Expected >60% utilization",
        deviation: "Severe underutilization",
        points: "+30 Points",
        riskClass: "high",
        devClass: "warning"
      },
      {
        factor: "Project Delay",
        icon: "clock",
        observed: "300 days elapsed",
        benchmark: "180 days limit",
        deviation: "+120 days",
        points: "+15 Points",
        riskClass: "medium",
        devClass: "warning"
      }
    ],
    investigation: {
      caseId: "INV-24177",
      currentStep: 1,
      stepDates: ["25 May 2024", "Pending", "Pending", "Pending", "Pending"],
      notes: "Investigating slow deployment of educational infrastructure funds."
    }
  },
  // Additional Low-Risk items to populate maps and charts
  {
    id: "MPL/KA/24220",
    title: "Park Development & Landscaping",
    district: "Bengaluru",
    state: "Karnataka",
    riskLevel: "low",
    riskScore: 32,
    confidence: 91,
    primaryFinding: "Normal progression",
    exposure: "₹0.0L",
    assignedTo: "K. Reddy",
    agency: "BBMP",
    workType: "Community Infrastructure",
    sanctionedAmount: "₹35.00 Lakh",
    expenditure: "₹28.00 Lakh",
    expenditurePercent: 80.0,
    sanctionDate: "15 Oct 2023",
    expectedCompletion: "15 Apr 2024",
    actualStatus: "Completed",
    physicalProgress: 100,
    financialProgress: 80.0,
    coordinates: [12.9716, 77.5946],
    evidence: [],
    investigation: null
  },
  {
    id: "MPL/KA/24231",
    title: "Digital Library Building",
    district: "Mysuru",
    state: "Karnataka",
    riskLevel: "low",
    riskScore: 25,
    confidence: 88,
    primaryFinding: "Normal progression",
    exposure: "₹0.0L",
    assignedTo: "M. Kumar",
    agency: "Zilla Panchayat Mysuru",
    workType: "Education Infrastructure",
    sanctionedAmount: "₹48.00 Lakh",
    expenditure: "₹24.00 Lakh",
    expenditurePercent: 50.0,
    sanctionDate: "05 Dec 2023",
    expectedCompletion: "05 Jun 2024",
    actualStatus: "In Progress",
    physicalProgress: 55,
    financialProgress: 50.0,
    coordinates: [12.2958, 76.6394],
    evidence: [],
    investigation: null
  },
  {
    id: "MPL/KA/24244",
    title: "Drinking Water Storage Tank",
    district: "Shimoga",
    state: "Karnataka",
    riskLevel: "medium",
    riskScore: 55,
    confidence: 84,
    primaryFinding: "Slight milestone lag",
    exposure: "₹5.2L",
    assignedTo: "P. Gowda",
    agency: "Rural Water Supply Shimoga",
    workType: "Water & Sanitation",
    sanctionedAmount: "₹28.00 Lakh",
    expenditure: "₹18.00 Lakh",
    expenditurePercent: 64.3,
    sanctionDate: "10 Aug 2023",
    expectedCompletion: "10 Feb 2024",
    actualStatus: "In Progress",
    physicalProgress: 50,
    financialProgress: 64.3,
    coordinates: [13.9299, 75.5681],
    evidence: [
      {
        factor: "Project Delay",
        icon: "clock",
        observed: "380 days elapsed",
        benchmark: "180 days limit",
        deviation: "+200 days",
        points: "+25 Points",
        riskClass: "high",
        devClass: "warning"
      }
    ],
    investigation: null
  },
  {
    id: "MPL/KA/24255",
    title: "Link Road Repair & Patching",
    district: "Mangaluru",
    state: "Karnataka",
    riskLevel: "low",
    riskScore: 18,
    confidence: 93,
    primaryFinding: "Normal progression",
    exposure: "₹0.0L",
    assignedTo: "J. D'Souza",
    agency: "PWD Mangaluru",
    workType: "Roads & Bridges",
    sanctionedAmount: "₹22.00 Lakh",
    expenditure: "₹21.00 Lakh",
    expenditurePercent: 95.4,
    sanctionDate: "01 Jan 2024",
    expectedCompletion: "01 May 2024",
    actualStatus: "Completed",
    physicalProgress: 100,
    financialProgress: 95.4,
    coordinates: [12.9141, 74.8560],
    evidence: [],
    investigation: null
  },
  {
    id: "MPL/KA/24266",
    title: "Multipurpose Community Hall",
    district: "Gulbarga",
    state: "Karnataka",
    riskLevel: "high",
    riskScore: 76,
    confidence: 81,
    primaryFinding: "Cost deviation (+24%)",
    exposure: "₹18.5L",
    assignedTo: "K. Siddharamaiah",
    agency: "Zilla Panchayat Kalaburagi",
    workType: "Community Infrastructure",
    sanctionedAmount: "₹76.00 Lakh",
    expenditure: "₹72.00 Lakh",
    expenditurePercent: 94.7,
    sanctionDate: "20 May 2023",
    expectedCompletion: "20 Nov 2023",
    actualStatus: "In Progress (Delay)",
    physicalProgress: 70,
    financialProgress: 94.7,
    coordinates: [17.3297, 76.8343],
    evidence: [
      {
        factor: "Cost Anomaly",
        icon: "dollar-sign",
        observed: "₹76.00 Lakh",
        benchmark: "₹61.20 Lakh",
        deviation: "+24.2%",
        points: "+20 Points",
        riskClass: "high",
        devClass: "warning"
      },
      {
        factor: "Progress-Payment Mismatch",
        icon: "percent",
        observed: "Fin: 94.7% | Phys: 70%",
        benchmark: "Proportional progress matching",
        deviation: "Moderate mismatch",
        points: "+12 Points",
        riskClass: "medium",
        devClass: "warning"
      }
    ],
    investigation: {
      caseId: "INV-24266",
      currentStep: 1,
      stepDates: ["26 May 2024", "Pending", "Pending", "Pending", "Pending"],
      notes: "Flagged for administrative review of high unit costs and lagging progress metrics."
    }
  },
  {
    id: "MPL/KA/24278",
    title: "Drinking Water Borewell Project",
    district: "Chitradurga",
    state: "Karnataka",
    riskLevel: "critical",
    riskScore: 92,
    confidence: 85,
    primaryFinding: "Severe delay & payment mismatch",
    exposure: "₹24.0L",
    assignedTo: "H. Naik",
    agency: "Rural Water Supply Chitradurga",
    workType: "Water & Sanitation",
    sanctionedAmount: "₹32.00 Lakh",
    expenditure: "₹30.40 Lakh",
    expenditurePercent: 95.0,
    sanctionDate: "05 Apr 2023",
    expectedCompletion: "05 Oct 2023",
    actualStatus: "In Progress (Delay)",
    physicalProgress: 15,
    financialProgress: 95.0,
    coordinates: [14.2251, 76.3980],
    evidence: [
      {
        factor: "Progress-Payment Mismatch",
        icon: "percent",
        observed: "Fin: 95.0% | Phys: 15%",
        benchmark: "Proportional progress matching",
        deviation: "Severe mismatch",
        points: "+38 Points",
        riskClass: "critical",
        devClass: "bad"
      },
      {
        factor: "Project Delay",
        icon: "clock",
        observed: "508 days elapsed",
        benchmark: "180 days limit",
        deviation: "+328 days",
        points: "+30 Points",
        riskClass: "critical",
        devClass: "bad"
      },
      {
        factor: "Cost Anomaly",
        icon: "dollar-sign",
        observed: "₹32.00 Lakh",
        benchmark: "₹25.00 Lakh",
        deviation: "+28.0%",
        points: "+15 Points",
        riskClass: "high",
        devClass: "warning"
      }
    ],
    investigation: {
      caseId: "INV-24278",
      currentStep: 2,
      stepDates: ["20 May 2024", "24 May 2024", "Pending", "Pending", "Pending"],
      notes: "Critical mismatch. Funds nearly completely spent with minimal physical work done. Administrative hold recommended."
    }
  }
];

// ==================== STATE MANAGEMENT ====================
let currentActiveView = "dashboard";
let selectedProject = projectsData[0]; // Default to first project
let leafletMapInstance = null;
let mapMarkersGroup = null;
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

function populatePriorityQueueTable() {
  const tbody = document.getElementById("priority-queue-tbody");
  tbody.innerHTML = "";

  const list = getFilteredProjects();

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">No high-risk anomaly records match selected filter criteria.</td></tr>`;
    return;
  }

  list.forEach((proj, idx) => {
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

// ==================== GIS RISK MAP VIEW ====================
function initOrRefreshMap() {
  const mapContainer = document.getElementById("leaflet-map");
  if (!mapContainer) return;

  // If map already initialized, just refresh size and layers
  if (leafletMapInstance) {
    leafletMapInstance.invalidateSize();
    return;
  }

  // Center map in Karnataka
  leafletMapInstance = L.map('leaflet-map', {
    zoomControl: false
  }).setView([15.2, 75.8], 7);

  // Add zoom control at top right
  L.control.zoom({ position: 'topright' }).addTo(leafletMapInstance);

  // Custom dark thematic map tiles (cartodb dark matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(leafletMapInstance);

  mapMarkersGroup = L.layerGroup().addTo(leafletMapInstance);

  populateMapMarkers();

  // Handle toggle show clusters
  const clusterToggle = document.getElementById("map-toggle-clusters");
  clusterToggle.addEventListener("change", () => {
    // In a real application we would trigger cluster layer plugin toggling
    // For this MVP, we can simulate density adjustments or simply log it.
    populateMapMarkers();
  });
}

function populateMapMarkers() {
  if (!mapMarkersGroup) return;
  mapMarkersGroup.clearLayers();

  const isClusterActive = document.getElementById("map-toggle-clusters").checked;
  const filtered = getFilteredProjects();

  filtered.forEach(proj => {
    if (!proj.coordinates) return;

    // Custom DIV Icon to match dark glassmorphic styling
    const customIcon = L.divIcon({
      className: `custom-map-marker ${proj.riskLevel}`,
      html: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const popupContent = `
      <div class="map-popup-header">
        <span class="map-popup-id">${proj.id}</span>
        <span class="risk-badge ${proj.riskLevel}">${proj.riskLevel}</span>
      </div>
      <div class="map-popup-body">
        <div class="map-popup-title">${proj.title}</div>
        <div class="map-popup-loc">${proj.district}, ${proj.state}</div>

        <div class="map-popup-finding ${proj.riskLevel}">
          <strong>Finding:</strong> ${proj.primaryFinding}
        </div>
        <a class="map-popup-btn" onclick="globalLoadProjectDetails('${proj.id}')">View Project</a>
      </div>
    `;

    const marker = L.marker(proj.coordinates, { icon: customIcon });
    marker.bindPopup(popupContent);
    mapMarkersGroup.addLayer(marker);
  });
}

// Global scope binder so Leaflet onclick HTML strings can bind to this
window.globalLoadProjectDetails = function (id) {
  loadProjectDetails(id);
};

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

  // Update ApexCharts if they exist
  if (window.riskDistributionChart && typeof window.riskDistributionChart.updateOptions === 'function') {
    window.riskDistributionChart.updateOptions({ theme: { mode: theme } });
  }
  if (window.riskDriversChart && typeof window.riskDriversChart.updateOptions === 'function') {
    window.riskDriversChart.updateOptions({ theme: { mode: theme } });
  }
}

// ==================== APP INITIALIZER ====================
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Theme
  initTheme();

  // Initialize Landing page triggers
  initLandingPage();

  // Initialize app layout sidebar
  initSidebar();

  // Initialize Global Filter events
  initFilters();

  // Initialize Priority Queue project data
  populatePriorityQueueTable();

  // Initialize Investigation buttons
  initInvestigationControls();

  // Initialize Lucide Icons vectors
  lucide.createIcons();
});
