/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Plus, ArrowLeft, Zap, Moon, Sun, Trash2, Edit2, Download, Upload, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Pilgrim {
  id: string;
  name: string;
  age: string;
  gender: string;
  idProofType: string;
  idNumber: string;
}

export default function App() {
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [view, setView] = useState<'main' | 'form'>('main');
  const [editingPilgrim, setEditingPilgrim] = useState<Pilgrim | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [instantFill, setInstantFill] = useState(false);
  const [autoContinue, setAutoContinue] = useState(false);
  const [liteMode, setLiteMode] = useState(false);
  const [ttdDarkMode, setTtdDarkMode] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    idProofType: 'Aadhaar Card',
    idNumber: ''
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleAddClick = () => {
    setEditingPilgrim(null);
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      idProofType: 'Aadhaar Card',
      idNumber: ''
    });
    setView('form');
  };

  const handleEditClick = (p: Pilgrim) => {
    setEditingPilgrim(p);
    setFormData({
      name: p.name,
      age: p.age,
      gender: p.gender,
      idProofType: p.idProofType,
      idNumber: p.idNumber
    });
    setView('form');
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      setPilgrims(pilgrims.filter(p => p.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPilgrim) {
      setPilgrims(pilgrims.map(p => p.id === editingPilgrim.id ? { ...formData, id: p.id } : p));
    } else {
      setPilgrims([...pilgrims, { ...formData, id: Date.now().toString() }]);
    }
    setView('main');
  };

  const handleFill = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const pilgrimToDelete = pilgrims.find(p => p.id === confirmDeleteId);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4 font-sans">
      <div className="w-[400px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 relative">
        
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {confirmDeleteId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full shadow-2xl border border-gray-200 dark:border-gray-800"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Profile?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to delete the profile for <span className="font-bold text-gray-900 dark:text-white">"{pilgrimToDelete?.name}"</span>?
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 20, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium"
            >
              <CheckCircle2 size={16} />
              Autofill started on TTD portal!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">TTD Auto Fill Pro</h1>
            </div>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </header>

          <AnimatePresence mode="wait">
            {view === 'main' ? (
              <motion.div 
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Saved Profiles</h2>
                    {pilgrims.length > 0 && (
                      <button 
                        onClick={() => {
                          if (window.confirm('Clear all profiles?')) setPilgrims([]);
                        }}
                        className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-tighter"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={handleAddClick}
                    className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 transition-colors"
                  >
                    <Plus size={16} /> Add New
                  </button>
                </div>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                  {pilgrims.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                      <User className="mx-auto text-gray-300 dark:text-gray-700 mb-2" size={32} />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No pilgrims saved yet.</p>
                    </div>
                  ) : (
                    pilgrims.map((p, i) => (
                      <div key={p.id} className="group bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between hover:border-orange-200 dark:hover:border-orange-900/50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                            {i + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate max-w-[160px]">{p.name}</h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                              {p.age}y • {p.gender} • {p.idProofType}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 transition-opacity">
                          <button onClick={() => handleEditClick(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-8 space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instant Auto-Fill</span>
                        <span className="text-[8px] text-gray-400">Fills form as soon as it appears</span>
                      </div>
                      <button 
                        onClick={() => setInstantFill(!instantFill)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${instantFill ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${instantFill ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Auto-Continue</span>
                        <span className="text-[8px] text-gray-400">Clicks "Continue" after filling</span>
                      </div>
                      <button 
                        onClick={() => setAutoContinue(!autoContinue)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${autoContinue ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoContinue ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lite Mode (Speed Boost)</span>
                        <span className="text-[8px] text-gray-400">Blocks non-essential images/scripts</span>
                      </div>
                      <button 
                        onClick={() => setLiteMode(!liteMode)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${liteMode ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${liteMode ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">TTD Dark Mode</span>
                        <span className="text-[8px] text-gray-400">Easier on eyes for night bookings</span>
                      </div>
                      <button 
                        onClick={() => setTtdDarkMode(!ttdDarkMode)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${ttdDarkMode ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${ttdDarkMode ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleFill}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Zap size={20} fill="currentColor" />
                    Fill Current Page
                  </button>

                  <button 
                    onClick={() => setShowFab(true)}
                    className="w-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 py-3 rounded-2xl font-bold text-sm border border-orange-200 dark:border-orange-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                      <div className="w-2 h-2 bg-current rounded-full" />
                    </div>
                    Show Floating Button
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-xs font-bold transition-colors">
                      <Download size={14} /> Export
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-xs font-bold transition-colors">
                      <Upload size={14} /> Import
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => setView('main')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingPilgrim ? 'Edit Profile' : 'Add Pilgrim'}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                      placeholder="As per ID proof"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1">Age</label>
                      <input 
                        type="number" 
                        required
                        value={formData.age}
                        onChange={e => setFormData({...formData, age: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1">Gender</label>
                      <select 
                        value={formData.gender}
                        onChange={e => setFormData({...formData, gender: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white appearance-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1">ID Proof Type</label>
                    <select 
                      value={formData.idProofType}
                      onChange={e => setFormData({...formData, idProofType: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white appearance-none"
                    >
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="Passport">Passport</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1">ID Number</label>
                    <input 
                      type="text" 
                      required
                      value={formData.idNumber}
                      onChange={e => setFormData({...formData, idNumber: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                      placeholder="Enter ID number"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-600/20 mt-4 transition-all active:scale-95"
                  >
                    Save Profile
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="bg-gray-50 dark:bg-gray-800/30 p-4 text-center border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Privacy First • Local Storage Only</p>
        </footer>
      </div>

      {/* Preview Floating Button */}
      <AnimatePresence>
        {showFab && (
          <motion.div 
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-[100] flex flex-col items-center gap-2"
          >
            <button 
              onClick={handleFill}
              className="w-16 h-16 bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
            >
              <Zap size={28} fill="currentColor" />
              <div className="absolute -top-10 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                AutoFill Now
              </div>
            </button>
            <button 
              onClick={() => setShowFab(false)}
              className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-tighter"
            >
              Hide
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

