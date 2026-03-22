/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Cpu, Info, Table, Zap, Ruler, Activity, Layers, Share2, Edit2, Save, X, RotateCcw, Plus, Trash2 } from 'lucide-react';

interface MetalData {
  id: string;
  metal: string;
  current_density: number;
  sheet_resistance: number;
}

const DEFAULT_METAL_DATA: MetalData[] = [
  { id: '1', metal: "MET1", current_density: 0.82, sheet_resistance: 119 },
  { id: '2', metal: "MET2", current_density: 0.82, sheet_resistance: 115 },
  { id: '3', metal: "MET3", current_density: 0.82, sheet_resistance: 115 },
  { id: '4', metal: "MET4", current_density: 0.82, sheet_resistance: 115 },
  { id: '5', metal: "MET5", current_density: 0.82, sheet_resistance: 115 },
  { id: '6', metal: "METTP", current_density: 1.31, sheet_resistance: 46.8 },
  { id: '7', metal: "METTPL", current_density: 4.92, sheet_resistance: 16.25 },
];

export default function App() {
  // Metal Data State
  const [metals, setMetals] = useState<MetalData[]>(() => {
    const saved = localStorage.getItem('epical_metal_data');
    return saved ? JSON.parse(saved) : DEFAULT_METAL_DATA;
  });

  const [isEditingMetals, setIsEditingMetals] = useState(false);
  const [editMetals, setEditMetals] = useState<any[]>([]);

  const [selectedMetalId, setSelectedMetalId] = useState<string>(metals[0]?.id || '1');
  const [width, setWidth] = useState<string>("1");
  const [length, setLength] = useState<string>("10");

  // Network Resistance States
  const [seriesResistors, setSeriesResistors] = useState<string[]>(Array(8).fill(""));
  const [parallelResistors, setParallelResistors] = useState<string[]>(Array(8).fill(""));

  // Persist metals to localStorage
  useEffect(() => {
    localStorage.setItem('epical_metal_data', JSON.stringify(metals));
  }, [metals]);

  const currentMetal = useMemo(() => 
    metals.find(m => m.id === selectedMetalId) || metals[0] || DEFAULT_METAL_DATA[0]
  , [selectedMetalId, metals]);

  const currentCapacity = useMemo(() => {
    const w = parseFloat(width) || 0;
    return w * currentMetal.current_density;
  }, [width, currentMetal]);

  const impedance = useMemo(() => {
    const w = parseFloat(width) || 0;
    const l = parseFloat(length) || 0;
    if (w === 0) return 0;
    return (l / w) * (currentMetal.sheet_resistance / 1000);
  }, [length, width, currentMetal]);

  // Network Calculations
  const totalSeries = useMemo(() => {
    return seriesResistors
      .map(r => parseFloat(r))
      .filter(r => !isNaN(r))
      .reduce((acc, curr) => acc + curr, 0);
  }, [seriesResistors]);

  const totalParallel = useMemo(() => {
    const validResistors = parallelResistors
      .map(r => parseFloat(r))
      .filter(r => !isNaN(r) && r > 0);
    
    if (validResistors.length === 0) return 0;
    
    const sumInverse = validResistors.reduce((acc, curr) => acc + (1 / curr), 0);
    return 1 / sumInverse;
  }, [parallelResistors]);

  const handleSeriesChange = (index: number, value: string) => {
    const newResistors = [...seriesResistors];
    newResistors[index] = value;
    setSeriesResistors(newResistors);
  };

  const handleParallelChange = (index: number, value: string) => {
    const newResistors = [...parallelResistors];
    newResistors[index] = value;
    setParallelResistors(newResistors);
  };

  // Metal Editing Handlers
  const startEditing = () => {
    setEditMetals(metals.map(m => ({
      ...m,
      current_density: m.current_density.toString(),
      sheet_resistance: m.sheet_resistance.toString()
    })));
    setIsEditingMetals(true);
  };

  const cancelEditing = () => {
    setIsEditingMetals(false);
  };

  const saveMetals = () => {
    const parsedMetals = editMetals.map(m => ({
      ...m,
      current_density: parseFloat(m.current_density) || 0,
      sheet_resistance: parseFloat(m.sheet_resistance) || 0
    }));
    setMetals(parsedMetals);
    setIsEditingMetals(false);
    // Ensure selected metal still exists
    if (!parsedMetals.find(m => m.id === selectedMetalId)) {
      setSelectedMetalId(parsedMetals[0]?.id || '1');
    }
  };

  const updateEditMetal = (id: string, field: string, value: string) => {
    setEditMetals(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    }));
  };

  const addNewMetal = () => {
    const newId = Date.now().toString();
    setEditMetals(prev => [...prev, { id: newId, metal: "NEW_METAL", current_density: "", sheet_resistance: "" }]);
  };

  const deleteMetal = (id: string) => {
    if (editMetals.length <= 1) return;
    setEditMetals(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase flex items-center gap-2">
              <Cpu className="w-8 h-8 text-emerald-600" />
              EPICAL LAYOUTS
            </h1>
            <p className="text-sm text-black/60 font-medium uppercase tracking-widest mt-1">
              Innovation in Every Design
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-black/5 flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-mono font-bold uppercase tracking-tighter">Impedance Calculator</span>
          </div>
        </header>

        {/* Reference Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black/40">
              <Table className="w-4 h-4" />
              Metal Technology Reference Data
            </div>
            <div className="flex items-center gap-2">
              {!isEditingMetals ? (
                <>
                  <button 
                    onClick={startEditing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
                  >
                    <Edit2 className="w-3 h-3" /> Edit PDK Data
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={saveMetals}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md"
                  >
                    <Save className="w-3 h-3" /> Save Changes
                  </button>
                  <button 
                    onClick={cancelEditing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <div className="bg-[#1a1a1a] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest flex justify-between items-center">
              <span>Technology Parameters</span>
              {isEditingMetals && (
                <button onClick={addNewMetal} className="flex items-center gap-1 text-[9px] bg-emerald-600 px-2 py-0.5 rounded hover:bg-emerald-500 transition-colors">
                  <Plus className="w-3 h-3" /> Add Metal
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 bg-black/5">
                    <th className="px-4 py-3 text-[10px] uppercase font-bold text-black/40">Metal Layer</th>
                    <th className="px-4 py-3 text-[10px] uppercase font-bold text-black/40">CURRENT DENSITY (mA/µm)</th>
                    <th className="px-4 py-3 text-[10px] uppercase font-bold text-black/40">SHEET RESISTANCE (mΩ/Sq)</th>
                    {isEditingMetals && <th className="px-4 py-3 text-[10px] uppercase font-bold text-black/40 w-10">Action</th>}
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {(isEditingMetals ? editMetals : metals).map((m) => (
                    <tr key={m.id} className={`border-b border-black/5 hover:bg-emerald-50 transition-colors ${!isEditingMetals && selectedMetalId === m.id ? 'bg-emerald-50/50' : ''}`}>
                      <td className="px-4 py-2">
                        {isEditingMetals ? (
                          <input 
                            type="text" 
                            value={m.metal} 
                            onChange={(e) => updateEditMetal(m.id, 'metal', e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-full bg-white border border-black/10 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        ) : (
                          <span className="font-bold">{m.metal}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {isEditingMetals ? (
                          <input 
                            type="text" 
                            value={m.current_density} 
                            onChange={(e) => updateEditMetal(m.id, 'current_density', e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-full bg-white border border-black/10 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        ) : (
                          <span>{m.current_density}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {isEditingMetals ? (
                          <input 
                            type="text" 
                            value={m.sheet_resistance} 
                            onChange={(e) => updateEditMetal(m.id, 'sheet_resistance', e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-full bg-white border border-black/10 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        ) : (
                          <span>{m.sheet_resistance}</span>
                        )}
                      </td>
                      {isEditingMetals && (
                        <td className="px-4 py-2">
                          <button 
                            onClick={() => deleteMetal(m.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Main Calculator Section */}
        <section className="bg-white rounded-3xl shadow-md border border-black/5 p-6 md:p-8 space-y-8">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black/40 border-b border-black/5 pb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            Metal Routing Calculator
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Inputs */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1">Metal Type</label>
                <select 
                  value={selectedMetalId}
                  onChange={(e) => setSelectedMetalId(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-black/10 rounded-xl px-4 py-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                >
                  {metals.map(m => (
                    <option key={m.id} value={m.id}>{m.metal}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1 flex items-center gap-1">
                    <Ruler className="w-3 h-3" /> Width (µm)
                  </label>
                  <input 
                    type="text"
                    placeholder="Enter width..."
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-[#f9f9f9] border border-black/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/50 ml-1 flex items-center gap-1">
                    <Ruler className="w-3 h-3" /> Length (µm)
                  </label>
                  <input 
                    type="text"
                    placeholder="Enter length..."
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-[#f9f9f9] border border-black/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
                  Calculate Capacity
                </button>
                <button className="bg-[#1a1a1a] hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-black/20 active:scale-95">
                  Calculate Impedance
                </button>
              </div>
            </div>

            {/* Outputs */}
            <div className="bg-[#f9f9f9] rounded-2xl p-6 border border-black/5 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-black/5 shadow-sm">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-black/40 mb-1">Current Density</div>
                  <div className="text-lg font-mono font-bold text-emerald-600">{currentMetal.current_density} <span className="text-[10px] text-black/40">mA/µm</span></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-black/5 shadow-sm">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-black/40 mb-1">Sheet Resistance</div>
                  <div className="text-lg font-mono font-bold text-emerald-600">{currentMetal.sheet_resistance} <span className="text-[10px] text-black/40">mΩ/Sq</span></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-emerald-600 p-6 rounded-2xl shadow-xl shadow-emerald-600/10 text-white">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">Current Capacity (mA)</div>
                  <div className="text-4xl font-mono font-bold tracking-tighter">
                    {currentCapacity.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-xl shadow-black/10 text-white">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">Routing Metal Impedance (Ω)</div>
                  <div className="text-4xl font-mono font-bold tracking-tighter">
                    {impedance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Network Resistance Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Series Calculator */}
          <section className="bg-white rounded-3xl shadow-md border border-black/5 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black/40">
                <Layers className="w-4 h-4 text-blue-500" />
                Series Resistance
              </div>
              <div className="text-xs font-mono font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">R1 + R2 + ...</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {seriesResistors.map((val, idx) => (
                <div key={`series-${idx}`} className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-black ml-1">R{idx + 1} (Ω)</label>
                  <input 
                    type="text"
                    placeholder="---"
                    value={val}
                    onChange={(e) => handleSeriesChange(idx, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-[#f9f9f9] border border-black/10 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="bg-blue-600 p-4 rounded-xl text-white shadow-lg shadow-blue-600/20">
              <div className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-1">Total Series Resistance (Ω)</div>
              <div className="text-2xl font-mono font-bold tracking-tighter">
                {totalSeries.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </div>
            </div>
          </section>

          {/* Parallel Calculator */}
          <section className="bg-white rounded-3xl shadow-md border border-black/5 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black/40">
                <Share2 className="w-4 h-4 text-purple-500" />
                Parallel Resistance
              </div>
              <div className="text-xs font-mono font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded">1 / (Σ 1/Ri)</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {parallelResistors.map((val, idx) => (
                <div key={`parallel-${idx}`} className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-black ml-1">R{idx + 1} (Ω)</label>
                  <input 
                    type="text"
                    placeholder="---"
                    value={val}
                    onChange={(e) => handleParallelChange(idx, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-[#f9f9f9] border border-black/10 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="bg-purple-600 p-4 rounded-xl text-white shadow-lg shadow-purple-600/20">
              <div className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-1">Total Parallel Resistance (Ω)</div>
              <div className="text-2xl font-mono font-bold tracking-tighter">
                {totalParallel.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </div>
            </div>
          </section>
        </div>

        {/* Footer Info */}
        <footer className="bg-white/50 rounded-2xl p-4 border border-black/5 flex items-start gap-3">
          <Info className="w-5 h-5 text-black/20 mt-0.5" />
          <div className="text-[10px] text-black/40 leading-relaxed uppercase tracking-wider">
            <p className="font-bold mb-1">Calculation Logic:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div>
                <p>• Current Capacity = Width * Current Density</p>
                <p>• Routing Impedance = (Length / Width) * (Sheet Resistance / 1000)</p>
              </div>
              <div>
                <p>• Series R = R1 + R2 + ... + R8</p>
                <p>• Parallel R = 1 / (1/R1 + 1/R2 + ... + 1/R8)</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
