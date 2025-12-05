import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Remove the TypeScript type annotation <boolean | undefined>
  const [isMobile, setIsMobile] = React.useState(undefined);

  React.useEffect(() => {
    // Create a media query list for screens smaller than the mobile breakpoint
    // We subtract 1px to ensure it's strictly less than the breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Define the change handler for the media query
    const onChange = () => {
      // Update the state based on whether the media query matches
      setIsMobile(mql.matches);
    };

    // Add event listener for changes in the media query status
    mql.addEventListener("change", onChange);

    // Set initial state based on current window width
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup function: remove the event listener when the component unmounts
    return () => mql.removeEventListener("change", onChange);
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Return true if isMobile is true, false if isMobile is false or undefined (initially)
  // The !! converts the value to a boolean (e.g., undefined -> false, true -> true)
  return !!isMobile;
}
