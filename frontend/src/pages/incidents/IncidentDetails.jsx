import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { incidentService } from '../../services/incidentService';
import { slaService } from '../../services/slaService';
import { userService } from '../../services/userService';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatDate, formatTimeLeft, getStatusColor, getPriorityColor, cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, User, AlertCircle, CheckCircle, XCircle,
  MessageSquare, Activity, Send, Loader2, Calendar
} from 'lucide-react';

function getStatusVariant(status) {
  const map = { open: 'info', in_progress: 'warning', resolved: 'success', closed: 'secondary', pending: 'warning', approved: 'success', rejected: 'destructive' };
  return map[status] || 'default';
}

function getPriorityLabel(p) {
  return p ? p.charAt(0).toUpperCase() + p.slice(1) : '';
}

function getSlaStatusVariant(status) {
  const map = { active: 'info', warning: 'warning', breached: 'destructive', met: 'success' };
  return map[status] || 'default';
}

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin, isManager } = useAuth();
  const [comment, setComment] = useState('');
  const [assignUserId, setAssignUserId] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const { data: incidentData, isLoading, isError } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentService.getById(id),
    enabled: !!id,
  });

  const { data: slaData } = useQuery({
    queryKey: ['sla', id],
    queryFn: () => slaService.getByIncident(id),
    enabled: !!id,
  });

  const { data: engineersData } = useQuery({
    queryKey: ['engineers'],
    queryFn: () => userService.getAll({ role: 'engineer' }),
    enabled: isAdmin || isManager,
  });

  const incident = incidentData?.data?.data;
  const sla = slaData?.data?.data;
  const engineers = engineersData?.data?.data || [];

  const assignMutation = useMutation({
    mutationFn: (data) => incidentService.assign(id, data),
    onSuccess: () => {
      toast.success('Incident assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      setAssignUserId('');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to assign incident');
    },
    onSettled: () => setSubmittingAssign(false),
  });

  const resolveMutation = useMutation({
    mutationFn: (data) => incidentService.update(id, { ...data, status: 'resolved' }),
    onSuccess: () => {
      toast.success('Incident resolved');
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to resolve incident');
    },
  });

  const closeMutation = useMutation({
    mutationFn: (data) => incidentService.close(id, data),
    onSuccess: () => {
      toast.success('Incident closed');
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to close incident');
    },
  });

  const commentMutation = useMutation({
    mutationFn: (data) => incidentService.update(id, data),
    onSuccess: () => {
      toast.success('Comment added');
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      setComment('');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to add comment');
    },
    onSettled: () => setSubmittingComment(false),
  });

  const handleAssign = () => {
    if (!assignUserId) return;
    setSubmittingAssign(true);
    assignMutation.mutate({ assignedTo: assignUserId });
  };

  const handleResolve = () => {
    resolveMutation.mutate({ resolutionNotes: 'Resolved' });
  };

  const handleClose = () => {
    closeMutation.mutate({});
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    setSubmittingComment(true);
    const existingComments = incident?.comments || [];
    commentMutation.mutate({
      comments: [...existingComments, { text: comment.trim(), author: user?.name || 'Unknown', createdAt: new Date().toISOString() }],
    });
  };

  const canAssign = isAdmin || isManager;
  const canResolveClose = user?._id === incident?.assignedTo?._id || isAdmin;
  const isOpenOrInProgress = incident?.status === 'open' || incident?.status === 'in_progress';
  const showActions = canResolveClose && (isOpenOrInProgress || incident?.status === 'resolved');

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            <Card><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
          </div>
          <div className="space-y-6">
            <Card><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
            <Card><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !incident) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Incident not found</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The incident you're looking for doesn't exist or has been removed.</p>
        <Link to="/dashboard/incidents">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Incidents
          </Button>
        </Link>
      </div>
    );
  }

  const slaTimeLeft = sla?.deadline ? new Date(sla.deadline).getTime() - Date.now() : null;
  const slaStatus = sla?.status || 'active';
  const timeline = incident?.timeline || incident?.activity || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/incidents"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded">
                {incident.incidentId || `INC-${String(incident._id).slice(-4).toUpperCase()}`}
              </span>
              <Badge variant={getStatusVariant(incident.status)}>
                {incident.status?.replace('_', ' ')}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{incident.title}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Description</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {incident.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {timeline.length > 0 && (
            <Card>
              <CardHeader className="pb-0">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Activity Timeline</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-4">
                    {timeline.map((item, i) => (
                      <div key={i} className="relative flex items-start gap-4 pl-1">
                        <div className={cn(
                          'relative z-10 w-3.5 h-3.5 rounded-full mt-1.5 border-2 border-white dark:border-gray-900',
                          item.type === 'created' ? 'bg-blue-500' :
                          item.type === 'resolved' ? 'bg-green-500' :
                          item.type === 'closed' ? 'bg-gray-500' :
                          item.type === 'assigned' ? 'bg-purple-500' :
                          'bg-amber-500'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.action || item.type || 'Update'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.performedBy?.name && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">{item.performedBy.name}</span>
                            )}
                            {item.createdAt && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(item.createdAt)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Comments</h2>
              </div>
            </CardHeader>
            <CardContent>
              {incident.comments && incident.comments.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {incident.comments.map((c, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {(c.author || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.author || 'Unknown'}</span>
                          {c.createdAt && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(c.createdAt)}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-6">No comments yet.</p>
              )}

              <div className="flex gap-3">
                <textarea
                  placeholder="Add a comment..."
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || submittingComment}
                  className="self-end"
                >
                  {submittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Details</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Priority</span>
                <div className="mt-1">
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', getPriorityColor(incident.priority))}>
                    {getPriorityLabel(incident.priority)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</span>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{incident.category || '—'}</p>
              </div>
              {incident.department?.name && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Department</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{incident.department.name}</p>
                </div>
              )}
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Created</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(incident.createdAt)}</span>
                </div>
              </div>
              {incident.createdBy?.name && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Reported By</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{incident.createdBy.name}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assignment</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {incident.assignedTo ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {(incident.assignedTo.name || incident.assignedTo.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {incident.assignedTo.name || incident.assignedTo.email}
                    </p>
                    {incident.assignedTo.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{incident.assignedTo.email}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Not assigned</p>
              )}

              {canAssign && (
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Assign to Engineer</label>
                  <div className="flex gap-2">
                    <select
                      value={assignUserId}
                      onChange={(e) => setAssignUserId(e.target.value)}
                      className="flex-1 h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select engineer...</option>
                      {engineers.map((eng) => (
                        <option key={eng._id} value={eng._id}>{eng.name || eng.email}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      onClick={handleAssign}
                      disabled={!assignUserId || submittingAssign}
                    >
                      {submittingAssign ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {sla && (
            <Card>
              <CardHeader className="pb-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">SLA Status</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <Badge variant={getSlaStatusVariant(slaStatus)}>{slaStatus}</Badge>
                </div>
                {slaTimeLeft !== null && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Time Remaining</span>
                    <p className={cn(
                      'text-lg font-bold mt-1',
                      slaTimeLeft <= 0 ? 'text-red-600 dark:text-red-400' :
                      slaTimeLeft < 3600000 ? 'text-orange-600 dark:text-orange-400' :
                      'text-gray-900 dark:text-gray-100'
                    )}>
                      {formatTimeLeft(slaTimeLeft)}
                    </p>
                  </div>
                )}
                {sla.deadline && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Deadline</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{formatDate(sla.deadline)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {showActions && (
            <Card>
              <CardContent className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</h3>
                {incident.status !== 'resolved' && (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleResolve}
                    disabled={resolveMutation.isPending}
                  >
                    {resolveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Resolve Incident
                  </Button>
                )}
                {incident.status === 'resolved' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClose}
                    disabled={closeMutation.isPending}
                  >
                    {closeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Close Incident
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
