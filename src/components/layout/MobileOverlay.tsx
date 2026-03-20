import { useState, useEffect } from 'react';

interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileOverlay = ({ isOpen, onClose }: MobileOverlayProps) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsClosing(false);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };
  
  return (
    <div 
      className={`panel-overlay z-10 md:hidden ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    />
  );
};