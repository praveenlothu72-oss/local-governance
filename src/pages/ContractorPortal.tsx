import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import type { Contractor, Project, Profile } from '../types';
import { Upload } from 'lucide-react';

interface ContractorPortalProps {
  currentUser: Profile | null;
  refreshTrigger: number;
  triggerRefresh: () => void;
  setActivePage: (page: string) => void;
}

export const ContractorPortal: React.FC<ContractorPortalProps> = ({
  currentUser,
  refreshTrigger,
  triggerRefresh,
  setActivePage
}) => {
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  // Proof Upload Form State
  const [proofType, setProofType] = useState<'progress_photo' | 'after_photo' | 'invoice' | 'completion_certificate'>('progress_photo');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('22.7197');
  const [lng, setLng] = useState('75.8578');

  useEffect(() => {
    const fetchData = async () => {
      const contractors = await db.getContractors();
      
      // Mapped to current user profile
      const contr = contractors.find(c => c.profile_id === currentUser?.id || c.name.toLowerCase().includes('patel'));
      if (contr) {
        setContractor(contr);
        
        const projs = await db.getProjects();
        const contrProjs = projs.filter(p => p.contractor_id === contr.id);
        setProjects(contrProjs);
        if (contrProjs.length > 0) {
          setSelectedProjectId(contrProjs[0].id);
        }
      }
    };
    fetchData();
  }, [currentUser, refreshTrigger]);

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractor || !selectedProjectId || !description.trim()) {
      alert('Please select a project and provide a description.');
      return;
    }

    const defaultMockUrls = {
      progress_photo: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop',
      after_photo: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=600&auto=format&fit=crop',
      invoice: '#mock-invoice',
      completion_certificate: '#mock-certificate'
    };

    const finalFileUrl = fileUrl.trim() || defaultMockUrls[proofType];

    await db.addProjectProof({
      project_id: selectedProjectId,
      proof_type: proofType,
      file_url: finalFileUrl,
      description: description.trim(),
      uploaded_by: currentUser?.id || 'unknown-user',
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    });

    // Reset Form
    setFileUrl('');
    setDescription('');
    triggerRefresh();

    alert(`Success! Digital proof (${proofType.replace('_', ' ')}) has been uploaded and geo-tagged. Status synced to audit log.`);
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-50 border-green-200';
      case 'UNDER_WORK': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (!contractor) {
    return (
      <div className="p-6 text-center text-slate-400 font-sans">
        <p className="text-xs">No contractor profile found. Switch to Rakesh Patel (Contractor) using the header dropdown.</p>
      </div>
    );
  }

  const activeProjects = projects.filter(p => p.status !== 'COMPLETED');

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Scorecard Profile Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-900 text-saffron rounded-full flex items-center justify-center font-black text-xl">
            {contractor.company_name.charAt(0)}
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 text-sm md:text-base leading-tight">{contractor.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{contractor.company_name} | Verified Contractor</p>
          </div>
        </div>

        {/* Ratings grid */}
        <div className="grid grid-cols-3 gap-6 text-center text-xs">
          <div className="px-3 border-r border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block">Public Rating</span>
            <span className="text-sm font-black text-yellow-600 mt-1 flex items-center justify-center gap-0.5">
              ⭐ {contractor.rating}
            </span>
          </div>
          <div className="px-3 border-r border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block">Total Projects</span>
            <span className="text-sm font-black text-slate-800 mt-1 block">{contractor.total_projects}</span>
          </div>
          <div className="px-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block">Complaints</span>
            <span className={`text-sm font-black mt-1 block ${contractor.complaints_count > 2 ? 'text-red-600' : 'text-slate-800'}`}>
              {contractor.complaints_count}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Projects History */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left 3 Columns: Upload proof form */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <Upload size={16} className="text-slate-500" />
              Upload Work Progress & Digital Proof
            </h3>

            {activeProjects.length > 0 ? (
              <form onSubmit={handleUploadProof} className="space-y-4">
                {/* Project selector */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Select Active Project</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {activeProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.category})</option>
                    ))}
                  </select>
                </div>

                {/* Proof Type selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Proof Category</label>
                    <select
                      value={proofType}
                      onChange={(e) => setProofType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="progress_photo">Progress Photo</option>
                      <option value="after_photo">Completion Photo (After)</option>
                      <option value="invoice">Material Bill / Invoice</option>
                      <option value="completion_certificate">Completion Certificate (PDF / Cert)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Photo Link (URL)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://image-url.com"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Geo tags */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Geo-Latitude</label>
                    <input
                      type="text"
                      required
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Geo-Longitude</label>
                    <input
                      type="text"
                      required
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Material Details / Progress Remarks</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide granular specifications: e.g. 'Laid 3-inch layer of dry bituminous concrete over lane 2 coordinates. Invoiced materials are stored in site depot.'"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-saffron text-slate-950 font-bold rounded-lg hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/10"
                >
                  Publish Verified Proof
                </button>
              </form>
            ) : (
              <p className="text-center text-slate-400 py-6">You currently have no active pending projects assigned.</p>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Contractor History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              Project Pipeline History
            </h3>
            
            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
              {projects.map(proj => (
                <div 
                  key={proj.id} 
                  onClick={() => {
                    setActivePage('project-details');
                  }}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 group-hover:text-saffron transition-colors line-clamp-1">{proj.title}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${getStatusColor(proj.status)}`}>
                      {proj.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Budget: <strong>₹{proj.budget_allocated.toLocaleString('en-IN')}</strong></span>
                    {proj.quality_rating && (
                      <span className="text-yellow-600 font-bold">⭐ {proj.quality_rating} Stars</span>
                    )}
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-center text-slate-400 py-6">No historical projects recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ContractorPortal;
