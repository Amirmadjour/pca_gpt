import { motion, Variants } from 'framer-motion';
import React from 'react';

interface TypewriterProps {
  children: React.ReactNode; // The content to animate
  delay?: number; // Delay before starting the animation
  duration?: number; // Duration of the animation
}

const Typewriter: React.FC<TypewriterProps> = ({ children, delay = 0, duration = 1 }) => {
  const variants: Variants = {
    hidden: { width: '0%', overflow: 'hidden', whiteSpace: 'nowrap' },
    visible: {
      width: '100%',
      transition: { delay, duration, ease: 'linear' },
    },
  };

  return (
    <motion.div variants={variants} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
};

export default Typewriter;