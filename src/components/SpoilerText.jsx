import { useState } from 'react';
import { motion } from 'framer-motion';

function SpoilerText({ children }) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <span
      onClick={() => setIsRevealed(!isRevealed)}
      className="relative inline cursor-pointer"
    >
      {!isRevealed ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative inline-block"
        >
          <span className="invisible">{children}</span>
          <span className="absolute inset-0 bg-gray-400 dark:bg-gray-600 rounded animate-pulse" />
        </motion.span>
      ) : (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-700/50 px-1 rounded"
        >
          {children}
        </motion.span>
      )}
    </span>
  );
}

export default SpoilerText;
