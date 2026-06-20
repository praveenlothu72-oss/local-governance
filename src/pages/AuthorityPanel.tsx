import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import type { Issue, Project, Village } from '../types';
import { ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

interface AuthorityPanelProps {
  refreshTrigger: number;
  triggerRefresh: () => void;
  setActivePage: (page: string) => void;
}

export const AuthorityPanel: React.FC<AuthorityPanelProps> = ({
  refreshTrigger,
  triggerRefresh,
  setActivePage
}) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Accept issue form state
  const [department, setDepartment] = useState('Public Works Department');
  const [allocatedBudget, setAllocatedBudget] = useState('1500000'); // Default 15 Lakhs
  const [remark, setRemark] = useState('');

  // Reject issue state
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const iss = await db.getIssues();
      const projs = await db.getProjects();
      const vills = await db.getVillages();
      setIssues(iss.filter(i => i.status !== 'COMPLETED' && i.status !== 'REJECTED'));
      setProjects(projs.filter(p => p.status !== 'COMPLETED' && p.status !== 'REJECTED'));
      setVillages(vills);
    };
    fetchData();
  }, [refreshTrigger]);

  const handleAcceptIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueId) return;

    await db.updateIssueStatus(
      selectedIssueId,
      'ACCEPTED',
      remark || 'Issue accepted for resolution',
      department,
      parseInt(allocatedBudget)
    );

    setSelectedIssueId(null);
    setRemark('');
    triggerRefresh();
    alert('Success! Issue has been accepted and a formal project has been launched with designated funding.');
  };

  const handleRejectIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueId || !rejectReason.trim()) return;

    await db.updateIssueStatus(selectedIssueId, 'REJECTED', rejectReason.trim());
    setSelectedIssueId(null);
    setRejectReason('');
    setShowRejectForm(false);
    triggerRefresh();
    alert('Issue has been rejected and archived.');
  };

  const handleVerifyProjectCompletion = async (projId: string) => {
    await db.updateProjectStatus(projId, 'COMPLETED');
    triggerRefresh();
    alert('Project verified and closed. Citizens can now rate the quality of the execution.');
  };

  const getVillageName = (vId: string) => {
    return villages.find(v => v.id === vId)?.name || 'Unknown Village';
  };

  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Introduction */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <h2 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
          <ShieldCheck className="text-emerald-600" size={20} />
          District Authority Review Panel
        </h2>
        <p className="text-xs text-slate-500">Authorized control room for the Divisional Commissioner to approve escalated complaints and audit completed structures.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left 3 Columns: Active Escalations list */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              Escalated Citizen Grievance Pipeline
            </h3>
            
            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
              {issues.map(issue => (
                <div 
                  key={issue.id}
                  onClick={() => {
                    setSelectedIssueId(issue.id);
                    setShowRejectForm(false);
                  }}
                  className={`
                    p-4 bg-slate-50 border rounded-xl hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between space-y-3
                    ${selectedIssueId === issue.id ? 'border-saffron bg-orange-50/10' : 'border-slate-100'}
                  `}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-500">{getVillageName(issue.village_id)}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                      issue.escalation_status === 'ESCALATED' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-slate-100 text-slate-600'
                    }`}>{issue.escalation_status}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs">⚠️ {issue.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{issue.description}</p>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100/50">
                    <span>👍 {issue.upvote_count} Citizen Upvotes</span>
                    <span className="font-bold text-saffron flex items-center gap-0.5">Review Issue <ChevronRight size={12} /></span>
                  </div>
                </div>
              ))}
              {issues.length === 0 && (
                <p className="text-center text-slate-400 text-xs py-8">No escalated issues pending review.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Action details form */}
        <div className="lg:col-span-2 space-y-6">
          
          {selectedIssue ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Grievance Action Center</h3>
                <button 
                  onClick={() => setSelectedIssueId(null)} 
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  Close
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                <p className="font-bold text-slate-800 text-xs">⚠️ {selectedIssue.title}</p>
                <p className="text-slate-500 leading-normal">{selectedIssue.description}</p>
              </div>

              {!showRejectForm ? (
                <form onSubmit={handleAcceptIssue} className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Assign Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="Public Works Department">Public Works Department (Roads)</option>
                      <option value="Water Resources Department">Water Resources Department (Water)</option>
                      <option value="Electrical & Council Grid">Electrical & Council Grid (Streetlights)</option>
                      <option value="Municipal Sewer Board">Municipal Sewer Board (Drainage)</option>
                      <option value="Education Authority">Education Authority (Schools)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Allocate Budget Amount (INR)</label>
                    <input
                      type="number"
                      required
                      value={allocatedBudget}
                      onChange={(e) => setAllocatedBudget(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Resolution Instructions / Remark</label>
                    <textarea
                      rows={3}
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      placeholder="e.g. Approved. Launching immediate pipeline excavations. Assigned to Patel Infrastructure."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg border border-red-200 transition-colors"
                    >
                      Reject Issue
                    </button>
                    <button
                      type="submit"
                      className="py-2.5 bg-saffron hover:bg-orange-400 text-slate-950 font-bold rounded-lg transition-colors"
                    >
                      Accept & Launch Project
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRejectIssue} className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-bold text-red-800 block">Rejection Justification</label>
                    <textarea
                      required
                      rows={4}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Explain the legal or administrative reason why this issue cannot be accepted (e.g., duplicate complaint, privately owned structure, etc.)"
                      className="w-full px-3 py-2 border border-red-200 focus:border-red-500 rounded-lg text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                    >
                      Back to Approval
                    </button>
                    <button
                      type="submit"
                      className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </form>
              )}

            </div>
          ) : (
            /* Close Completed Projects Panel */
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                Verify Project Completion proofs
              </h3>
              
              <div className="space-y-3 overflow-y-auto max-h-[350px]">
                {projects.map(proj => (
                  <div 
                    key={proj.id} 
                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-3"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 leading-tight">{proj.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{getVillageName(proj.village_id)} | Category: {proj.category}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/50 pt-2">
                      <button
                        onClick={() => {
                          setActivePage('project-details');
                        }}
                        className="text-saffron hover:underline font-bold"
                      >
                        Inspect Proof Gallery
                      </button>

                      <button
                        onClick={() => handleVerifyProjectCompletion(proj.id)}
                        className="flex items-center gap-1 py-1 px-2.5 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle2 size={10} />
                        <span>Verify & Close</span>
                      </button>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-center text-slate-400 py-6">No completed projects awaiting verification.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default AuthorityPanel;
