import { useState, useCallback } from 'react';

export interface ArtifactData {
  status: 'idle' | 'streaming' | 'complete';
  isVisible: boolean;
  content?: string;
  title?: string;
  type?: string;
}

export const initialArtifactData: ArtifactData = {
  status: 'idle',
  isVisible: false,
  content: '',
  title: '',
  type: '',
};

export function useArtifact() {
  const [artifact, setArtifactState] = useState<ArtifactData>(initialArtifactData);

  const setArtifact = useCallback((
    updater: ArtifactData | ((current: ArtifactData) => ArtifactData)
  ) => {
    if (typeof updater === 'function') {
      setArtifactState((current) => updater(current));
    } else {
      setArtifactState(updater);
    }
  }, []);

  return {
    artifact,
    setArtifact,
  };
}