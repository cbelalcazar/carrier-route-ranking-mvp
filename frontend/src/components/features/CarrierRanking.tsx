import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Info } from 'lucide-react';
import type { Carrier } from '../../types';

interface CarrierRankingProps {
  carriers: Carrier[];
  loading: boolean;
  hasData: boolean;
}

export function CarrierRanking({ carriers, loading, hasData }: CarrierRankingProps) {
  if (loading) {
    return (
      <div className="space-y-3 px-6 py-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!hasData ? (
        <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
          <BarChart3 className="w-16 h-16 mb-6 text-white animate-[pulse_4s_infinite]" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center px-12 leading-loose text-white">Awaiting Geo-Route Protocol</p>
        </div>
      ) : carriers.length > 0 ? (
        <motion.div 
          key="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {carriers.map((carrier, idx) => (
            <motion.div 
              key={`${carrier.name}-${idx}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group p-5 rounded-2xl border border-white/5 bg-white/[0.03] hover:border-[#2D7DFA]/50 hover:bg-[#2D7DFA]/5 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-5 min-w-0">
                <div className="w-10 h-10 bg-white/5 group-hover:bg-[#2D7DFA] group-hover:text-white rounded-xl flex items-center justify-center text-xs font-black text-[#A0AEC0] transition-all shrink-0 border border-white/5">
                  0{idx + 1}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-sm group-hover:text-[#2D7DFA] transition-colors truncate mb-1">{carrier.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-[#2D7DFA] rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-[#A0AEC0] uppercase tracking-tighter">Verified Activity</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="text-2xl font-black text-white group-hover:text-[#2D7DFA] transition-colors leading-none tracking-tighter">{carrier.trucks_per_day}</div>
                <div className="text-[8px] font-black text-[#A0AEC0] uppercase tracking-tighter mt-1">Trucks / Day</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-full flex flex-col items-center justify-center py-20 bg-blue-500/5 rounded-3xl border border-white/5"
        >
          <Info className="w-12 h-12 mb-4 text-[#7059C1]" />
          <p className="text-sm font-bold text-white uppercase tracking-widest text-center">No Capacity Detected</p>
          <p className="text-[10px] text-[#A0AEC0] mt-2 text-center px-8 uppercase">Check route nodes for discrepancy. The analyzed corridor yielded zero matching carriers.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
