/**
 * React 19 Compatibility Layer
 * 
 * This file provides compatibility fixes for React 19 breaking changes,
 * particularly the ref handling deprecation.
 */

import React from 'react';

/**
 * Patches console.error to suppress specific React 19 ref warnings
 * from third-party libraries like Radix UI.
 * 
 * This is a temporary solution until libraries update for React 19.
 */
export function suppressReact19RefWarnings() {
  if (typeof window !== 'undefined') {
    const originalError = console.error;
    
    console.error = (...args) => {
      // Suppress the specific React 19 ref warning
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Accessing element.ref was removed in React 19')
      ) {
        return;
      }
      
      // Call the original console.error for other messages
      originalError.apply(console, args);
    };
  }
}

/**
 * Compatible forwardRef implementation that works with both React 18 and 19
 */
export function forwardRefCompat<T, P = {}>(
  render: (props: P & { ref?: React.Ref<T> }) => React.ReactElement | null
): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>> {
  // Check if we're in React 19
  const reactVersion = React.version.split('.')[0];
  
  if (parseInt(reactVersion) >= 19) {
    // In React 19, ref is a regular prop
    const Component = (props: P & { ref?: React.Ref<T> }) => {
      return render(props);
    };
    
    // Add display name for debugging
    Component.displayName = render.displayName || render.name || 'Component';
    
    // Type assertion to maintain compatibility
    return Component as unknown as React.ForwardRefExoticComponent<
      React.PropsWithoutRef<P> & React.RefAttributes<T>
    >;
  }
  
  // In React 18 and below, use forwardRef
  return React.forwardRef(render);
}

/**
 * Hook to handle ref in a React 19 compatible way
 */
export function useCompatRef<T>(
  externalRef?: React.Ref<T>
): React.MutableRefObject<T | null> {
  const internalRef = React.useRef<T>(null);
  
  React.useEffect(() => {
    if (!externalRef) return;
    
    if (typeof externalRef === 'function') {
      externalRef(internalRef.current);
    } else {
      (externalRef as React.MutableRefObject<T | null>).current = internalRef.current;
    }
  }, [externalRef]);
  
  return internalRef;
}