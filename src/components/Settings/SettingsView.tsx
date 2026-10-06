import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandSetting } from '../../types';
import { isSupabaseConfigured } from '../../services/supabase';
import {
  Settings,
  Coffee,
  Database,
  Cloud,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    brandSetting,
    updateBrandSetting,
    userRole,
  } = useApp();

  const [name, setName] = useState(brandSetting.name);
  const [tagline, setTagline] = useState(brandSetting.tagline);
  const [address, setAddress] = useState(brandSetting.address);
  const [phone, setPhone] = useState(brandSetting.phone);
  const [primaryColor, setPrimaryColor] = useState(brandSetting.primary_color);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BrandSetting = {
      ...brandSetting,
      name,
      tagline,
      address,
      phone,
      primary_color: primaryColor,
    };
    await updateBrandSetting(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const sqlPath = 'database/schema.sql';

  const handleCopySQLPath = () => {
    navigator.clipboard.writeText(`Catatan skema Supabase tersimpan di file: ${sqlPath}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-mira-dark tracking-tight">
          Pengaturan Brand & Sistem
        </h1>
        <p className="text-xs text-mira-muted mt-1">
          Sesuaikan identitas kedai kopi Anda, profil toko, serta konfigurasi cloud database Supabase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BRAND IDENTITY CARD */}
        <div className="bg-mira-card border border-mira-border rounded-2xl p-6 shadow-tactile space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-mira-border">
            <Coffee className="w-5 h-5 text-mira-caramel" />
            <h2 className="font-display font-bold text-base text-mira-dark">
              Identitas Brand Kedai Kopi
            </h2>
          </div>

          <form onSubmit={handleSaveBrand} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-mira-muted font-medium mb-1">
                Nama Kedai Kopi *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border focus:outline-none focus:border-mira-caramel"
              />
            </div>

            <div>
              <label className="block text-mira-muted font-medium mb-1">
                Slogan / Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border focus:outline-none focus:border-mira-caramel"
              />
            </div>

            <div>
              <label className="block text-mira-muted font-medium mb-1">
                Alamat Kedai
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border focus:outline-none focus:border-mira-caramel"
              />
            </div>

            <div>
              <label className="block text-mira-muted font-medium mb-1">
                Nomor Kontak / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border focus:outline-none focus:border-mira-caramel font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-mira-caramel hover:bg-mira-caramel-hover text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center space-x-1.5"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Perubahan Berhasil Disimpan!</span>
                  </>
                ) : (
                  <span>Simpan Perubahan Brand</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* CLOUD DATABASE & SUPABASE SETUP */}
        <div className="bg-mira-card border border-mira-border rounded-2xl p-6 shadow-tactile space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-mira-border">
            <Database className="w-5 h-5 text-mira-olive" />
            <h2 className="font-display font-bold text-base text-mira-dark">
              Integrasi Cloud Database (Supabase)
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {/* Status Card */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isSupabaseConfigured
                  ? 'bg-mira-olive-light/60 border-mira-olive/40'
                  : 'bg-mira-subtle/70 border-mira-border'
              }`}
            >
              <div>
                <span className="font-bold text-mira-dark block">
                  {isSupabaseConfigured ? 'Supabase Terhubung' : 'Mode Offline / Local DB (Aktif)'}
                </span>
                <span className="text-[11px] text-mira-muted">
                  {isSupabaseConfigured
                    ? 'Data otomatis sinkron real-time ke PostgreSQL cloud.'
                    : 'Aplikasi berjalan 100% menggunakan IndexedDB lokal berkecepatan tinggi.'}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  isSupabaseConfigured
                    ? 'bg-mira-olive text-white'
                    : 'bg-mira-dark text-white'
                }`}
              >
                {isSupabaseConfigured ? 'Live' : 'Local'}
              </span>
            </div>

            <div className="space-y-2 pt-2 text-mira-muted leading-relaxed">
              <p className="font-semibold text-mira-dark">
                Cara Menghubungkan ke Supabase (100% Gratis):
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>
                  Daftar akun gratis di{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-mira-caramel underline font-medium inline-flex items-center"
                  >
                    supabase.com <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>{' '}
                  dan buat project baru.
                </li>
                <li>
                  Buka tab <strong>SQL Editor</strong> di dashboard Supabase.
                </li>
                <li>
                  Salin isi file <code>database/schema.sql</code> dari repository ini dan jalankan perintah <em>Run</em>.
                </li>
                <li>
                  Tambahkan <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> di pengaturan environment Vercel Anda.
                </li>
              </ol>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCopySQLPath}
                className="w-full py-2.5 px-3 rounded-xl border border-mira-border bg-mira-canvas hover:bg-mira-subtle text-mira-dark font-medium flex items-center justify-center space-x-2"
              >
                <Copy className="w-4 h-4 text-mira-muted" />
                <span>
                  {copied ? 'Lokasi Tersalin!' : 'File Skema: database/schema.sql'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
