import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import type { Issue, Village, Profile } from '../types';
import { InteractiveMap } from '../components/InteractiveMap';
import { ThumbsUp, PlusCircle, ListFilter, MapPin, AlertCircle } from 'lucide-react';

interface IssueCenterProps {
  currentUser: Profile | null;
  refreshTrigger: number;
  triggerRefresh: () => void;
  activeTab: 'vote' | 'raise';
  setActiveTab: (tab: 'vote' | 'raise') => void;
}

export const IssueCenter: React.FC<IssueCenterProps> = ({
  currentUser,
  refreshTrigger,
  triggerRefresh,
  activeTab,
  setActiveTab
}) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  
  // Raise Issue Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');
  const [category, setCategory] = useState<'Roads' | 'Water' | 'Schools' | 'Healthcare' | 'Drainage' | 'Streetlights' | 'Other'>('Roads');
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');

  // Filter votes state
  const [selectedVillageFilter, setSelectedVillageFilter] = useState('all');
  const [upvotedIssues, setUpvotedIssues] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      const iss = await db.getIssues();
      const vills = await db.getVillages();
      setIssues(iss.sort((a, b) => b.upvote_count - a.upvote_count)); // Sort by highest upvotes
      setVillages(vills);

      // Pre-populate form village if citizen has one
      if (currentUser?.village) {
        setSelectedVillageId(currentUser.village);
      } else if (vills.length > 0) {
        setSelectedVillageId(vills[0].id);
      }
    };
    fetchData();
  }, [refreshTrigger, currentUser]);

  const handleUpvote = async (issueId: string) => {
    if (!currentUser) {
      alert('Please Sign In as an authenticated citizen to upvote public issues.');
      return;
    }
    if (upvotedIssues[issueId]) {
      alert('You have already upvoted this issue!');
      return;
    }

    const res = await db.upvoteIssue(issueId, currentUser.id);
    if (res.success) {
      setUpvotedIssues(prev => ({ ...prev, [issueId]: true }));
      triggerRefresh();
      
      if (res.escalated) {
        alert('ALERT: Upvotes have crossed the threshold of 5! The system has automatically escalated this issue to higher authorities.');
      }
    } else {
      alert('You have already upvoted this issue!');
    }
  };

  const handleCoordsSelect = (latitude: number, longitude: number) => {
    setLat(parseFloat(latitude.toFixed(6)));
    setLng(parseFloat(longitude.toFixed(6)));
  };

  const handleRaiseIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim() || !description.trim() || !selectedVillageId) {
      alert('Please fill in the title, description, and select a village.');
      return;
    }
    if (lat === null || lng === null) {
      alert('Please click on the map to set the geo-tagged coordinates of the issue.');
      return;
    }

    // Citizen raises issue: status PENDING, upvotes 0
    await db.createIssue({
      citizen_id: currentUser.id,
      constituency_id: currentUser.constituency || 'indore-constituency-id',
      village_id: selectedVillageId,
      title: title.trim(),
      description: description.trim(),
      category,
      location_lat: lat,
      location_lng: lng,
      photo_url: photoUrl.trim() || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
      urgency
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setPhotoUrl('');
    setLat(null);
    setLng(null);
    setActiveTab('vote');
    triggerRefresh();

    alert('Success! Your public issue has been filed. Check the Civic Voting Center to upvote.');
  };

  const getVillageName = (vId: string) => {
    return villages.find(v => v.id === vId)?.name || 'Unknown Village';
  };

  const filteredIssues = issues.filter(issue => {
    if (selectedVillageFilter === 'all') return true;
    return issue.village_id === selectedVillageFilter;
  });

  const getEscalationBadge = (issue: Issue) => {
    if (issue.escalation_status === 'ESCALATED') {
      return (
        <span className="px-2 py-0.5 text-[9px] font-bold rounded border border-orange-200 bg-orange-100 text-orange-800 animate-pulse">
          ⚠️ ESCALATED TO DISTRICT
        </span>
      );
    } else if (issue.escalation_status === 'RESOLVED') {
      return (
        <span className="px-2 py-0.5 text-[9px] font-bold rounded border border-green-200 bg-green-100 text-green-800">
          ✔️ RESOLVED
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[9px] font-bold rounded border border-slate-200 bg-slate-100 text-slate-600">
        NORMAL
      </span>
    );
  };

  const getUrgencyBadge = (urgency: Issue['urgency']) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('vote')}
          className={`
            px-4 py-2.5 font-bold text-xs md:text-sm transition-all border-b-2
            ${activeTab === 'vote' 
              ? 'border-saffron text-slate-800 bg-white' 
              : 'border-transparent text-slate-400 hover:text-slate-600'}
          `}
        >
          <div className="flex items-center gap-1.5">
            <ThumbsUp size={16} />
            <span>Civic Voting Center</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('raise')}
          className={`
            px-4 py-2.5 font-bold text-xs md:text-sm transition-all border-b-2
            ${activeTab === 'raise' 
              ? 'border-saffron text-slate-800 bg-white' 
              : 'border-transparent text-slate-400 hover:text-slate-600'}
          `}
        >
          <div className="flex items-center gap-1.5">
            <PlusCircle size={16} />
            <span>Raise Public Issue</span>
          </div>
        </button>
      </div>

      {/* Tab 1: Civic Voting list */}
      {activeTab === 'vote' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Active Public Concerns</h3>
              <p className="text-[10px] text-slate-400">Issues crossing 5 upvotes automatically escalate to Authority reviews.</p>
            </div>

            <div className="flex items-center gap-2">
              <ListFilter size={14} className="text-slate-400" />
              <select
                value={selectedVillageFilter}
                onChange={(e) => setSelectedVillageFilter(e.target.value)}
                className="px-2 py-1 border border-slate-200 rounded text-xs bg-white focus:outline-none"
              >
                <option value="all">All Villages</option>
                {villages.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid list of concerns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredIssues.length > 0 ? (
              filteredIssues.map(issue => (
                <div key={issue.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                  {/* Card Header image & badges */}
                  <div className="relative h-40 bg-slate-100 border-b border-slate-100">
                    {issue.photo_url ? (
                      <img src={issue.photo_url} alt="Proof" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo Proof Attached</div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${getUrgencyBadge(issue.urgency)}`}>
                        {issue.urgency}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-900/80 text-white backdrop-blur-sm">
                        {issue.category}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      {getEscalationBadge(issue)}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                        <MapPin size={12} />
                        <span>{getVillageName(issue.village_id)} | Coordinates: {issue.location_lat.toFixed(4)}, {issue.location_lng.toFixed(4)}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-xs md:text-sm leading-snug">⚠️ {issue.title}</h4>
                      <p className="text-xs text-slate-500 leading-normal line-clamp-3">{issue.description}</p>
                      
                      {issue.status === 'REJECTED' && (
                        <div className="p-2 rounded-lg bg-red-50 border border-red-100 text-[10px] text-red-600 mt-2">
                          <strong>Rejection Reason:</strong> {issue.rejection_reason}
                        </div>
                      )}
                    </div>

                    {/* Upvotes bar */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase leading-none block">Civic Upvotes</span>
                        <span className="text-xs font-black text-slate-800 mt-0.5">👍 {issue.upvote_count} Votes</span>
                      </div>

                      <button
                        onClick={() => handleUpvote(issue.id)}
                        disabled={issue.status === 'COMPLETED' || issue.status === 'REJECTED' || upvotedIssues[issue.id]}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                          ${upvotedIssues[issue.id] 
                            ? 'bg-emerald-100 text-emerald-800 cursor-default' 
                            : 'bg-saffron text-slate-950 hover:bg-orange-400 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed'}
                        `}
                      >
                        <ThumbsUp size={12} />
                        <span>{upvotedIssues[issue.id] ? 'Upvoted' : 'Upvote Issue'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-slate-400 text-xs bg-white rounded-2xl border">
                No active complaints filed in this village.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Raise Issue Form */}
      {activeTab === 'raise' && (
        !currentUser ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4 max-w-lg mx-auto my-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-saffron flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">Aadhaar Authentication Required</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              To prevent duplicate complaints, spam reports, or false claims, all citizens must verify their identity using Aadhaar to register an official public concern.
            </p>
            <div className="pt-2">
              <span className="text-[10px] text-slate-400 font-medium block mb-4">Your report will be automatically geo-tagged to hold government agencies accountable.</span>
              <button
                onClick={() => {
                  alert('Please click the "Sign In" button in the top navigation bar to log in or register.');
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-saffron to-orange-500 hover:from-orange-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
              >
                Sign In / Authenticate Now
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form */}
            <form onSubmit={handleRaiseIssue} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-3 space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                New Public Concern Form
              </h3>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Issue Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken water valve causing street floods"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Village</label>
                  <select
                    required
                    value={selectedVillageId}
                    onChange={(e) => setSelectedVillageId(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="" disabled>Select Village</option>
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Category</label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Roads">Roads</option>
                    <option value="Water">Water</option>
                    <option value="Schools">Schools</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Drainage">Drainage</option>
                    <option value="Streetlights">Streetlights</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Urgency Level</label>
                  <select
                    required
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the issue: how long it has been broken, size/location of damage, and impact on village life..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="font-bold text-slate-500 block mb-1">Latitude</span>
                  <input
                    type="text"
                    disabled
                    value={lat !== null ? lat.toString() : 'Select on map'}
                    className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-xs"
                  />
                </div>
                <div>
                  <span className="font-bold text-slate-500 block mb-1">Longitude</span>
                  <input
                    type="text"
                    disabled
                    value={lng !== null ? lng.toString() : 'Select on map'}
                    className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Photo Proof Link (URL)</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Paste mock image URL (optional)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-saffron text-slate-950 font-bold rounded-lg hover:bg-orange-400 transition-all text-xs shadow-lg shadow-orange-500/10 cursor-pointer"
              >
                Submit Grievance
              </button>
            </form>

            {/* Location Picker Map */}
            <div className="lg:col-span-2 space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Geo-location Pinner</h3>
                <p className="text-[10px] text-slate-400">Click on the map surface near your village to drop the complaint pin and capture coordinates.</p>
                <div className="h-[300px] rounded-xl overflow-hidden relative">
                  <InteractiveMap 
                    isSelectorMode={true}
                    selectedCoords={lat !== null && lng !== null ? [lat, lng] : null}
                    onCoordsSelect={handleCoordsSelect}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
export default IssueCenter;
