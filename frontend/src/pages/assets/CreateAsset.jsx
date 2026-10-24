import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, Monitor } from 'lucide-react';

export default function CreateAsset() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/assets" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Asset</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Register a new IT asset</p>
        </div>
      </div>
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16">
            <Monitor className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Asset creation form coming soon</p>
            <Link to="/dashboard/assets" className="mt-4"><Button variant="outline">Back to Assets</Button></Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
