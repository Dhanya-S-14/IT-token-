import { Card, CardContent } from '../../components/ui/Card';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export default function Profile() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16">
            <User className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Profile page coming soon</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
