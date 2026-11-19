/**
 * Youth Hub Dantewada - Supabase Backend Integration
 * Provides seamless connection to Supabase for Rehabilitation Counselling beneficiaries
 * and other portal data modules with graceful offline fallback.
 */
(function (global) {
  'use strict';

  const SupabaseBackend = {
    // Retrieve configuration from env.js, localStorage, or defaults
    getConfig() {
      const envUrl = (typeof global.ENV !== 'undefined' && global.ENV.SUPABASE_URL) || '';
      const envKey = (typeof global.ENV !== 'undefined' && (global.ENV.SUPABASE_ANON_KEY || global.ENV.SUPABASE_KEY)) || '';
      const storedUrl = (typeof localStorage !== 'undefined' && localStorage.getItem('YH_SUPABASE_URL')) || '';
      const storedKey = (typeof localStorage !== 'undefined' && localStorage.getItem('YH_SUPABASE_ANON_KEY')) || '';

      const url = (storedUrl || envUrl || '').trim().replace(/\/+$/, '');
      const key = (storedKey || envKey || '').trim();

      return {
        url,
        key,
        isConfigured: Boolean(url && key)
      };
    },

    /**
     * Check if Supabase backend is configured and active
     */
    isConfigured() {
      return this.getConfig().isConfigured;
    },

    /**
     * Configure Supabase credentials dynamically
     */
    configure(url, key) {
      if (typeof localStorage !== 'undefined') {
        if (url) localStorage.setItem('YH_SUPABASE_URL', url.trim());
        if (key) localStorage.setItem('YH_SUPABASE_ANON_KEY', key.trim());
      }
    },

    /**
     * Fetch headers for Supabase REST API requests
     */
    getHeaders(extra = {}) {
      const { key } = this.getConfig();
      return {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...extra
      };
    },

    /**
     * Fetch all Rehabilitation Counselling beneficiaries from Supabase
     * Falls back to local dataset / DantewadaDB if not configured or offline
     */
    async getRehabilitationBeneficiaries() {
      const config = this.getConfig();
      
      if (config.isConfigured) {
        try {
          const endpoint = `${config.url}/rest/v1/rehabilitation_counselling?select=*&order=id.asc`;
          const res = await fetch(endpoint, {
            method: 'GET',
            headers: this.getHeaders()
          });

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const formatted = data.map((r, idx) => ({
                id: r.id || (idx + 1),
                name: (r.name || r.NAME || r['NAME '] || '').trim(),
                address: (r.address || r.ADDRESS || r.village || '').trim(),
                mobile: (r.mobile || r['MOBILE NO.'] || r.phone || '-').trim(),
                institute: (r.institute || r.INSTITUTE || '').trim(),
                training: (r.training || r.TRAINING || r.trade || '').trim(),
                block: r.block || 'Dantewada'
              }));
              return { success: true, source: 'supabase', data: formatted, count: formatted.length };
            }
          }
        } catch (err) {
          console.warn('[Supabase] Could not fetch rehabilitation beneficiaries from Supabase:', err.message);
        }
      }

      // Seamless fallback to DantewadaDB or static embedded dataset
      let fallbackRecords = [];
      const globalRehab = (typeof global !== 'undefined' && global.DANTEWADA_REHABILITATION_DATA) || (typeof window !== 'undefined' && window.DANTEWADA_REHABILITATION_DATA);
      if (global.DantewadaDB && Array.isArray(global.DantewadaDB.data.rehabilitationCounselling) && global.DantewadaDB.data.rehabilitationCounselling.length > 0) {
        fallbackRecords = global.DantewadaDB.data.rehabilitationCounselling;
      } else if (Array.isArray(globalRehab) && globalRehab.length > 0) {
        fallbackRecords = globalRehab;
      } else if (typeof require !== 'undefined') {
        try {
          const loaded = require('./rehabilitation-data.js');
          if (Array.isArray(loaded)) fallbackRecords = loaded;
        } catch (_) {}
      }

      return {
        success: true,
        source: config.isConfigured ? 'fallback' : 'local',
        data: fallbackRecords,
        count: fallbackRecords.length
      };
    },

    /**
     * Upsert single beneficiary record to Supabase
     */
    async saveBeneficiary(record) {
      const config = this.getConfig();
      if (!config.isConfigured) {
        return { success: true, source: 'local', message: 'Saved locally' };
      }

      try {
        const endpoint = `${config.url}/rest/v1/rehabilitation_counselling`;
        const payload = {
          name: record.name || record.NAME || '',
          address: record.address || record.ADDRESS || '',
          mobile: record.mobile || record['MOBILE NO.'] || '',
          institute: record.institute || record.INSTITUTE || '',
          training: record.training || record.TRAINING || '',
          block: record.block || 'Dantewada'
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders({ 'Prefer': 'resolution=merge-duplicates' }),
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          return { success: true, source: 'supabase' };
        }
      } catch (err) {
        console.warn('[Supabase] Failed to save beneficiary to Supabase:', err);
      }

      return { success: false, source: 'error' };
    },

    /**
     * Sync local records to Supabase in bulk
     */
    async syncAllToSupabase(records) {
      const config = this.getConfig();
      if (!config.isConfigured) {
        return { success: false, message: 'Supabase URL/Key is not configured' };
      }

      try {
        const endpoint = `${config.url}/rest/v1/rehabilitation_counselling`;
        const payload = records.map(r => ({
          name: r.name || r.NAME || '',
          address: r.address || r.ADDRESS || '',
          mobile: r.mobile || r['MOBILE NO.'] || '',
          institute: r.institute || r.INSTITUTE || '',
          training: r.training || r.TRAINING || '',
          block: r.block || 'Dantewada'
        }));

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders({ 'Prefer': 'resolution=merge-duplicates' }),
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          return { success: true, count: payload.length };
        }
      } catch (err) {
        console.error('[Supabase] Bulk sync error:', err);
        return { success: false, error: err.message };
      }
    }
  };

  global.YouthHubSupabase = SupabaseBackend;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseBackend;
  }
})(typeof window !== 'undefined' ? window : global);
