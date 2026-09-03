import { useEffect, useState } from "react";
import { fetchPlayerSiteBranding } from "../services/api";
import brandLogo from "../assets/logo.png";

function isValidHttpsLogoUrl(s) {
  return typeof s === "string" && s.trim().startsWith("https://");
}

const defaultResolved = Object.freeze({
  navbarWide: brandLogo,
  navbarCompact: brandLogo,
  loadingLogo: brandLogo,
});

let brandingFetchPromise = null;

function loadBrandingOnce() {
  if (!brandingFetchPromise) {
    brandingFetchPromise = fetchPlayerSiteBranding()
      .catch(() => ({}))
      .finally(() => {
        brandingFetchPromise = null;
      });
  }
  return brandingFetchPromise;
}

/**
 * Resolved logo URLs for header + home loading overlay (CMS with bundled fallbacks).
 */
export function usePlayerSiteBranding() {
  const [resolved, setResolved] = useState(defaultResolved);

  useEffect(() => {
    let cancelled = false;
    loadBrandingOnce().then((data) => {
      if (cancelled) return;
      const wide = isValidHttpsLogoUrl(data?.navbarWide)
        ? data.navbarWide.trim()
        : brandLogo;
      const compact = isValidHttpsLogoUrl(data?.navbarCompact)
        ? data.navbarCompact.trim()
        : brandLogo;
      const loading = isValidHttpsLogoUrl(data?.loadingLogo)
        ? data.loadingLogo.trim()
        : brandLogo;
      setResolved({ navbarWide: wide, navbarCompact: compact, loadingLogo: loading });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return resolved;
}
