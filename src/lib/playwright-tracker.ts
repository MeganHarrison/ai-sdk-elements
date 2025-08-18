// Playwright detection and tracking utilities

interface AutomationSignals {
  webdriver: boolean;
  headless: boolean;
  permissionsDenied: boolean;
  pluginsLength: boolean;
  languagesLength: boolean;
  webglVendor: boolean;
  userAgent: string;
  viewport: { width: number; height: number };
}

export class PlaywrightDetector {
  static async detectAutomation(): Promise<AutomationSignals> {
    const signals: AutomationSignals = {
      webdriver: false,
      headless: false,
      permissionsDenied: false,
      pluginsLength: false,
      languagesLength: false,
      webglVendor: false,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    // Check for webdriver property
    if (navigator.webdriver) {
      signals.webdriver = true;
    }

    // Check for headless indicators
    if (
      navigator.userAgent.includes('HeadlessChrome') ||
      navigator.userAgent.includes('Headless') ||
      navigator.userAgent.includes('Playwright')
    ) {
      signals.headless = true;
    }

    // Check permissions API (often fails in automation)
    try {
      const result = await navigator.permissions.query({ name: 'notifications' as PermissionName });
      if (result.state === 'denied' && result.state === 'prompt') {
        signals.permissionsDenied = true;
      }
    } catch {
      signals.permissionsDenied = true;
    }

    // Check plugins (usually empty in headless)
    if (navigator.plugins.length === 0) {
      signals.pluginsLength = true;
    }

    // Check languages (often minimal in automation)
    if (navigator.languages.length === 0 || navigator.languages.length === 1) {
      signals.languagesLength = true;
    }

    // Check WebGL vendor (often generic in headless)
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          if (vendor === 'Google Inc.' || vendor === 'Google Inc. (Intel)') {
            signals.webglVendor = true;
          }
        }
      }
    } catch {
      // WebGL not available
    }

    return signals;
  }

  static calculateAutomationScore(signals: AutomationSignals): number {
    let score = 0;
    
    if (signals.webdriver) score += 100; // Strong indicator
    if (signals.headless) score += 80;
    if (signals.permissionsDenied) score += 20;
    if (signals.pluginsLength) score += 30;
    if (signals.languagesLength) score += 20;
    if (signals.webglVendor) score += 25;
    
    // Check for common automation viewport sizes
    const { width, height } = signals.viewport;
    const commonAutomationSizes = [
      { w: 800, h: 600 },
      { w: 1280, h: 720 },
      { w: 1920, h: 1080 },
    ];
    
    if (commonAutomationSizes.some(size => size.w === width && size.h === height)) {
      score += 15;
    }
    
    return Math.min(score, 100);
  }

  static async trackAutomationAttempt(signals: AutomationSignals, score: number) {
    try {
      await fetch('/api/track-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signals,
          score,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          referrer: document.referrer,
        }),
      });
    } catch (error) {
      console.error('Failed to track automation attempt:', error);
    }
  }
}

// Hook to use in React components
export function useAutomationDetection() {
  const [isAutomated, setIsAutomated] = useState(false);
  const [automationScore, setAutomationScore] = useState(0);

  useEffect(() => {
    async function detect() {
      const signals = await PlaywrightDetector.detectAutomation();
      const score = PlaywrightDetector.calculateAutomationScore(signals);
      
      setAutomationScore(score);
      setIsAutomated(score > 50); // Threshold for likely automation
      
      if (score > 30) {
        // Track suspicious activity
        await PlaywrightDetector.trackAutomationAttempt(signals, score);
      }
    }

    detect();
  }, []);

  return { isAutomated, automationScore };
}