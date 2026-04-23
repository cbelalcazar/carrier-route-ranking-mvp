import React, { useState } from 'react';
import { 
  Truck, MapPin, BarChart3, 
  Activity, Globe, Info, Navigation, X
} from 'lucide-react';
import RouteMap from './components/RouteMap';
import { CarrierRanking } from './components/features/CarrierRanking';
import { useCarrierSearch } from './hooks/useCarrierSearch';
import { UI_SUGGESTIONS } from './constants/cities';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function ErrorFallback({ error }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="flex flex-col items-center justify-center p-8 text-white bg-[#0B1426] rounded-3xl border border-red-500/20 shadow-2xl">
      <h2 className="text-lg font-bold mb-2">Component Protocol Error</h2>
      <pre className="text-[10px] text-red-400 bg-black/40 p-4 rounded-xl">{message || 'Unknown Error'}</pre>
    </div>
  );
}

export default function App() {
  console.log("Genlogs Portal Booting... API URL:", import.meta.env.VITE_API_URL);
  const [localOrigin, setLocalOrigin] = useState('');
  const [localDest, setLocalDest] = useState('');
  
  const {
    originData,
    destData,
    loading,
    error,
    data,
    search
  } = useCarrierSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search(localOrigin, localDest);
  };

  return (
    <div className="h-screen bg-[#0B1426] text-white font-sans flex flex-col overflow-hidden selection:bg-[#2D7DFA]/30">
      
      <header role="banner" className="bg-black/60 backdrop-blur-2xl border-b border-white/10 px-8 py-5 flex items-center justify-between shrink-0 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-[#2D7DFA] p-2.5 rounded-2xl shadow-[0_0_25px_rgba(45,125,250,0.5)]" aria-hidden="true">
            <Truck className="text-white w-6 h-6" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-none">Genlogs <span className="text-[#2D7DFA]">Portal</span></h1>
            <p className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-[0.2em] mt-1.5 opacity-80 italic">Intelligence Cluster</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/15 shadow-inner" aria-label="Search routes">
          
          {/* ORIGIN INPUT WITH CLEAR BUTTON */}
          <div className={cn(
            "relative transition-all duration-300 rounded-xl group flex items-center",
            originData ? "bg-emerald-500/10" : "hover:bg-white/5"
          )}>
            <label htmlFor="origin" className="sr-only">Origin City</label>
            <MapPin className={cn("absolute left-3 w-4 h-4 transition-colors duration-300", originData ? 'text-emerald-400' : 'text-[#A0AEC0]')} aria-hidden="true" />
            <input 
              id="origin"
              list="city-list"
              type="text" 
              placeholder="Origin node..." 
              autoComplete="off"
              className="pl-10 pr-10 py-2.5 bg-transparent text-sm font-bold text-white outline-none w-52 border-r border-white/10 placeholder:text-white/30 focus:text-[#2D7DFA]"
              value={localOrigin}
              onChange={(e) => setLocalOrigin(e.target.value)}
            />
            {localOrigin && (
              <button 
                type="button"
                onClick={() => setLocalOrigin('')}
                className="absolute right-3 p-1 hover:bg-white/10 rounded-full transition-colors group/btn"
                aria-label="Clear origin"
              >
                <X className="w-3 h-3 text-[#A0AEC0] group-hover/btn:text-white" />
              </button>
            )}
          </div>
          
          {/* DESTINATION INPUT WITH CLEAR BUTTON */}
          <div className={cn(
            "relative transition-all duration-300 rounded-xl group flex items-center",
            destData ? "bg-emerald-500/10" : "hover:bg-white/5"
          )}>
            <label htmlFor="destination" className="sr-only">Destination City</label>
            <Navigation className={cn("absolute left-3 w-4 h-4 transition-colors duration-300", destData ? 'text-emerald-400' : 'text-[#A0AEC0]')} aria-hidden="true" />
            <input 
              id="destination"
              list="city-list"
              type="text" 
              placeholder="Destination node..." 
              autoComplete="off"
              className="pl-10 pr-10 py-2.5 bg-transparent text-sm font-bold text-white outline-none w-52 placeholder:text-white/30 focus:text-[#2D7DFA]"
              value={localDest}
              onChange={(e) => setLocalDest(e.target.value)}
            />
            {localDest && (
              <button 
                type="button"
                onClick={() => setLocalDest('')}
                className="absolute right-2 p-1 hover:bg-white/10 rounded-full transition-colors group/btn"
                aria-label="Clear destination"
              >
                <X className="w-3 h-3 text-[#A0AEC0] group-hover/btn:text-white" />
              </button>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || !localOrigin || !localDest}
            className="bg-[#2D7DFA] hover:bg-white hover:text-[#0B1426] disabled:bg-white/10 text-white px-10 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 shadow-xl shadow-[#2D7DFA]/20 border border-white/10 ml-2"
          >
            {loading ? '...' : 'SEARCH'}
          </button>
        </form>

        <datalist id="city-list">
          {UI_SUGGESTIONS.map(c => <option key={c} value={c} />)}
        </datalist>

        <div className="hidden lg:flex items-center gap-5">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Network Verified</span>
              <div className="flex items-center gap-2 mt-1">
                 <Activity className="w-3 h-3 text-emerald-400 animate-pulse" aria-hidden="true" />
                 <span className="text-[9px] font-bold text-[#A0AEC0] uppercase tracking-tighter">Latency: 0.2ms</span>
              </div>
           </div>
        </div>
      </header>

      <main className="flex-1 flex min-h-0 bg-[radial-gradient(circle_at_center,_#1A2B4B_0%,_#0B1426_100%)]">
        
        <section aria-labelledby="ranking-title" className="w-[450px] border-r border-white/10 bg-black/30 backdrop-blur-md flex flex-col shrink-0 overflow-hidden shadow-2xl z-40">
           <div className="px-8 py-7 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="bg-[#2D7DFA]/15 p-2.5 rounded-xl border border-[#2D7DFA]/30 text-[#2D7DFA]" aria-hidden="true">
                    <BarChart3 className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 id="ranking-title" className="text-sm font-black text-white uppercase tracking-[0.15em] leading-none">Carrier Inventory</h2>
                    <p className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-widest mt-2 opacity-70">Observed Node Activity</p>
                 </div>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8">
              <CarrierRanking 
                carriers={data?.carriers || []} 
                loading={loading} 
                hasData={!!data}
              />
              {error && (
                <div className="p-4 mt-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 items-start">
                   <Activity className="w-4 h-4 shrink-0 mt-0.5" />
                   <p className="text-[10px] font-bold uppercase tracking-tight">System Error: {error}</p>
                </div>
              )}
           </div>

           <div className="p-8 border-t border-white/10 bg-black/40">
              <div className="bg-[#2D7DFA]/5 p-5 rounded-2xl border border-[#2D7DFA]/10 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-[#2D7DFA]" aria-hidden="true" />
                 <div className="flex items-center gap-2 mb-3">
                    <div className="bg-[#2D7DFA]/20 p-1 rounded-lg">
                       <Info className="w-4 h-4 text-[#2D7DFA]" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Architecture Note</span>
                 </div>
                 <p className="text-[10px] text-[#A0AEC0] leading-relaxed font-medium uppercase tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">
                    Server state managed via TanStack Query with Zod validation. Component decomposition following L7 standards.
                 </p>
              </div>
           </div>
        </section>

        <section aria-label="Geographic Visualization" className="flex-1 relative overflow-hidden bg-[#060b16]">
           <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
              <div className="bg-black/60 backdrop-blur-2xl text-white px-6 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-5 border border-white/10">
                 <div className="flex items-center gap-3">
                    <div className="bg-[#2D7DFA]/20 p-1.5 rounded-lg">
                       <Globe className="w-4 h-4 text-[#2D7DFA]" aria-hidden="true" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">Network Topology</span>
                 </div>
              </div>
           </div>
           
           <div className="absolute inset-0">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <RouteMap origin={originData || undefined} destination={destData || undefined} />
              </ErrorBoundary>
           </div>
           
           <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" aria-hidden="true" />
        </section>
      </main>

      <footer role="contentinfo" className="px-10 py-4 bg-black/60 border-t border-white/10 flex items-center justify-between shrink-0 backdrop-blur-xl">
         <div className="flex gap-10">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-[#2D7DFA] rounded-full shadow-[0_0_12px_#2D7DFA]" aria-hidden="true" />
               <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.25em]">OLAP Engine Active</span>
            </div>
         </div>
         <div className="flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-500 cursor-default">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">© 2026 GENLOGS GLOBAL INTELLIGENCE</span>
         </div>
      </footer>
    </div>
  );
}
