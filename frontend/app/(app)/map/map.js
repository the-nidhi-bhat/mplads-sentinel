/*
   MPLADS AI Monitor - GIS Risk Map Module
   All Leaflet map, markers, heatmap, basemap, boundaries, popups, legend
*/


// ==================== GIS RISK MAP VIEW ====================

// Basemap tile definitions
const basemapDefs = {
  dark: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abc',
      maxZoom: 19,
      className: 'dark-tiles'
    },
    bg: '#0b111e'
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abc',
      maxZoom: 19
    },
    bg: '#f4f4f4'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, and the GIS User Community',
      maxZoom: 18
    },
    bg: '#1a1a2e'
  }
};

// Marker size scaling based on risk score
function getMarkerSize(riskScore) {
  // Scale from 18px (low risk ~20) to 36px (critical ~92)
  const minSize = 18, maxSize = 36;
  const minScore = 15, maxScore = 95;
  const clamped = Math.max(minScore, Math.min(maxScore, riskScore));
  const ratio = (clamped - minScore) / (maxScore - minScore);
  return Math.round(minSize + ratio * (maxSize - minSize));
}

// Build a rich popup HTML for a project
function buildMapPopup(proj) {
  const physBarColor = proj.financialProgress > proj.physicalProgress + 20 ? 'var(--color-critical)' : 'var(--primary-blue)';
  return `
    <div class="map-popup-header">
      <span class="map-popup-id">${proj.id}</span>
      <span class="risk-badge ${proj.riskLevel}">${proj.riskLevel}</span>
    </div>
    <div class="map-popup-body">
      <div class="map-popup-title">${proj.title}</div>
      <div class="map-popup-loc">${proj.district}, ${proj.state}</div>

      <div class="map-popup-metrics">
        <div class="map-popup-metric">
          <span class="map-popup-metric-label">Sanctioned</span>
          <span class="map-popup-metric-value">${proj.sanctionedAmount}</span>
        </div>
        <div class="map-popup-metric">
          <span class="map-popup-metric-label">Expenditure</span>
          <span class="map-popup-metric-value">${proj.expenditure} (${proj.expenditurePercent}%)</span>
        </div>
        <div class="map-popup-metric">
          <span class="map-popup-metric-label">Risk Score</span>
          <span class="map-popup-metric-value">${proj.riskScore}/100</span>
        </div>
      </div>

      <div class="map-popup-progress">
        <div class="map-popup-progress-row">
          <span>Physical: ${proj.physicalProgress}%</span>
          <span>Financial: ${proj.financialProgress}%</span>
        </div>
        <div class="map-popup-progress-track">
          <div class="map-popup-progress-fill" style="width: ${proj.physicalProgress}%; background: var(--color-${proj.riskLevel});"></div>
          <div class="map-popup-progress-fill financial" style="width: ${proj.financialProgress}%; background: ${physBarColor};"></div>
        </div>
      </div>

      <div class="map-popup-finding ${proj.riskLevel}">
        <strong>Finding:</strong> ${proj.primaryFinding}
      </div>
      <div class="map-popup-footer">
        <span class="map-popup-officer">${proj.assignedTo}</span>
        <a class="map-popup-btn" data-proj-id="${proj.id}" href="#">View Project</a>
      </div>
    </div>
  `;
}

// Add a custom basemap control to the map
function addBasemapControl() {
  const BasemapControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function () {
      const container = L.DomUtil.create('div', 'map-basemap-control');
      container.innerHTML = `
        <button class="basemap-btn active" data-basemap="dark" title="Dark Theme">
          <i data-lucide="moon" style="width:16px;height:16px;"></i>
        </button>
        <button class="basemap-btn" data-basemap="street" title="Street Map">
          <i data-lucide="map" style="width:16px;height:16px;"></i>
        </button>
        <button class="basemap-btn" data-basemap="satellite" title="Satellite">
          <i data-lucide="globe" style="width:16px;height:16px;"></i>
        </button>
      `;
      L.DomEvent.disableClickPropagation(container);
      container.querySelectorAll('.basemap-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          switchBasemap(btn.dataset.basemap);
          container.querySelectorAll('.basemap-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
      lucide.createIcons({ nodes: [container] });
      return container;
    }
  });
  new BasemapControl().addTo(leafletMapInstance);
}

function switchBasemap(key) {
  if (!basemapLayers.current) return;
  leafletMapInstance.removeLayer(basemapLayers.current);
  const def = basemapDefs[key];
  basemapLayers.current = L.tileLayer(def.url, def.options).addTo(leafletMapInstance);
  activeBasemap = key;
  document.getElementById('leaflet-map').style.backgroundColor = def.bg;
}

