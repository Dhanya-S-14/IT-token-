import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { incidentService } from '../../services/incidentService';
import { departmentService } from '../../services/departmentService';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.string().min(1, 'Please select a priority'),
  category: z.string().min(1, 'Please select a category'),
  department: z.string().min(1, 'Please select a department'),
});

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const CATEGORY_OPTIONS = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'network', label: 'Network' },
  { value: 'security', label: 'Security' },
  { value: 'vpn', label: 'VPN' },
  { value: 'email', label: 'Email' },
  { value: 'server', label: 'Server' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'other', label: 'Other' },
];

export default function CreateIncident() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', priority: '', category: '', department: '' },
  });

  const description = watch('description');

  useEffect(() => {
    setCharCount(description?.length || 0);
  }, [description]);

  const { data: deptData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll(),
  });

  const departments = deptData?.data?.data || [];
  const departmentOptions = [
    { value: '', label: 'Select department' },
    ...departments.map((d) => ({ value: d._id, label: d.name })),
  ];

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await incidentService.create(formData);
      toast.success('Incident created successfully');
      navigate('/dashboard/incidents');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8 max-w-3xl mx-auto"
    >
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/incidents"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Incident</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Report a new issue or problem</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Incident Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Title"
              placeholder="Brief description of the issue"
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                placeholder="Detailed description of the issue..."
                rows={5}
                className={`flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.description ? 'border-red-500' : ''}`}
                {...register('description')}
              />
              <div className="flex items-center justify-between">
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                <p className="text-xs text-gray-400 ml-auto">{charCount} characters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Priority"
                placeholder="Select priority"
                options={PRIORITY_OPTIONS}
                error={errors.priority?.message}
                {...register('priority')}
              />
              <Select
                label="Category"
                placeholder="Select category"
                options={CATEGORY_OPTIONS}
                error={errors.category?.message}
                {...register('category')}
              />
              <Select
                label="Department"
                placeholder="Select department"
                options={departmentOptions}
                error={errors.department?.message}
                {...register('department')}
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Create Incident
                  </>
                )}
              </Button>
              <Link to="/dashboard/incidents">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
