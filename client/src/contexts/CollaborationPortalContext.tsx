import { createContext, useContext, useState, ReactNode } from 'react';

interface CollaborationPortalState {
  ideaId: string | null;
  ideaTitle: string | null;
  isOpen: boolean;
  position: { x: number; y: number };
  isExpanded: boolean;
}

interface CollaborationPortalContextType {
  portalState: CollaborationPortalState;
  openPortal: (ideaId: string, ideaTitle: string) => void;
  closePortal: () => void;
  updatePosition: (x: number, y: number) => void;
  toggleExpand: () => void;
}

const CollaborationPortalContext = createContext<CollaborationPortalContextType | undefined>(undefined);

export function CollaborationPortalProvider({ children }: { children: ReactNode }) {
  // Initialize position to bottom-right corner (smaller widget: 350x500)
  const getInitialPosition = () => {
    if (typeof window !== 'undefined') {
      return { x: Math.max(20, window.innerWidth - 370), y: Math.max(20, window.innerHeight - 520) };
    }
    return { x: 100, y: 100 };
  };

  const [portalState, setPortalState] = useState<CollaborationPortalState>({
    ideaId: null,
    ideaTitle: null,
    isOpen: false,
    position: getInitialPosition(),
    isExpanded: false,
  });

  const openPortal = (ideaId: string, ideaTitle: string) => {
    setPortalState((prev) => {
      // If opening a different idea, reset position to bottom-right (smaller widget: 350x500)
      const newPosition = prev.ideaId === ideaId 
        ? prev.position 
        : typeof window !== 'undefined'
          ? { x: Math.max(20, window.innerWidth - 370), y: Math.max(20, window.innerHeight - 520) }
          : { x: 100, y: 100 };
      
      return {
        ...prev,
        ideaId,
        ideaTitle,
        isOpen: true,
        position: newPosition,
      };
    });
  };

  const closePortal = () => {
    setPortalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const updatePosition = (x: number, y: number) => {
    setPortalState((prev) => ({
      ...prev,
      position: { x, y },
    }));
  };

  const toggleExpand = () => {
    setPortalState((prev) => ({
      ...prev,
      isExpanded: !prev.isExpanded,
    }));
  };

  return (
    <CollaborationPortalContext.Provider
      value={{
        portalState,
        openPortal,
        closePortal,
        updatePosition,
        toggleExpand,
      }}
    >
      {children}
    </CollaborationPortalContext.Provider>
  );
}

export function useCollaborationPortal() {
  const context = useContext(CollaborationPortalContext);
  if (context === undefined) {
    throw new Error('useCollaborationPortal must be used within a CollaborationPortalProvider');
  }
  return context;
}

