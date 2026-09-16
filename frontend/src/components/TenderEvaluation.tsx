import React, { useState, useEffect } from 'react';
import { getTenderEvaluation, evaluateTender, EvaluationResult, RuleResult } from '../api';

interface TenderEvaluationProps {
  organizationId: string;
  tenderId: string;
  documentId?: string;
  tenderTitle?: string;
}

export const TenderEvaluation: React.FC<TenderEvaluationProps> = ({ 
  organizationId, 
  tenderId, 
  documentId,
  tenderTitle = 'Unknown Tender'
}) => {
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvaluation() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTenderEvaluation(organizationId, tenderId, documentId);
        setEvaluation(data);
      } catch (err) {
        setError('Failed to load the evaluation. Please check your network or access permissions.');
      } finally {
        setLoading(false);
      }
    }
    fetchEvaluation();
  }, [organizationId, tenderId, documentId]);

  const handleRunEvaluation = async () => {
    if (!documentId) {
      setError('Cannot evaluate: No document attached to this tender.');
      return;
    }
    setEvaluating(true);
    setError(null);
    try {
      const data = await evaluateTender(organizationId, tenderId, documentId);
      setEvaluation(data);
    } catch (err) {
      setError('An error occurred while evaluating the tender.');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading evaluation...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No evaluation available</h2>
        <p className="text-gray-500 mb-6">This tender has not been evaluated yet, or the data is unavailable.</p>
        {documentId && (
          <button 
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className={`px-4 py-2 rounded font-medium text-white ${evaluating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {evaluating ? 'Evaluating (This may take a minute)...' : 'Run AI Evaluation'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* HEADER */}
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Tender Evaluation Dashboard</h1>
        <p className="text-gray-500 mt-1">Tender: <span className="font-medium text-gray-700">{tenderTitle}</span></p>
      </header>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Match Score</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{evaluation.matchScore} / 100</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Eligibility</h3>
          <p className={`mt-2 text-xl font-bold uppercase
            ${evaluation.eligibilityStatus === 'ELIGIBLE' ? 'text-green-600' : 
              evaluation.eligibilityStatus === 'INELIGIBLE' ? 'text-red-600' : 
              'text-yellow-600'}`}
          >
            {evaluation.eligibilityStatus}
          </p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Evidence Coverage</h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">{evaluation.evidenceCoverage.toFixed(0)}%</p>
          <p className="text-xs text-gray-400 mt-1">Evaluated rules supported by validated evidence</p>
        </div>
      </section>

      {/* RULE RESULTS */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Rule-by-Rule Evaluation</h2>
        <div className="space-y-4">
          {evaluation.ruleResults.map((rule) => (
            <RuleCard key={rule.rule_id} rule={rule} />
          ))}
        </div>
      </section>
    </div>
  );
};

// Extracted Sub-Component for expand/collapse interaction
const RuleCard: React.FC<{ rule: RuleResult }> = ({ rule }) => {
  const [expanded, setExpanded] = useState(false);
  const isPass = rule.status === 'PASS';
  const isFail = rule.status === 'FAIL';
  
  const statusColor = isPass ? 'bg-green-100 text-green-800 border-green-200' 
                    : isFail ? 'bg-red-100 text-red-800 border-red-200' 
                    : 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${expanded ? 'border-blue-300 ring-1 ring-blue-300' : 'border-gray-200'}`}>
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-4 bg-white hover:bg-gray-50 flex justify-between items-center focus:outline-none"
        aria-expanded={expanded}
      >
        <div className="flex-1 pr-4">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${statusColor}`}>
              {rule.status}
            </span>
            {rule.is_mandatory && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-xs font-medium">
                Mandatory
              </span>
            )}
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 rounded">
              {rule.requirement_type}
            </span>
          </div>
          <h3 className="text-gray-900 font-medium leading-snug">{rule.requirement_text}</h3>
        </div>
        <span className="text-gray-400">
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-100 text-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Organization Value</p>
              <p className="mt-1 text-gray-800">{rule.organization_value || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">AI Reasoning</p>
              <p className="mt-1 text-gray-800">{rule.reason}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Tender Evidence</p>
            {rule.evidence && rule.evidence.length > 0 ? (
              <div className="space-y-3">
                {rule.evidence.map((citation, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded p-3 shadow-sm">
                    <blockquote className="border-l-4 border-blue-400 pl-3 text-gray-700 italic">
                      "{citation.excerpt}"
                    </blockquote>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="font-semibold bg-gray-100 px-1.5 py-0.5 rounded">
                        Page {citation.page_start}{citation.page_end > citation.page_start ? `-${citation.page_end}` : ''}
                      </span>
                      {citation.section_heading && (
                        <span>Section: <span className="font-medium">{citation.section_heading}</span></span>
                      )}
                      {citation.validation_status === 'VALID' && (
                        <span className="text-green-600 flex items-center ml-auto">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                          Validated
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic bg-white p-3 rounded border border-gray-200">
                No validated evidence available in the document.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};