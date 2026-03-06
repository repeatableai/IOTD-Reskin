import { useEffect, useRef } from 'react';
import { useSearch } from 'wouter';

export default function Sub3D_RiskMitigation() {
  const searchString = useSearch();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Pass venture context to the embedded Company OS app
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const ideaId = params.get('ideaId');

    if (ideaId) {
      const storedVenture = localStorage.getItem('companyOS_venture');
      if (storedVenture && iframeRef.current) {
        // Wait for iframe to load, then send the venture data
        const iframe = iframeRef.current;
        const handleLoad = () => {
          try {
            const ideaData = JSON.parse(storedVenture);
            // Send venture context to the iframe
            iframe.contentWindow?.postMessage({
              type: 'LOAD_VENTURE_CONTEXT',
              data: ideaData
            }, '*');
          } catch (e) {
            console.error('Failed to parse venture context:', e);
          }
        };
        iframe.addEventListener('load', handleLoad);
        return () => iframe.removeEventListener('load', handleLoad);
      }
    }
  }, [searchString]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}>
      <iframe
        ref={iframeRef}
        src="/company-os.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
        }}
        title="Company OS"
      />
    </div>
  );
}
