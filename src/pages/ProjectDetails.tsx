import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import type { Project, ProjectProof, Contractor, Comment, Profile } from '../types';
import { 
  Star, MapPin, Calendar, User, FileText, 
  MessageSquare, Send, ArrowLeft, ShieldAlert, Award
} from 'lucide-react';

interface ProjectDetailsProps {
  projectId: string;
  setActivePage: (page: string) => void;
  currentUser: Profile | null;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  projectId,
  setActivePage,
  currentUser,
  refreshTrigger,
  triggerRefresh
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [proofs, setProofs] = useState<ProjectProof[]>([]);
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [userRating, setUserRating] = useState<number>(0);
  const [villageName, setVillageName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      const projs = await db.getProjects();
      const proj = projs.find(p => p.id === projectId);
      if (!proj) return;

      setProject(proj);

      const prfs = await db.getProjectProofs(projectId);
      setProofs(prfs);

      const contractorsList = await db.getContractors();
      const contr = contractorsList.find(c => c.id === proj.contractor_id);
      if (contr) setContractor(contr);

      const comms = await db.getComments(projectId, 'project');
      setComments(comms);

      const villages = await db.getVillages();
      const vill = villages.find(v => v.id === proj.village_id);
      if (vill) setVillageName(vill.name);
    };
    fetchData();
  }, [projectId, refreshTrigger]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !project || !currentUser) return;

    await db.addComment({
      project_id: project.id,
      issue_id: null,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      comment: newComment.trim()
    });

    setNewComment('');
    triggerRefresh();
  };

  const handleRateQuality = async (stars: number) => {
    if (!project) return;
    setUserRating(stars);
    await db.rateProjectQuality(project.id, stars);
    triggerRefresh();
    alert(`Thank you! You rated the quality of this work ${stars} Stars.`);
  };

  if (!project) {
    return (
      <div className="p-6 text-center text-slate-400 font-sans">
        <p className="text-xs">No project selected. Select a project from the Citizen Dashboard to audit details.</p>
        <button 
          onClick={() => setActivePage('citizen-dash')}
          className="mt-4 px-4 py-2 bg-saffron text-slate-950 font-bold rounded-lg text-xs"
        >
          Go to Citizen Dashboard
        </button>
      </div>
    );
  }

  const beforePhoto = proofs.find(p => p.proof_type === 'before_photo')?.file_url;
  const afterPhoto = proofs.find(p => p.proof_type === 'after_photo')?.file_url || proofs.find(p => p.proof_type === 'progress_photo')?.file_url;
  const invoiceProof = proofs.find(p => p.proof_type === 'invoice');

  // Format currency
  const formatINR = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* Back Button & Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setActivePage('citizen-dash')}
          className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-[10px] font-bold text-saffron uppercase tracking-wider">{villageName} Development Registry</span>
          <h2 className="font-extrabold text-slate-800 text-sm md:text-base leading-tight mt-0.5">{project.title}</h2>
        </div>
      </div>

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Proofs & Comments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Work Proof Gallery (Before / After) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Before & After Photo Proofs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before */}
              <div className="space-y-1.5">
                <span className="px-2 py-0.5 font-bold text-[9px] rounded bg-red-100 text-red-800 border border-red-200 uppercase">Before Project</span>
                <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                  {beforePhoto ? (
                    <img src={beforePhoto} alt="Before work" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo Uploaded</div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {proofs.find(p => p.proof_type === 'before_photo')?.description || 'No description uploaded.'}
                </p>
              </div>

              {/* After */}
              <div className="space-y-1.5">
                <span className="px-2 py-0.5 font-bold text-[9px] rounded bg-green-100 text-green-800 border border-green-200 uppercase">After / Progress</span>
                <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                  {afterPhoto ? (
                    <img src={afterPhoto} alt="After work" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo Uploaded</div>
                  )}
                  {project.status === 'COMPLETED' && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white font-bold text-[8px] tracking-wider uppercase px-2 py-0.5 rounded shadow">
                      Verified Completed
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {proofs.find(p => p.proof_type === 'after_photo')?.description || proofs.find(p => p.proof_type === 'progress_photo')?.description || 'No description uploaded.'}
                </p>
              </div>
            </div>

            {/* Geo tags summary */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-slate-400" />
                Geo-Coordinates: <strong>22.7197° N, 75.8578° E</strong>
              </span>
              <span className="text-emerald-600 font-bold">✔️ Verified Geo-tagged</span>
            </div>
          </div>

          {/* Styled Invoice Details */}
          {invoiceProof && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-slate-500" />
                  Contractor Invoice & Audit Details
                </h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border font-semibold border-slate-200">Receipt Verified</span>
              </div>
              
              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-3 font-mono text-[10px] text-slate-600">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span>INVOICE #PAT-2025-089</span>
                  <span>DATE: 2025-09-29</span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>1. Bitumen / Asphalt materials (500 Tons)</span>
                    <span className="font-bold text-slate-800">₹85,00,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. Excavation Machinery & Steamroller Rental</span>
                    <span className="font-bold text-slate-800">₹40,00,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3. Drain bricks & Gutter reinforcement cement</span>
                    <span className="font-bold text-slate-800">₹50,00,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>4. Construction labor and engineers overhead</span>
                    <span className="font-bold text-slate-800">₹25,00,000</span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-xs text-slate-800">
                  <span>TOTAL AMOUNT AUDITED</span>
                  <span>{formatINR(project.budget_allocated)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={14} className="text-slate-500" />
              Citizen Comments & Feedback ({comments.length})
            </h3>

            {/* List */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {comments.length > 0 ? (
                comments.map(c => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800">{c.user_name}</span>
                      <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 leading-normal">{c.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 text-xs py-4">No citizen comments posted on this project yet.</p>
              )}
            </div>

            {/* Post comment form */}
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your feedback or report visual defects..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-saffron"
              />
              <button
                type="submit"
                className="px-3 bg-saffron text-slate-950 rounded-lg font-bold hover:bg-orange-400 transition-colors flex items-center justify-center"
              >
                <Send size={12} />
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Project financials & quality rating */}
        <div className="space-y-6">
          
          {/* Project Details Panel */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Project Summary</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Description</p>
                <p className="text-slate-600 mt-0.5 leading-normal">{project.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Category</p>
                  <p className="font-bold text-slate-700 mt-0.5">{project.category}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Status</p>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded mt-0.5 ${
                    project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' 
                    : project.status === 'UNDER_WORK' ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-blue-100 text-blue-800'
                  }`}>{project.status}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Allocated Budget</span>
                  <span className="font-bold text-slate-800">{formatINR(project.budget_allocated)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Spent</span>
                  <span className="font-bold text-slate-800">{formatINR(project.amount_spent)}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mt-1">
                  <div 
                    className={`h-full rounded-full ${project.amount_spent > project.budget_allocated ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min((project.amount_spent / project.budget_allocated) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar size={12} />
                  <span>Start Date: <strong>{project.start_date || 'TBD'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar size={12} />
                  <span>Expected End: <strong>{project.expected_end_date || 'TBD'}</strong></span>
                </div>
                {project.actual_end_date && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar size={12} />
                    <span>Completed Date: <strong>{project.actual_end_date}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quality Audit Rating (Citizen Input) */}
          {project.status === 'COMPLETED' && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 space-y-4">
              <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-saffron flex items-center gap-1">
                <Award size={14} />
                Citizen Quality Review
              </h3>
              <p className="text-xs text-slate-300 leading-normal">
                If you live in {villageName}, have you inspected this road/facility? Rate the construction quality to hold the contractor accountable.
              </p>
              
              <div className="flex justify-center items-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => handleRateQuality(stars)}
                    className="p-1 hover:scale-110 active:scale-95 transition-all text-yellow-400"
                  >
                    <Star 
                      size={28} 
                      fill={stars <= (userRating || project.quality_rating || 0) ? 'currentColor' : 'none'} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-[10px] text-slate-400">
                Current audit rating: <strong>{project.quality_rating || 'Unrated'} Stars</strong>
              </p>
            </div>
          )}

          {/* Contractor Details */}
          {contractor && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                <User size={14} className="text-slate-500" />
                Assigned Contractor
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                    {contractor.company_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{contractor.name}</h4>
                    <p className="text-[10px] text-slate-400">{contractor.company_name}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2 space-y-1 text-slate-500">
                  <div className="flex justify-between">
                    <span>Contact:</span>
                    <strong className="text-slate-700">{contractor.phone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Rating:</span>
                    <strong className="text-yellow-600 flex items-center gap-0.5">⭐ {contractor.rating}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Projects:</span>
                    <strong className="text-slate-700">{contractor.total_projects} projects</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality Complaints:</span>
                    <strong className={`${contractor.complaints_count > 2 ? 'text-red-600' : 'text-slate-700'}`}>
                      {contractor.complaints_count} issues flagged
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Complaint Button */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
            <h4 className="font-bold text-red-800 text-xs flex items-center gap-1.5">
              <ShieldAlert size={14} />
              Report Quality Defect / Corruption
            </h4>
            <p className="text-[10px] text-red-600 leading-normal">
              If citizens report poor material quality, cracks, or financial leaks after project completion, a formal complaint audit is launched against the contractor.
            </p>
            <button
              onClick={() => setActivePage('raise-issue')}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors shadow shadow-red-500/10"
            >
              Raise Complaint Against Project
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
export default ProjectDetails;
