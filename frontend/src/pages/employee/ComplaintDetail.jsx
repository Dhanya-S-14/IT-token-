import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { complaintService } from '../../services/complaintService';
import { getSummary, getSuggestedReply, getRCA } from '../../services/aiService';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, AlertCircle, User, ArrowRight, Calendar, Tag, Sparkles, Loader2, Copy, Check, Wrench, ShieldCheck, Zap } from 'lucide-react';

const statusColors = {
  'Pending': 'warning', 'Assigned': 'info', 'In Progress': 'info',
  'Resolved': 'success', 'Rejected': 'destructive', 'Closed': 'default'
};

const statusIcons = {
  'Pending': Clock, 'Assigned': User, 'In Progress': AlertCircle,
  'Resolved': CheckCircle, 'Rejected': AlertCircle, 'Closed': CheckCircle
};

export default function ComplaintDetail() {
  const { id } = useParams();
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [smartReply, setSmartReply] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [rcaData, setRcaData] = useState(null);
  const [rcaLoading, setRcaLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rcaCopied, setRcaCopied] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await complaintService.getById(id);
        setComplaint(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleSummary = async () => {
    setSummaryLoading(true);
    try {
      const summary = await getSummary(id);
      setAiSummary(summary);
    } catch {
      toast.error('Failed to generate summary');
    }
    setSummaryLoading(false);
  };

  const handleSmartReply = async () => {
    setReplyLoading(true);
    try {
      const reply = await getSuggestedReply(id);
      setSmartReply(reply);
    } catch {
      toast.error('Failed to generate reply');
    }
    setReplyLoading(false);
  };

  const handleGenerateRCA = async () => {
    if (!complaint) return;
    setRcaLoading(true);
    try {
      const rca = await getRCA({
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        priority: complaint.priority,
        complaintId: id
      });
      setRcaData(rca);
      toast.success('AI Root Cause Analysis generated!');
    } catch {
      toast.error('Failed to generate RCA');
    } finally {
      setRcaLoading(false);
    }
  };

  const copyRcaToClipboard = () => {
    if (!rcaData) return;
    const text = `ROOT CAUSE ANALYSIS:\n${rcaData.rootCause}\n\nRESOLUTION STEPS:\n${rcaData.resolutionSteps?.map((s, i) => `${i+1}. ${s}`).join('\n')}\n\nPREVENTIVE ACTION:\n${rcaData.preventiveAction}\n\nESTIMATED RESOLUTION TIME: ${rcaData.estimatedTime}`;
    navigator.clipboard.writeText(text);
    setRcaCopied(true);
    toast.success('RCA Playbook copied to clipboard!');
    setTimeout(() => setRcaCopied(false), 2000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!complaint) return <div className="text-center py-12 text-gray-500">Complaint not found</div>;

  const statusOrder = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  const currentIndex = statusOrder.indexOf(complaint.status);
  const progress = complaint.status === 'Rejected' ? 100 : ((currentIndex + 1) / statusOrder.length) * 100;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complaint Details</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Token: <span className="font-mono text-primary">{complaint.token}</span></p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{complaint.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{complaint.category} - {complaint.department}</p>
              </div>
              <Badge variant={statusColors[complaint.status]} className="text-sm px-3 py-1">{complaint.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <span className="flex items-center gap-1 text-gray-500"><Tag className="w-4 h-4" /> {complaint.priority} Priority</span>
              <span className="flex items-center gap-1 text-gray-500"><Calendar className="w-4 h-4" /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
              {complaint.assignedEngineer && <span className="flex items-center gap-1 text-gray-500"><User className="w-4 h-4" /> {complaint.assignedEngineer}</span>}
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{complaint.description}</p>
            {complaint.screenshot && (
              <div className="mt-4">
                <img src={complaint.screenshot} alt="Screenshot" className="max-w-sm rounded-lg border" />
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Timeline</h3>
            <div className="relative mb-6">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${complaint.status === 'Rejected' ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                {statusOrder.map((s, i) => (
                  <span key={s} className={`${i <= currentIndex && complaint.status !== 'Rejected' ? 'text-primary font-medium' : ''}`}>{s}</span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {complaint.timeline?.map((entry, i) => {
                const Icon = statusIcons[entry.status] || Clock;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === complaint.timeline.length - 1 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {i < complaint.timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700" />}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.status}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(entry.timestamp).toLocaleString()}</p>
                      {entry.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{entry.notes}</p>}
                      {entry.updatedBy && <p className="text-xs text-gray-500 mt-0.5">by {entry.updatedBy}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Employee</dt><dd className="text-gray-900 dark:text-white">{complaint.employeeName}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Employee ID</dt><dd className="text-gray-900 dark:text-white">{complaint.employeeId}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Department</dt><dd className="text-gray-900 dark:text-white">{complaint.department}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Engineer</dt><dd className="text-gray-900 dark:text-white">{complaint.assignedEngineer || 'Not assigned'}</dd></div>
              {complaint.estimatedResolutionDate && (
                <div className="flex justify-between"><dt className="text-gray-500">Est. Resolution</dt><dd className="text-gray-900 dark:text-white">{new Date(complaint.estimatedResolutionDate).toLocaleDateString()}</dd></div>
              )}
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Summary</h3>
              <button onClick={handleSummary} disabled={summaryLoading} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50">
                {summaryLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {aiSummary ? 'Regenerate' : 'Generate'}
              </button>
            </div>
            {aiSummary ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{aiSummary}</p>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">Click generate to get an AI-powered summary of this complaint.</p>
            )}
          </div>

          {/* AI Root Cause Analysis & Remediation Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">AI Root Cause & RCA</h3>
                  <span className="text-[10px] text-gray-500">Autonomous Diagnostic</span>
                </div>
              </div>
              <button
                onClick={handleGenerateRCA}
                disabled={rcaLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                {rcaLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {rcaData ? 'Regenerate' : 'Analyze RCA'}
              </button>
            </div>

            {rcaData ? (
              <div className="space-y-3.5 text-xs text-gray-700 dark:text-gray-300">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-600/60">
                  <span className="font-semibold text-gray-900 dark:text-white block mb-1">Likely Root Cause:</span>
                  <p className="leading-relaxed">{rcaData.rootCause}</p>
                </div>

                {rcaData.resolutionSteps?.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block mb-1.5">Action Plan / Fix:</span>
                    <ol className="space-y-1 list-decimal list-inside text-gray-600 dark:text-gray-300">
                      {rcaData.resolutionSteps.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {rcaData.preventiveAction && (
                  <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-gray-800 dark:text-gray-200">Prevention:</strong> {rcaData.preventiveAction}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-mono text-[11px]">
                      ETR: {rcaData.estimatedTime || '15-30m'}
                    </span>
                    {rcaData.severityAssessment && (
                      <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-medium text-[11px]">
                        {rcaData.severityAssessment}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={copyRcaToClipboard}
                    className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                  >
                    {rcaCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {rcaCopied ? 'Copied' : 'Copy RCA'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                Generate automated root cause analysis and engineer resolution playbook.
              </p>
            )}
          </div>


          {isAdmin && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Smart Reply</h3>
                <button onClick={handleSmartReply} disabled={replyLoading} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50">
                  {replyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {smartReply ? 'Regenerate' : 'Suggest'}
                </button>
              </div>
              {smartReply ? (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{smartReply}</p>
                  <button onClick={() => copyToClipboard(smartReply)} className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy to clipboard'}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">Generate an AI-suggested reply for this complaint.</p>
              )}
            </div>
          )}

          {complaint.adminRemarks && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Admin Remarks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{complaint.adminRemarks}</p>
            </div>
          )}

          {complaint.engineerNotes && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Engineer Notes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{complaint.engineerNotes}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
