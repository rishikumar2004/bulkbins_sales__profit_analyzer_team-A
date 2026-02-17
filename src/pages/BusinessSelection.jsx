import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ExternalLink, Building2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FarmBg from '../assets/farm.jpg';
import Logo from '../assets/logo.png';

const BusinessSelection = () => {
    const { businesses, createBusiness, deleteBusiness, logout, user, setCurrentBusiness } = useAuth();
    const [newBusinessName, setNewBusinessName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreate = async (e) => {
        e.preventDefault();
        if (newBusinessName.trim()) {
            setLoading(true);
            const biz = await createBusiness(newBusinessName);
            setLoading(false);
            if (biz) {
                setNewBusinessName('');
                setIsCreating(false);
                setCurrentBusiness(biz);
                navigate(`/business/${biz.id}`);
            }
        }
    };

    const handleOpen = (business) => {
        setCurrentBusiness(business);
        navigate(`/business/${business.id}`);
    };

    return (
        <div className="relative w-full min-h-screen flex flex-col items-center bg-slate-950 font-sans selection:bg-primary-500/30 overflow-x-hidden">
            {/* Fixed Immersive Background */}
            <div className="fixed inset-0 z-0">
                <img src={FarmBg} alt="Background" className="w-full h-full object-cover scale-105 opacity-40 blur-[2px]" />
                <div className="absolute inset-0 bg-slate-950/80"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 w-full flex justify-center py-8">
                <div className="w-full max-w-[1200px] flex justify-between items-center px-6">
                    <div className="flex items-center space-x-4">
                        <img src={Logo} alt="Logo" className="w-12 h-12 object-contain rounded-md drop-shadow-[0_10px_30px_rgba(74,222,128,0.2)] animate-float" />
                        <span className="text-3xl font-serif text-white tracking-tighter">BulkBins</span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex flex-col items-end text-right hidden md:flex">
                            <span className="text-white text-lg font-medium">{user?.name}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="glass px-6 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/10 transition-all text-sm uppercase tracking-widest font-medium"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 w-full flex flex-col items-center py-12 md:py-20 flex-grow">
                <div className="max-w-[1200px] w-full px-6 flex flex-col items-center">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 tracking-tighter">Select your business</h1>
                        <p className="text-slate-400 text-lg font-medium">Choose a store to manage or initialize a new retail entity.</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 w-full">
                        {businesses.map((biz) => (
                            <div key={biz.id} className="glass p-8 rounded-[3rem] border-white/5 hover:border-primary-500/30 transition-all group relative animate-fade-in w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] max-w-sm">
                                <div className="absolute top-8 right-8">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${biz.role === 'Owner' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' :
                                        biz.role === 'Analyst' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-slate-500/10 text-slate-400 border-white/10'
                                        }`}>
                                        {biz.role}
                                    </span>
                                </div>

                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-primary-400 mb-8 group-hover:bg-primary-500/10 transition-colors">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-serif text-white mb-8 tracking-tight group-hover:translate-x-1 transition-transform">{biz.name}</h3>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleOpen(biz)}
                                        className="flex-grow bg-primary-500 text-white py-4 rounded-2xl tracking-widest uppercase text-lg flex items-center justify-center space-x-2 hover:bg-primary-600 transition-all font-medium"
                                    >
                                        <span>Open</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                    {biz.role === 'Owner' && (
                                        <button
                                            onClick={() => deleteBusiness(biz.id)}
                                            className="p-4 rounded-2xl bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/10"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isCreating ? (
                            <div className="glass p-8 rounded-[3rem] border-primary-500/50 bg-primary-500/5 animate-scale-in w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] max-w-sm">
                                <form onSubmit={handleCreate} className="h-full flex flex-col justify-between">
                                    <div>
                                        <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center text-primary-400 mb-8">
                                            <Plus className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-serif text-white mb-6 tracking-tight">New Retail Entity</h3>
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Business Name"
                                            value={newBusinessName}
                                            onChange={(e) => setNewBusinessName(e.target.value)}
                                            className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50 transition-all mb-4 font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-grow bg-primary-500 text-white py-4 rounded-2xl text-lg uppercase tracking-widest disabled:opacity-50 font-medium"
                                        >
                                            {loading ? 'Submitting...' : 'Register'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsCreating(false)}
                                            className="bg-white/5 text-slate-400 px-6 rounded-2xl text-lg uppercase tracking-widest hover:bg-white/10 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="glass p-8 rounded-[3rem] border-dashed border-white/10 hover:border-primary-500/50 transition-all group flex flex-col items-center justify-center text-slate-500 hover:text-primary-400 min-h-[300px] w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] max-w-sm"
                            >
                                <div className="p-6 rounded-3xl bg-white/5 mb-6 group-hover:bg-primary-500/10 transition-all border border-dashed border-white/10">
                                    <Plus className="w-10 h-10" />
                                </div>
                                <span className="uppercase tracking-[0.2em] text-sm font-medium">Create New Business</span>
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BusinessSelection;
