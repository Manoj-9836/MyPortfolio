import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className={`flex items-center gap-3 p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all text-left ${action.color}`}
            >
              <div className="p-2 bg-white/10 rounded-lg">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{action.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
