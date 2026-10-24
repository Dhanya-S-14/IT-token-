import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeLeft = (ms) => {
  if (ms <= 0) return 'Expired';
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes}m`;
};

export const getPriorityColor = (priority) => {
  const colors = {
    critical: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    high: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    low: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  };
  return colors[priority] || colors.low;
};

export const getStatusColor = (status) => {
  const colors = {
    open: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    in_progress: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    resolved: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    closed: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
    pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    approved: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    rejected: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  };
  return colors[status] || colors.open;
};
