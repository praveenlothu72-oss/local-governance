import React, { useState } from 'react';
import { ChevronRight, Play, RefreshCw, X, HelpCircle } from 'lucide-react';
import { db } from '../services/db';

interface DemoHelperProps {
  activePage: string;
  setActivePage: (page: string) => void;
  currentUserId: string;
  onUserChange: (userId: string) => void;
  triggerRefresh: () => void;
}

export const DemoHelper: React.FC<DemoHelperProps> = ({
  activePage,
  setActivePage,
  currentUserId,
  onUserChange,
  triggerRefresh
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  const demoSteps = [
    {
      step: 1,
      title: 'Citizen Opens Dashboard',
      persona: 'Amit Patel (Citizen)',
      userId: 'u-citizen-1',
      page: 'citizen-dash',
      instructions: 'Explore the main public dashboard representing the citizens portal with dynamic maps and summaries.'
    },
    {
      step: 2,
      title: 'Views Constituency Funds',
      persona: 'Amit Patel (Citizen)',
      userId: 'u-citizen-1',
      page: 'fund-dash',
      instructions: 'Open the Fund Transparency tab to see the 100 Crore allocation broken down by village and category.'
    },
    {
      step: 3,
      title: 'Opens Village Allocation',
      persona: 'Amit Patel (Citizen)',
      userId: 'u-citizen-1',
      page: 'village-dash',
      instructions: 'Navigate to "Village Allocations" and click on Narmada Village to inspect its budget and metrics.'
    },
    {
      step: 4,
      title: 'Checks Project & Proof',
      persona: 'Amit Patel (Citizen)',
      userId: 'u-citizen-1',
      page: 'citizen-dash', // Or project details
      instructions: 'Look for "Main Road Asphaltation" in Narmada Village. View before/after geo-tagged photos and invoice details.',
      customAction: (setPage: any) => {
        setPage('citizen-dash'); // Redirect to citizen dash where they can select the project
      }
    },
    {
      step: 5,
      title: 'Raises Road Issue',
      persona: 'Amit Patel (Citizen)',
      userId: 'u-citizen-1',
      page: 'raise-issue',
      instructions: 'Open "Raise Public Issue". Submit a report: "Damaged Road near Hospital" in Narmada Village. Set urgency to HIGH. Tap map to get geo-coordinates.'
    },
    {
      step: 6,
      title: 'Citizens Upvote Issue',
      persona: 'Amit Patel (Citizen)',
      userId: 'u-citizen-1',
      page: 'vote-issue',
      instructions: 'Navigate to the Civic Voting Center. Locate your raised issue. Upvote it to show community agreement.'
    },
    {
      step: 7,
      title: 'Crosses Upvote Threshold',
      persona: 'Amit Patel (Citizen)',
      userId: 'u-citizen-1',
      page: 'vote-issue',
      instructions: 'For demo purposes, use our shortcut below to simulate 4 other citizens upvoting this issue to cross the threshold of 5!',
      showUpvoteSimulateButton: true
    },
    {
      step: 8,
      title: 'System Auto-Escalation',
      persona: 'Amit Patel (Citizen)',
      userId: 'u-citizen-1',
      page: 'vote-issue',
      instructions: 'The status automatically updates to "ESCALATED" in orange, indicating it has been flagged to district officials.'
    },
    {
      step: 9,
      title: 'Authority Accepts Issue',
      persona: 'Divisional Commissioner (Authority)',
      userId: 'u-authority-1',
      page: 'authority-review',
      instructions: 'Switch profile to Authority. Review the escalated issue, click "Accept", allocate Rs. 15,00,000, and assign to Patel Infrastructure. This automatically generates a project!'
    },
    {
      step: 10,
      title: 'Contractor Work Proof',
      persona: 'Rakesh Patel (Contractor)',
      userId: 'u-contractor-patel',
      page: 'contractor-upload',
      instructions: 'Switch profile to Contractor. Locate the newly assigned project, click "Update Work", upload a progress photo or completion certificate and input geo-tags.'
    },
    {
      step: 11,
      title: 'Project Status Completed',
      persona: 'Divisional Commissioner (Authority)',
      userId: 'u-authority-1',
      page: 'authority-review',
      instructions: 'Switch back to Authority, inspect the contractor proofs, and change the project status to "COMPLETED".'
    },
    {
      step: 12,
      title: 'Citizen Quality Rating',
      persona: 'Amit Patel (Citizen)',
      userId: 'u-citizen-1',
      page: 'citizen-dash',
      instructions: 'Return to Citizen dashboard, click the completed project, and rate the contractor\'s work quality. Observe the updated metrics!'
    }
  ];

  const handleNextStep = () => {
    if (currentStep < demoSteps.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      executeStepActions(next);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      executeStepActions(prev);
    }
  };

  const executeStepActions = (stepNum: number) => {
    const step = demoSteps.find(s => s.step === stepNum);
    if (!step) return;

    // Switch simulated user
    if (currentUserId !== step.userId) {
      onUserChange(step.userId);
    }
    // Navigate to page
    if (activePage !== step.page) {
      setActivePage(step.page);
    }
    if (step.customAction) {
      step.customAction(setActivePage);
    }
  };

  const handleSimulateUpvotes = async () => {
    // Look for the "Damaged Road near Hospital" issue in local storage issues
    const issues = await db.getIssues();
    const targetIssue = issues.find(i => i.title.toLowerCase().includes('hospital') || i.title.toLowerCase().includes('damaged'));
    
    if (targetIssue) {
      // Simulate upvotes by other mock users
      const mockUsers = ['u-citizen-2', 'u-citizen-3', 'u-citizen-4', 'u-mla-1'];
      for (const uId of mockUsers) {
        await db.upvoteIssue(targetIssue.id, uId);
      }
      triggerRefresh();
      alert('Simulated upvotes added! The issue upvote count has been increased by 4, crossing the escalation threshold.');
      setCurrentStep(8);
      executeStepActions(8);
    } else {
      alert('Please raise the issue "Damaged Road near Hospital" first (Step 5) to simulate upvotes on it!');
    }
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all mock database changes back to the default demo seed?')) {
      db.resetSimulationData();
      triggerRefresh();
      setCurrentStep(1);
      executeStepActions(1);
      alert('Mock data has been reset successfully!');
    }
  };

  return (
    <div className={`
      fixed bottom-4 right-4 z-50 transition-all duration-300 font-sans
      ${isOpen ? 'w-80 md:w-96' : 'w-12 h-12'}
    `}>
      {isOpen ? (
        <div className="bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <HelpCircle className="text-saffron" size={18} />
              <span className="font-bold text-xs tracking-wider text-slate-100 uppercase">Interactive Pitch Guide</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleResetData}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Reset Database Seed"
              >
                <RefreshCw size={14} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Step {currentStep} of 12</span>
              <span className="px-2 py-0.5 font-semibold text-[9px] rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Active Pitch Flow
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 bg-saffron text-slate-950 rounded-full text-[10px] font-black">{currentStep}</span>
                {demoSteps[currentStep-1].title}
              </h3>
              <div className="text-[10px] text-slate-400 flex flex-col gap-0.5">
                <span>Role: <strong className="text-slate-200">{demoSteps[currentStep-1].persona}</strong></span>
                <span>Location: <strong className="text-slate-200">/ {demoSteps[currentStep-1].page}</strong></span>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
              {demoSteps[currentStep-1].instructions}
            </p>

            {/* Custom Interactive Action Triggers inside Guide */}
            {demoSteps[currentStep-1].showUpvoteSimulateButton && (
              <button
                onClick={handleSimulateUpvotes}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-saffron text-slate-950 font-bold rounded-lg hover:bg-orange-400 transition-colors shadow-lg shadow-orange-600/20"
              >
                <Play size={12} fill="currentColor" />
                <span>Simulate 4 Citizen Upvotes</span>
              </button>
            )}

            {/* Steps Timeline Mini View */}
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Demo Timeline Progress</p>
              <div className="grid grid-cols-6 gap-1">
                {demoSteps.map(s => (
                  <button
                    key={s.step}
                    onClick={() => {
                      setCurrentStep(s.step);
                      executeStepActions(s.step);
                    }}
                    className={`
                      h-1.5 rounded transition-all
                      ${s.step === currentStep 
                        ? 'bg-saffron ring-1 ring-orange-400' 
                        : s.step < currentStep 
                          ? 'bg-emerald-500' 
                          : 'bg-slate-700'}
                    `}
                    title={`Step ${s.step}: ${s.title}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between p-3 bg-slate-950 border-t border-slate-800">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="px-3 py-1.5 bg-slate-800 rounded font-semibold text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            
            <button
              onClick={() => {
                executeStepActions(currentStep);
              }}
              className="text-[10px] text-saffron underline hover:text-orange-400 font-semibold"
            >
              Sync Current View
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStep === demoSteps.length}
              className="flex items-center gap-1 px-3 py-1.5 bg-saffron text-slate-950 rounded font-bold hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-slate-900 text-white shadow-2xl flex items-center justify-center hover:bg-slate-800 border border-slate-700 hover:scale-105 transition-all"
          title="Open Pitch Assistant"
        >
          <HelpCircle className="text-saffron animate-pulse" size={24} />
        </button>
      )}
    </div>
  );
};
export default DemoHelper;