// Create or destroy heatmap layer
function toggleHeatmap(show) {
  if (show) {
    if (mapHeatLayer) return; // already active
    const filtered = getFilteredProjects();
    const heatData = filtered.map(p => {
      // intensity weighted by risk score
      const intensity = p.riskScore / 100;
      return [p.coordinates[0], p.coordinates[1], intensity];
    });
    mapHeatLayer = L.heatLayer(heatData, {
      radius: 35,
      blur: 25,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.2: '#10b981',
        0.4: '#eab308',
        0.6: '#f97316',
        0.8: '#ef4444',
        1.0: '#dc2626'
      }
    }).addTo(leafletMapInstance);
  } else {
    if (mapHeatLayer) {
      leafletMapInstance.removeLayer(mapHeatLayer);
      mapHeatLayer = null;
    }
  }
}

// Toggle district/state boundary overlay
function toggleBoundaries(show) {
  if (show) {
    if (mapBoundariesLayer) return;
    // Load a lightweight India states GeoJSON from a public source
    fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson')
      .then(r => r.json())
      .then(geojson => {
        mapBoundariesLayer = L.geoJSON(geojson, {
          style: function () {
            return {
              color: '#3b82f6',
              weight: 1.5,
              opacity: 0.45,
              fillColor: '#3b82f6',
              fillOpacity: 0.04,
              dashArray: '4,4'
            };
          },
          onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.NAME_1) {
              layer.bindTooltip(feature.properties.NAME_1, {
                sticky: true,
                className: 'map-tooltip'
              });
            }
          }
        }).addTo(leafletMapInstance);
      })
      .catch(() => {
        console.warn('Failed to load boundary GeoJSON');
      });
  } else {
    if (mapBoundariesLayer) {
      leafletMapInstance.removeLayer(mapBoundariesLayer);
      mapBoundariesLayer = null;
    }
  }
}

// Update map legend with filtered counts
function updateMapLegend(filteredProjects) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  filteredProjects.forEach(p => {
    if (counts.hasOwnProperty(p.riskLevel)) counts[p.riskLevel]++;
  });

  document.getElementById("legend-count-critical").textContent = counts.critical;
  document.getElementById("legend-count-high").textContent = counts.high;
  document.getElementById("legend-count-medium").textContent = counts.medium;
  document.getElementById("legend-count-low").textContent = counts.low;
}

// Main map initialization
function initOrRefreshMap() {
  const mapContainer = document.getElementById("leaflet-map");
  if (!mapContainer) return;

  // If map already initialized, just refresh size
  if (leafletMapInstance) {
    leafletMapInstance.invalidateSize();
    return;
  }

  // Detect theme for initial basemap
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const initialBasemap = isDark ? 'dark' : 'street';

  // Center map on India (Karnataka region)
  leafletMapInstance = L.map('leaflet-map', {
    zoomControl: false,
    zoomSnap: 0.5
  }).setView([15.2, 75.8], 7);

  // Add zoom control at top right
  L.control.zoom({ position: 'topright' }).addTo(leafletMapInstance);

  // Set initial basemap
  const def = basemapDefs[initialBasemap];
  basemapLayers.current = L.tileLayer(def.url, def.options).addTo(leafletMapInstance);
  activeBasemap = initialBasemap;
  mapContainer.style.backgroundColor = def.bg;

  // Initialize MarkerClusterGroup
  mapClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    chunkedLoading: true,
    iconCreateFunction: function (cluster) {
      const count = cluster.getChildCount();
      let sizeClass = 'small';
      let size = 36;
      if (count >= 10) { sizeClass = 'large'; size = 52; }
      else if (count >= 5) { sizeClass = 'medium'; size = 44; }
      return L.divIcon({
        html: '<div><span>' + count + '</span></div>',
        className: 'marker-cluster marker-cluster-' + sizeClass,
        iconSize: L.point(size, size)
      });
    }
  });
  leafletMapInstance.addLayer(mapClusterGroup);

  // Add basemap switcher control
  addBasemapControl();

  populateMapMarkers();

  // Wire up cluster toggle
  document.getElementById("map-toggle-clusters").addEventListener("change", () => {
    populateMapMarkers();
  });

  // Wire up heatmap toggle
  document.getElementById("map-toggle-heat").addEventListener("change", (e) => {
    toggleHeatmap(e.target.checked);
  });

  // Wire up boundary toggle
  document.getElementById("map-toggle-boundaries").addEventListener("change", (e) => {
    toggleBoundaries(e.target.checked);
  });

  // Wire up fit bounds button
  document.getElementById("btn-map-fit").addEventListener("click", fitMapToResults);

  // Wire up filter panel toggle
  initMapFilterPanel();

  // Delegated click handler for popup "View Project" buttons (replaces inline onclick)
  mapContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.map-popup-btn[data-proj-id]');
    if (btn) {
      e.preventDefault();
      const id = btn.getAttribute('data-proj-id');
      if (id) loadProjectDetails(id);
    }
  });
}

