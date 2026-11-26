"use client";

import { useEffect } from "react";

export default function PortalClient({ markup, supabaseUrl, supabaseAnonKey }) {
  useEffect(() => {
    let active = true;

    if (document.querySelector('script[data-pmb-portal]')) return;

    async function initializePortal() {
      const { createClient } = await import("@supabase/supabase-js");
      if (!active) return;

      window.PMB_SUPABASE_CONFIG = { url: supabaseUrl, anonKey: supabaseAnonKey };
      window.supabase = { createClient };
      const portalScript = document.createElement("script");
      portalScript.src = "/app.js";
      portalScript.dataset.pmbPortal = "true";
      portalScript.async = true;
      portalScript.onerror = () => {
        console.error("Aplikasi portal gagal dimuat dari /app.js.");
      };
      document.body.appendChild(portalScript);
    }

    initializePortal().catch((error) => {
      console.error("Portal PMB gagal diinisialisasi.", error);
    });

    return () => {
      active = false;
    };
  }, [supabaseUrl, supabaseAnonKey]);

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
