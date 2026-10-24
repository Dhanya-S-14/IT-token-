import '@testing-library/jest-dom';

vi.mock('framer-motion', () => {
  const mockDiv = ({ children, ...props }) => {
    const { initial, animate, exit, ...validProps } = props;
    return <div {...validProps}>{children}</div>;
  };
  mockDiv.displayName = 'motion.div';
  const motion = new Proxy({}, { get: () => mockDiv });
  return { motion, AnimatePresence: ({ children }) => children };
});

vi.mock('react-hot-toast', () => {
  const mockToast = { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() };
  return { default: mockToast };
});
