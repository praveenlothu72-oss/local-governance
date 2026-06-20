import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Project, Issue } from '../types';

// Fix Leaflet marker asset imports in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface InteractiveMapProps {
  projects?: Project[];
  issues?: Issue[];
  onProjectClick?: (project: Project) => void;
  onIssueClick?: (issue: Issue) => void;
  isSelectorMode?: boolean;
  selectedCoords?: [number, number] | null;
  onCoordsSelect?: (lat: number, lng: number) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  projects = [],
  issues = [],
  onProjectClick,
  onIssueClick,
  isSelectorMode = false,
  selectedCoords,
  onCoordsSelect
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.FeatureGroup | null>(null);
  const selectorMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on Indore region coordinates
    const map = L.map(mapContainerRef.current, {
      center: [22.7196, 75.8577],
      zoom: 12,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const markerGroup = L.featureGroup().addTo(map);
    mapRef.current = map;
    markerGroupRef.current = markerGroup;

    // If selector mode, add map click listener
    if (isSelectorMode) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (onCoordsSelect) {
          onCoordsSelect(lat, lng);
        }
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isSelectorMode]);

  // Update Markers when projects, issues, or selector changes
  useEffect(() => {
    const map = mapRef.current;
    const markerGroup = markerGroupRef.current;
    if (!map || !markerGroup) return;

    // Clear existing markers
    markerGroup.clearLayers();

    // Define custom icon generators
    const createCustomIcon = (color: string, isIssue: boolean) => {
      return L.divIcon({
        html: `<div style="
          background-color: ${color}; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          border: 2px solid white; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.4); 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          color: white; 
          font-weight: bold; 
          font-size: 10px;
        ">${isIssue ? 'I' : 'P'}</div>`,
        className: 'custom-leaflet-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    };

    // Add Project Markers
    projects.forEach(project => {
      // Find village coords (mock offsets around Indore center)
      let lat = 22.7196;
      let lng = 75.8577;
      if (project.village_id === 'v-ganga') { lat = 22.8105; lng = 75.9012; }
      else if (project.village_id === 'v-narmada') { lat = 22.7196; lng = 75.8577; }
      else if (project.village_id === 'v-yamuna') { lat = 22.6901; lng = 75.8111; }
      else if (project.village_id === 'v-godavari') { lat = 22.7540; lng = 75.7900; }
      else if (project.village_id === 'v-kaveri') { lat = 22.6504; lng = 75.7201; }

      // Slight Jitter to prevent complete overlap
      const jitterLat = lat + (Math.random() - 0.5) * 0.004;
      const jitterLng = lng + (Math.random() - 0.5) * 0.004;

      const color = project.status === 'COMPLETED' ? '#16a34a' 
                  : project.status === 'UNDER_WORK' ? '#eab308' 
                  : project.status === 'REJECTED' ? '#dc2626' 
                  : '#2563eb'; // PENDING / ACCEPTED

      const marker = L.marker([jitterLat, jitterLng], {
        icon: createCustomIcon(color, false)
      });

      marker.bindTooltip(`
        <div class="font-sans">
          <p class="font-bold text-xs text-slate-800">${project.title}</p>
          <p class="text-[10px] text-slate-500">${project.category} | Budget: ₹${project.budget_allocated.toLocaleString('en-IN')}</p>
          <span class="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-semibold rounded bg-slate-100 text-slate-800">${project.status}</span>
        </div>
      `, { permanent: false, direction: 'top' });

      marker.on('click', () => {
        if (onProjectClick) onProjectClick(project);
      });

      markerGroup.addLayer(marker);
    });

    // Add Issue Markers
    issues.forEach(issue => {
      if (!issue.location_lat || !issue.location_lng) return;

      const color = issue.status === 'COMPLETED' ? '#16a34a'
                  : issue.status === 'UNDER_WORK' ? '#eab308'
                  : issue.status === 'REJECTED' ? '#dc2626'
                  : issue.urgency === 'CRITICAL' ? '#991b1b' // Dark red
                  : '#f97316'; // PENDING / ACCEPTED Saffron-Orange

      const marker = L.marker([issue.location_lat, issue.location_lng], {
        icon: createCustomIcon(color, true)
      });

      marker.bindTooltip(`
        <div class="font-sans">
          <p class="font-bold text-xs text-red-800">⚠️ ${issue.title}</p>
          <p class="text-[10px] text-slate-500">${issue.category} | Upvotes: ${issue.upvote_count}</p>
          <div class="flex gap-1.5 mt-1">
            <span class="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-red-100 text-red-800">${issue.urgency}</span>
            <span class="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-slate-100 text-slate-800">${issue.escalation_status}</span>
          </div>
        </div>
      `, { permanent: false, direction: 'top' });

      marker.on('click', () => {
        if (onIssueClick) onIssueClick(issue);
      });

      markerGroup.addLayer(marker);
    });

    // Handle selector marker
    if (isSelectorMode) {
      if (selectorMarkerRef.current) {
        map.removeLayer(selectorMarkerRef.current);
        selectorMarkerRef.current = null;
      }

      if (selectedCoords) {
        selectorMarkerRef.current = L.marker(selectedCoords, {
          draggable: true
        }).addTo(map);

        selectorMarkerRef.current.bindTooltip('<p class="font-bold text-xs text-slate-800">Selected Location</p>', { permanent: true, direction: 'top' });

        selectorMarkerRef.current.on('dragend', (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          if (onCoordsSelect) {
            onCoordsSelect(position.lat, position.lng);
          }
        });

        map.setView(selectedCoords, 14);
      }
    }
  }, [projects, issues, isSelectorMode, selectedCoords]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '300px' }} />
      <div className="absolute bottom-2 left-2 z-[400] bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow border border-slate-100 text-[10px] text-slate-600 flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full border border-white shadow bg-green-600"></span>
          <span>Completed Project</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full border border-white shadow bg-yellow-500"></span>
          <span>Under Work Project</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full border border-white shadow bg-blue-600"></span>
          <span>Pending/Accepted Project</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full border border-white shadow bg-orange-500"></span>
          <span>Citizen Issue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full border border-white shadow bg-red-800"></span>
          <span>Critical/Escalated Issue</span>
        </div>
      </div>
    </div>
  );
};
export default InteractiveMap;
