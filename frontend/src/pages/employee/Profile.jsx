import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { employeeService } from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Building, Briefcase, MapPin, Calendar, Camera, Save } from 'lucide-react';

export default function EmployeeProfile() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await employeeService.getProfile();
        setProfile(res.data.data);
        setForm({ phone: res.data.data.phone || '', email: res.data.data.email || '' });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await employeeService.updateProfile(form);
      toast.success('Profile updated');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!profile) return <div className="text-center py-12 text-gray-500">Profile not found</div>;

  const fields = [
    { icon: User, label: 'Name', value: profile.name },
    { icon: Building, label: 'Employee ID', value: profile.employeeId },
    { icon: Mail, label: 'Email', value: profile.email, editable: true },
    { icon: Phone, label: 'Phone', value: profile.phone || 'Not set', editable: true },
    { icon: Briefcase, label: 'Department', value: profile.department || 'Not set' },
    { icon: Briefcase, label: 'Designation', value: profile.designation || 'Not set' },
    { icon: MapPin, label: 'Location', value: profile.deploymentLocation || 'Not set' },
    { icon: Calendar, label: 'Joined', value: profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'Not set' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage your personal information</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary">{profile.name?.[0]}</span>
            )}
          </div>
          <button className="inline-flex items-center gap-1 text-sm text-primary hover:underline"><Camera className="w-4 h-4" /> Change Photo</button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">{profile.name}</h2>
          <p className="text-sm text-gray-500">{profile.employeeId}</p>
          <p className="text-sm text-gray-500 mt-1">{profile.department || 'No department'}</p>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Badge>Active</Badge>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
            <button onClick={() => setEditing(!editing)} className="text-sm text-primary hover:underline">
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {fields.map((field, i) => (
                <div key={i}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <field.icon className="w-4 h-4" /> {field.label}
                  </label>
                  {field.editable && editing ? (
                    <input
                      type={field.label === 'Email' ? 'email' : 'text'}
                      value={field.label === 'Email' ? form.email : form.phone}
                      onChange={(e) => setForm({ ...form, [field.label === 'Email' ? 'email' : 'phone']: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white font-medium">{field.value}</p>
                  )}
                </div>
              ))}
            </div>
            {editing && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Badge({ children }) {
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">{children}</span>;
}
