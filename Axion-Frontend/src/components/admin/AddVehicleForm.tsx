import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CarFront, CircleDashed, ShieldCheck } from 'lucide-react';
import { paths } from '../../constants/navigation';

export const AddVehicleForm: React.FC = () => {
  const [id, setId] = useState('');
  const [profile, setProfile] = useState('sedan_standard');
  const [scenario, setScenario] = useState('normal');
  const [registerWithSimulator, setRegisterWithSimulator] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id, profile, scenario, registerWithSimulator }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || res.statusText);
      }
      const data = await res.json();
      // Navigate to the vehicle detail page
      navigate(`/vehicles/${encodeURIComponent(id)}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.28em] text-muted-foreground/60">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Admin vehicle provisioning</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/8 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.28em] text-primary/80">Fleet onboarding</p>
                <h2 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">Create a new vehicle</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  Provision a vehicle record and optionally register it with the simulator so telemetry starts flowing immediately.
                </p>
              </div>

              <div className="hidden rounded-2xl border border-primary/20 bg-primary/10 p-4 text-right lg:block">
                <CarFront className="ml-auto h-5 w-5 text-primary" />
                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-primary/80">Asset control</p>
                <p className="mt-1 text-xs text-muted-foreground">Create, register, and monitor from one screen.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground/70">Vehicle ID</span>
                  <input
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    required
                    placeholder="fleet-a-251"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-background/70 px-4 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground/70">Vehicle Profile</span>
                  <select
                    value={profile}
                    onChange={(e) => setProfile(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-background/70 px-4 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="sedan_standard">Sedan Standard</option>
                    <option value="suv_standard">SUV Standard</option>
                    <option value="delivery_van">Delivery Van</option>
                    <option value="heavy_duty">Heavy Duty</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground/70">Scenario</span>
                  <select
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-background/70 px-4 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="normal">Normal</option>
                    <option value="battery_drain">Battery Drain</option>
                    <option value="network_dropout">Network Dropout</option>
                    <option value="temp_spike">Temperature Spike</option>
                  </select>
                </label>

                <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-background/70 px-4 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={registerWithSimulator}
                    onChange={(e) => setRegisterWithSimulator(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary/20"
                  />
                  <span>Register with simulator</span>
                </label>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-xs text-muted-foreground/70">
                  <CircleDashed className="h-4 w-4 text-primary/80" />
                  The vehicle will appear in the fleet roster immediately after creation.
                </p>

                <motion.button
                  type="submit"
                  disabled={loading || !id}
                  whileHover={{ scale: loading || !id ? 1 : 1.01 }}
                  whileTap={{ scale: loading || !id ? 1 : 0.98 }}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? 'Creating...' : 'Create Vehicle'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </motion.button>
              </div>
            </form>
          </section>

          <aside className="rounded-3xl border border-white/8 bg-black/20 p-6 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary/80">Provisioning guide</p>
            <div className="mt-6 space-y-4 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="font-semibold text-foreground">Step 1</p>
                <p className="mt-1">Choose a vehicle ID that matches the asset label used by your operations team.</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="font-semibold text-foreground">Step 2</p>
                <p className="mt-1">Pick the profile and scenario so the simulator starts with the right baseline behavior.</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="font-semibold text-foreground">Step 3</p>
                <p className="mt-1">Keep simulator registration enabled if you want immediate telemetry and dashboard visibility.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleForm;
