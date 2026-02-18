import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Building2,
    LogOut,
    Trash2,
    AlertTriangle,
    Search,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

import { API_URL } from '../apiConfig';

const MasterAdminDashboard = () => {
    const { token, logout, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ total_users: 0, total_businesses: 0 });
    const [users, setUsers] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user?.is_master_admin) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [activeTab, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            if (activeTab === 'overview') {
                const res = await fetch(`${API_URL}/admin/overview`, { headers });
                if (res.ok) setStats(await res.json());
            } else if (activeTab === 'users') {
                const res = await fetch(`${API_URL}/admin/users`, { headers });
                if (res.ok) setUsers(await res.json());
            } else if (activeTab === 'businesses') {
                const res = await fetch(`${API_URL}/admin/businesses`, { headers });
                if (res.ok) setBusinesses(await res.json());
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('User deleted');
                fetchData();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to delete user');
            }
        } catch (error) {
            toast.error('Error deleting user');
        }
    };

    const handleDeleteBusiness = async (bizId) => {
        if (!window.confirm('Are you sure you want to delete this business? All data will be lost.')) return;

        try {
            const res = await fetch(`${API_URL}/admin/businesses/${bizId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Business deleted');
                fetchData();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to delete business');
            }
        } catch (error) {
            toast.error('Error deleting business');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBusinesses = businesses.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary-500/30">
            {/* Navbar */}
            <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                            <span className="font-bold text-white text-xs">MA</span>
                        </div>
                        <span className="font-serif text-xl tracking-tight">Master Admin</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex space-x-1 bg-white/5 p-1 rounded-xl mb-8 w-fit">
                    {['overview', 'users', 'businesses'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="animate-fade-in-up">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                                <Users className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-slate-200">Total Users</h3>
                                        </div>
                                        <p className="text-4xl font-bold text-white">{stats.total_users}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                                <Building2 className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-slate-200">Total Businesses</h3>
                                        </div>
                                        <p className="text-4xl font-bold text-white">{stats.total_businesses}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div className="space-y-6">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50 transition-colors"
                                        />
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-4 font-semibold">User</th>
                                                    <th className="p-4 font-semibold">Role</th>
                                                    <th className="p-4 font-semibold">Stores Owned/Member</th>
                                                    <th className="p-4 font-semibold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10 text-sm">
                                                {filteredUsers.map(u => (
                                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="p-4">
                                                            <div className="font-medium text-white">{u.username}</div>
                                                            <div className="text-slate-500">{u.email}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            {u.is_master_admin ? (
                                                                <span className="inline-flex items-center px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                                                                    MASTER ADMIN
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400">Standard User</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex flex-wrap gap-2">
                                                                {u.businesses.length > 0 ? u.businesses.map((b, i) => (
                                                                    <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs text-slate-300 border border-white/10">
                                                                        {b}
                                                                    </span>
                                                                )) : <span className="text-slate-600 italic">None</span>}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {!u.is_master_admin && (
                                                                <button
                                                                    onClick={() => handleDeleteUser(u.id)}
                                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                                    title="Delete User"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'businesses' && (
                                <div className="space-y-6">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Search businesses..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50 transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredBusinesses.map(b => (
                                            <div key={b.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-primary-500/30 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">{b.name}</h3>
                                                        <p className="text-slate-500 text-xs mt-1">ID: {b.id} • Created: {b.created_at}</p>
                                                    </div>
                                                    <div className="p-2 bg-white/5 rounded-lg">
                                                        <Building2 className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mb-6">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">Members</span>
                                                        <span className="text-white font-medium">{b.member_count}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">Owners</span>
                                                        <div className="text-right">
                                                            {b.owners.map((o, i) => (
                                                                <div key={i} className="text-white font-medium">{o}</div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleDeleteBusiness(b.id)}
                                                    className="w-full py-2 flex items-center justify-center space-x-2 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-medium"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Delete Business</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MasterAdminDashboard;
