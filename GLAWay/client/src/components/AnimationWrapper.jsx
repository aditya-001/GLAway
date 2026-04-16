import { motion } from "framer-motion";
import { useUISettings } from "../context/UISettingsContext";

const presets = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -18 }
  },
  zoom: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 }
  }
};

const AnimationWrapper = ({
  as = "div",
  children,
  className = "",
  delay = 0,
  layout = false,
  once = true,
  viewportMargin = "-60px",
  ...props
}) => {
  const { animationSettings, shouldAnimate, duration } = useUISettings();

  if (!shouldAnimate) {
    const Component = as;
    return (
      <Component className={className} {...props}>
        {children}
      </Component>
    );
  }

  const MotionComponent = motion[as] || motion.div;
  const preset = presets[animationSettings.animationType] || presets.slide;

  return (
    <MotionComponent
      className={className}
      layout={layout}
      initial={preset.initial}
      whileInView={preset.animate}
      exit={preset.exit}
      viewport={{ once, margin: viewportMargin }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

export default AnimationWrapper;

