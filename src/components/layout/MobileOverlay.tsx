interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileOverlay = ({ isOpen, onClose }: MobileOverlayProps) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 md:hidden"
      onClick={onClose}
    />
  );
};