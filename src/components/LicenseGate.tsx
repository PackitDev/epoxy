import { useState, useEffect } from 'react';
import { useLicenseStore } from '../stores/license-store';
import { Key, Loader2, AlertCircle, CheckCircle2, Shield, Cpu } from 'lucide-react';

export function LicenseGate({ children }: { children: React.ReactNode }) {
  const { isLicensed, isChecking, error, machineId, checkLicense, activateLicense, setError } = useLicenseStore();
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    checkLicense();
  }, []);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setActivationError('Please enter a license key');
      return;
    }

    setIsActivating(true);
    setActivationError(null);

    const result = await activateLicense(licenseKey.trim());

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 1500);
    } else {
      setActivationError(result.error || 'Activation failed');
    }

    setIsActivating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isActivating) {
      handleActivate();
    }
  };

  // Loading state
  if (isChecking && !isActivating) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative bg-[#111] p-6 rounded-2xl border border-white/10">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          </div>
          <p className="text-zinc-400 text-sm">Checking license...</p>
        </div>
      </div>
    );
  }

  // Success animation
  if (showSuccess) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full blur-xl opacity-50" />
            <div className="relative bg-[#111] p-6 rounded-2xl border border-emerald-500/30">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
          </div>
          <p className="text-emerald-400 font-medium">License Activated!</p>
        </div>
      </div>
    );
  }

  // Licensed - show app
  if (isLicensed) {
    return <>{children}</>;
  }

  // License activation screen
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur-xl opacity-30" />
            <div className="relative bg-gradient-to-br from-[#151515] to-[#0d0d0d] p-5 rounded-2xl border border-white/10">
              <Shield className="w-10 h-10 text-violet-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Activate Epoxy</h1>
          <p className="text-zinc-400 text-sm">
            Enter your Packet SDK license key to unlock Epoxy
          </p>
        </div>

        {/* Activation Form */}
        <div className="bg-gradient-to-br from-[#151515] to-[#0d0d0d] rounded-2xl border border-white/10 p-6">
          <div className="space-y-4">
            {/* License Key Input */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                License Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => {
                    setLicenseKey(e.target.value);
                    setActivationError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="EPOXY-XXXX-XXXX-XXXX-XXXX"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all font-mono text-sm"
                  disabled={isActivating}
                  autoFocus
                />
              </div>
            </div>

            {/* Error Message */}
            {(activationError || error) && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{activationError || error}</p>
              </div>
            )}

            {/* Activate Button */}
            <button
              onClick={handleActivate}
              disabled={isActivating || !licenseKey.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isActivating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Activate License
                </>
              )}
            </button>
          </div>

          {/* Machine ID */}
          {machineId && (
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-zinc-500 text-xs">
                <Cpu className="w-4 h-4" />
                <span className="font-mono">{machineId.substring(0, 16)}...</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-zinc-500 text-xs">
            Don't have a license?{' '}
            <a
              href="https://packet.dev/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Get one at packet.dev
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
