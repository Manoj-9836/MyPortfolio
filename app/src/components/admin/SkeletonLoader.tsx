import { motion } from 'framer-motion';

export function SkeletonLine() {
  return (
    <motion.div
      className="h-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg overflow-hidden"
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{ backgroundSize: '200% 100%' }}
    />
  );
}

export function SkeletonCircle() {
  return (
    <motion.div
      className="w-12 h-12 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-full overflow-hidden"
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{ backgroundSize: '200% 100%' }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <SkeletonCircle />
          <div className="flex-1 space-y-2">
            <SkeletonLine />
            <motion.div
              className="h-3 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg w-3/4 overflow-hidden"
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>
        </div>
        <SkeletonLine />
        <SkeletonLine />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonContent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header skeleton */}
      <div className="space-y-2">
        <motion.div
          className="h-8 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg w-1/3 overflow-hidden"
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ backgroundSize: '200% 100%' }}
        />
        <motion.div
          className="h-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg w-1/2 overflow-hidden"
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>

      {/* Content skeleton */}
      <SkeletonTable />
    </motion.div>
  );
}
