"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Mail,
  User,
  X,
  Save,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUsers, createUser, updateUser, deleteUser, getMe } from "@/app/(main)/actions/users";
import { redirect } from "next/navigation";

export default function UsersPage() {
  const [userList, setUserList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "contributor" });

  useEffect(() => {
    checkAdmin();
    fetchUsers();
  }, []);

  async function checkAdmin() {
    const me = await getMe();
    if (!me || me.role !== "admin") {
      redirect("/dashboard");
    }
  }

  async function fetchUsers() {
    setIsLoading(true);
    const users = await getUsers();
    setUserList(users);
    setIsLoading(false);
  }

  const filteredUsers = userList.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: "", role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: "", email: "", password: "", role: "contributor" });
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingUser) {
        const updateData: any = { name: formData.name, email: formData.email, role: formData.role };
        if (formData.password) updateData.password = formData.password;
        
        const res = await updateUser(editingUser.id, updateData);
        if (res.success) {
          setIsModalOpen(false);
          fetchUsers();
        } else {
          setError(res.error);
        }
      } else {
        const res = await createUser(formData);
        if (res.success) {
          setIsModalOpen(false);
          fetchUsers();
        } else {
          setError(res.error);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this user access?")) return;
    
    const res = await deleteUser(id);
    if (res.success) {
      fetchUsers();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-500">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">User Management</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 uppercase tracking-widest font-mono text-[10px]">Access Control & Identity Nodes</p>
            </div>
          </div>
          <div className="h-[1px] w-64 bg-gradient-to-r from-teal-500/50 to-transparent"></div>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-lg shadow-teal-500/20 active:scale-95"
        >
          <UserPlus size={16} />
          Provision New Node
        </button>
      </div>

      {/* Main Table Interface */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm relative">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by identity or email link..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden sm:block">
            Found: {filteredUsers.length} Nodes
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 dark:bg-slate-900/20 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-800">Identity</th>
                <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-800">Email Address</th>
                <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-800">Privileges</th>
                <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Scanning Repository...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 text-xs font-mono uppercase">
                    No matching identity nodes identified in the current sector.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-teal-500 transition-colors">
                          <User size={14} />
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Mail size={12} className="text-teal-500/50" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                        user.role === 'admin' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' :
                        user.role === 'editor' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                        'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                      }`}>
                        <ShieldCheck size={10} />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-all"
                          title="Edit Node"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Deprovision Node"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="group-hover:hidden">
                        <MoreVertical size={16} className="text-slate-300 ml-auto" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Decorative corner lines for table */}
        <div className="absolute top-0 right-0 w-8 h-[1px] bg-teal-500/20"></div>
        <div className="absolute top-0 right-0 w-[1px] h-8 bg-teal-500/20"></div>
      </div>

      {/* Provisioning Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
                    {editingUser ? <Edit2 size={18} /> : <UserPlus size={18} />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
                    {editingUser ? "Edit Identity Node" : "Provision New Access"}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Display Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all placeholder:text-slate-300"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all placeholder:text-slate-300"
                      placeholder="admin@tp-muni.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Access Key {editingUser && "(Leave blank to keep current)"}
                    </label>
                    <input 
                      type="password" 
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all placeholder:text-slate-300 font-mono"
                      placeholder="••••••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">System Role</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                    >
                      <option value="admin">Admin (Full Control)</option>
                      <option value="editor">Editor (No User Access)</option>
                      <option value="contributor">Contributor (Read Only)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-lg transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                    {editingUser ? "Update Protocols" : "Establish Identity"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