// Populate markers into the cluster group (or flat layer group)
function populateMapMarkers() {
  if (!mapClusterGroup) return;
  mapClusterGroup.clearLayers();

  const isClusterActive = document.getElementById("map-toggle-clusters").checked;
  const filtered = getFilteredProjects();

  updateMapLegend(filtered);

  // If clustering is off, use a plain layer group
  if (!isClusterActive) {
    leafletMapInstance.removeLayer(mapClusterGroup);
    if (!mapMarkersGroup) {
      mapMarkersGroup = L.layerGroup().addTo(leafletMapInstance);
    }
    mapMarkersGroup.clearLayers();
  } else {
    // Ensure cluster group is on the map
    if (!leafletMapInstance.hasLayer(mapClusterGroup)) {
      mapClusterGroup.addTo(leafletMapInstance);
    }
    if (mapMarkersGroup && leafletMapInstance.hasLayer(mapMarkersGroup)) {
      leafletMapInstance.removeLayer(mapMarkersGroup);
    }
  }

  const targetGroup = isClusterActive ? mapClusterGroup : mapMarkersGroup;

  filtered.forEach(proj => {
    if (!proj.coordinates) return;

    const size = getMarkerSize(proj.riskScore);
    const halfSize = Math.round(size / 2);

    const customIcon = L.divIcon({
      className: `custom-map-marker ${proj.riskLevel}`,
      html: '',
      iconSize: [size, size],
      iconAnchor: [halfSize, halfSize]
    });

    const marker = L.marker(proj.coordinates, { icon: customIcon });
    marker.bindPopup(buildMapPopup(proj), { maxWidth: 280, minWidth: 240 });
    marker.bindTooltip(`<strong>${proj.id}</strong><br>${proj.title}`, {
      direction: 'top',
      offset: [0, -halfSize - 2],
      opacity: 0.92,
      className: 'map-tooltip'
    });

    // Store project ID on marker for lookup
    marker._projId = proj.id;

    targetGroup.addLayer(marker);
  });

  // Also update heatmap if active
  if (mapHeatLayer) {
    leafletMapInstance.removeLayer(mapHeatLayer);
    mapHeatLayer = null;
    toggleHeatmap(true);
  }
}

// Fit map to current filtered markers' bounds
function fitMapToResults() {
  const filtered = getFilteredProjects();
  if (filtered.length === 0) return;

  const coords = filtered.filter(p => p.coordinates).map(p => p.coordinates);
  if (coords.length === 0) return;

  const bounds = L.latLngBounds(coords);
  leafletMapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true });
}

// Show a specific project on the map (called from project details)
function showProjectOnMap(projectId) {
  const proj = projectsData.find(p => p.id === projectId);
  if (!proj || !proj.coordinates) return;

  switchView('map');
  setTimeout(() => {
    if (!leafletMapInstance) return;
    leafletMapInstance.invalidateSize();
    const size = getMarkerSize(proj.riskScore);
    leafletMapInstance.setView(proj.coordinates, 12, { animate: true });

    // Open popup on the matching marker after map settles
    setTimeout(() => {
      mapClusterGroup.eachLayer(marker => {
        if (marker._projId === proj.id) {
          marker.openPopup();
        }
      });
    }, 400);
  }, 250);
}

window.showProjectOnMap = showProjectOnMap;

// Map filter panel (floating dropdown)
function initMapFilterPanel() {
  const btn = document.getElementById('btn-map-filter');
  const panel = document.getElementById('map-filter-panel');
  if (!btn || !panel) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.classList.remove('open');
    }
  });

  // Wire up apply button
  document.getElementById('btn-map-filter-apply').addEventListener('click', () => {
    const riskVal = document.getElementById('map-filter-risk').value;
    const typeVal = document.getElementById('map-filter-type').value;

    // Override the global filters temporarily for the map
    activeFilters.risk = riskVal || 'All';
    activeFilters.type = typeVal || 'All';

    populateMapMarkers();
    panel.classList.remove('open');
  });

  document.getElementById('btn-map-filter-reset').addEventListener('click', () => {
    document.getElementById('map-filter-risk').value = 'All';
    document.getElementById('map-filter-type').value = 'All';
    activeFilters.risk = 'All';
    activeFilters.type = 'All';
    populateMapMarkers();
    panel.classList.remove('open');
  });
}

// Global scope for popup onclick handlers
window.globalLoadProjectDetails = function (id) {
  loadProjectDetails(id);
};
