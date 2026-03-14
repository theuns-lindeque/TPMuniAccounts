'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import { saveFeedbackAction } from '@/app/(main)/actions/feedback';

interface RisksPanelProps {
  report: any;
}

export const RisksPanel = ({ report }: RisksPanelProps) => {
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRisk || !feedback) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('analysisReportId', report.id);
    formData.append('fieldCorrected', 'Risk Anomaly');
    formData.append('oldValue', selectedRisk);
    formData.append('newValue', 'User Correction');
    formData.append('userNotes', feedback);

    await saveFeedbackAction(formData);
    
    setFeedback('');
    setSelectedRisk(null);
    setIsSubmitting(false);
    alert('Feedback submitted. The AI will learn from this correction.');
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-md p-4 h-full bg-white dark:bg-slate-950 overflow-y-auto">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-3 h-3 text-amber-500" />
        Anomalies & Risks
      </h3>

      <div className="space-y-3">
        {report.anomaliesFound?.map((risk: string, idx: number) => (
          <div key={idx} className="p-3 border border-slate-100 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-900/50 relative group">
            <p className="text-sm text-slate-700 dark:text-slate-300 pr-20">{risk}</p>
            <button 
              onClick={() => setSelectedRisk(risk)}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase tracking-tight text-teal-600 hover:text-teal-700 underline"
            >
              Correct AI
            </button>
          </div>
        ))}
      </div>

      {selectedRisk && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Refine AI Analysis</h4>
            <p className="text-xs text-slate-500 mb-4 font-mono p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
              "{selectedRisk}"
            </p>
            
            <textarea
              className="w-full h-32 text-sm p-3 border border-slate-200 dark:border-slate-800 rounded bg-transparent focus:ring-2 focus:ring-teal-500 focus:outline-none mb-4 placeholder:text-slate-400"
              placeholder="Add context or explain why this is a mistake..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />

            <div className="flex gap-2 justify-end">
              <button 
                type="button"
                onClick={() => setSelectedRisk(null)}
                className="px-4 py-2 text-xs font-bold uppercase text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold uppercase bg-teal-500 hover:bg-teal-600 text-white rounded shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
