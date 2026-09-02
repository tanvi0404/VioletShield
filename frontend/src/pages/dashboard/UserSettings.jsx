import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  Building2,
  Users,
  Key,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  Activity,
  Sparkles,
  Loader2,
  Mail,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Award
} from "lucide-react";
import {
  getUserProfile,
  updateUserProfile,
  getOrganizations,
  createOrganization,
  getOrgMembers,
  inviteOrgMember,
  removeOrgMember,
  getAuditLogs
} from "../../api/authApi";

const UserSettings = () => {
  const [activeTab, setActiveTab] = useState("profile"); // profile, organizations, team, audit
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [activeOrgId, setActiveOrgId] = useState(null);
  const [orgMembers, setOrgMembers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Form states
  const [nameInput, setNameInput] = useState("");
  const [pwdInput, setPwdInput] = useState("");
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // New Org Form
  const [newOrgName, setNewOrgName] = useState("");
  const [creatingOrg, setCreatingOrg] = useState(false);

  // Invite Member Form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("ANALYST");
  const [invitingMember, setInvitingMember] = useState(false);
  const [memberMsg, setMemberMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [profileData, orgsData, logsData] = await Promise.all([
        getUserProfile().catch(() => null),
        getOrganizations().catch(() => []),
        getAuditLogs().catch(() => [])
      ]);

      if (profileData) {
        setUser(profileData);
        setNameInput(profileData.name || "");
      }
      setOrganizations(orgsData || []);
      setAuditLogs(logsData || []);

      if (orgsData && orgsData.length > 0) {
        const initialOrgId = orgsData[0].id;
        setActiveOrgId(initialOrgId);
        loadOrgMembers(initialOrgId);
      }
    } catch (err) {
      console.error("DATA LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrgMembers = async (orgId) => {
    try {
      const members = await getOrgMembers(orgId);
      setOrgMembers(members || []);
    } catch (err) {
      console.error("MEMBERS LOAD ERROR:", err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: "", text: "" });

    try {
      const payload = { name: nameInput };
      if (pwdInput.trim()) payload.password = pwdInput.trim();
      const res = await updateUserProfile(payload);
      setProfileMsg({ type: "success", text: "Profile settings updated successfully!" });
      setPwdInput("");
      if (res.user) setUser((prev) => ({ ...prev, ...res.user }));
    } catch (err) {
      setProfileMsg({ type: "error", text: err.response?.data?.error || "Failed to update profile" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setCreatingOrg(true);

    try {
      await createOrganization(newOrgName.trim());
      setNewOrgName("");
      const orgs = await getOrganizations();
      setOrganizations(orgs || []);
      if (orgs.length > 0) {
        setActiveOrgId(orgs[orgs.length - 1].id);
        loadOrgMembers(orgs[orgs.length - 1].id);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create organization");
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeOrgId) return;
    setInvitingMember(true);
    setMemberMsg({ type: "", text: "" });

    try {
      await inviteOrgMember(activeOrgId, { email: inviteEmail.trim(), role: inviteRole });
      setInviteEmail("");
      setMemberMsg({ type: "success", text: `Successfully invited ${inviteEmail} as ${inviteRole}` });
      loadOrgMembers(activeOrgId);
    } catch (err) {
      setMemberMsg({ type: "error", text: err.response?.data?.error || "Failed to invite member" });
    } finally {
      setInvitingMember(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this member from the organization?")) return;
    try {
      await removeOrgMember(activeOrgId, memberId);
      loadOrgMembers(activeOrgId);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove member");
    }
  };

  const getRoleBadgeColor = (role) => {
    switch ((role || "").toUpperCase()) {
      case "OWNER":
      case "ADMIN":
        return "border-purple-500/40 bg-purple-500/15 text-purple-300";
      case "ANALYST":
        return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
      case "VIEWER":
      default:
        return "border-zinc-700 bg-zinc-800 text-zinc-300";
    }
  };

  const tabs = [
    { id: "profile", label: "User Profile & RBAC", icon: <User size={16} /> },
    { id: "organizations", label: "Workspaces", icon: <Building2 size={16} /> },
    { id: "team", label: "Team Members", icon: <Users size={16} /> },
    { id: "audit", label: "Security Audit Trail", icon: <History size={16} /> },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 size={36} className="animate-spin mx-auto text-purple-400" />
        <p className="text-sm font-mono text-zinc-400">Loading user profile and workspace RBAC policies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-zinc-950 to-black p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-300">
              <Sparkles size={14} className="text-purple-400" />
              Phase 13 Multi-Tenant Access Control & User Management
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              User Profile & Team Governance
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl">
              Configure user identity, organization workspaces, Role-Based Access Control (RBAC) clearances, and immutable security audit logs.
            </p>
          </div>

          {/* ACTIVE CLEARANCE PILL */}
          <div className="rounded-2xl border border-purple-500/30 bg-zinc-900/90 p-4 font-mono text-center shrink-0">
            <span className="text-[10px] text-zinc-500 block uppercase">Active Clearance</span>
            <span className="text-lg font-black text-purple-300">{user?.role || "ADMIN"}</span>
          </div>
        </div>
      </motion.div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === t.id
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: PROFILE & RBAC */}
      {activeTab === "profile" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User size={18} className="text-purple-400" />
              Account Credentials & Details
            </h2>

            {profileMsg.text && (
              <div
                className={`flex items-center gap-2 rounded-xl p-3 text-xs font-mono ${
                  profileMsg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                }`}
              >
                {profileMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Full Name / Operator Alias</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Registered Email (Read-Only)</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-2.5 text-xs text-zinc-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Change Password (Leave blank to retain current)</label>
                <input
                  type="password"
                  placeholder="Enter new strong password..."
                  value={pwdInput}
                  onChange={(e) => setPwdInput(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition disabled:opacity-50"
              >
                {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>

          {/* CLEARANCE & PERMISSIONS CARD */}
          <div className="rounded-3xl border border-purple-500/20 bg-zinc-950/90 p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              RBAC Authorization Matrix
            </h2>

            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase block font-sans">Role Level</span>
                <span className={`inline-block rounded-md border px-2 py-0.5 font-bold ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role || "ADMIN"}
                </span>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2 font-sans text-xs">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Clearance Permissions</span>
                <ul className="space-y-1.5 text-zinc-400">
                  <li className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={13} /> Full Nmap, Web, and CVE Scanning
                  </li>
                  <li className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={13} /> ExploitDB PoC Searches & AI Risk Engine
                  </li>
                  <li className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={13} /> PDF, HTML, JSON Report Downloads
                  </li>
                  <li className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={13} /> Team Management & Workspace Invitations
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: WORKSPACES */}
      {activeTab === "organizations" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* WORKSPACES LIST */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 size={18} className="text-purple-400" />
                Active Organization Workspaces
              </h2>

              <div className="space-y-3">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    className={`rounded-2xl border p-5 transition flex items-center justify-between ${
                      activeOrgId === org.id
                        ? "border-purple-500/60 bg-purple-950/20 shadow-lg shadow-purple-500/5"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-purple-400" />
                        <h3 className="font-bold text-white text-sm">{org.name}</h3>
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold font-mono ${getRoleBadgeColor(org.member_role)}`}>
                          {org.member_role || "MEMBER"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-mono">
                        Slug: {org.slug} • {org.members_count || 1} Member(s)
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveOrgId(org.id);
                        loadOrgMembers(org.id);
                      }}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition font-mono ${
                        activeOrgId === org.id ? "bg-purple-600 text-white" : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {activeOrgId === org.id ? "Active Workspace" : "Switch to Org"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CREATE NEW ORG */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-purple-400" />
                Create New Workspace
              </h2>
              <p className="text-xs text-zinc-400">Establish an isolated organization workspace with dedicated telemetry and team members.</p>

              <form onSubmit={handleCreateOrg} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Organization Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Red Team Security Lab"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingOrg}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition disabled:opacity-50"
                >
                  {creatingOrg ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Provision Workspace</span>
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: TEAM MEMBERS */}
      {activeTab === "team" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* MEMBERS LIST */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-purple-400" />
                  Workspace Team Roster ({orgMembers.length} Members)
                </h2>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] uppercase font-bold text-zinc-400">
                      <th className="py-3 px-4">Operator</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Clearance Role</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {orgMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-zinc-900/40 transition">
                        <td className="py-3 px-4 font-sans font-bold text-white">{m.name}</td>
                        <td className="py-3 px-4 text-zinc-400">{m.email}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${getRoleBadgeColor(m.role)}`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {m.role !== "OWNER" && (
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-600 hover:text-white transition"
                              title="Remove Member"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* INVITE MEMBER FORM */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus size={18} className="text-purple-400" />
                Invite Team Member
              </h2>

              {memberMsg.text && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-xs font-mono ${
                    memberMsg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                  }`}
                >
                  {memberMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{memberMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleInviteMember} className="space-y-3 font-sans">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="analyst@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-white outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Assigned RBAC Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-white outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="ADMIN">ADMIN (Full Permissions)</option>
                    <option value="ANALYST">ANALYST (Execute Scans & Reports)</option>
                    <option value="VIEWER">VIEWER (Read-Only Dashboards)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={invitingMember}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition disabled:opacity-50"
                >
                  {invitingMember ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  <span>Send Workspace Invitation</span>
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === "audit" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History size={18} className="text-purple-400" />
              Security Action Logs & Audit Records ({auditLogs.length} Events)
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] uppercase font-bold text-zinc-400">
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Origin</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 text-xs">
                      No security audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-900/40 transition">
                      <td className="py-3 px-4">
                        <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-bold">{log.target}</td>
                      <td className="py-3 px-4 text-zinc-400 font-sans text-[11px] max-w-xs truncate">{log.details}</td>
                      <td className="py-3 px-4 text-zinc-500">{log.ip_address}</td>
                      <td className="py-3 px-4 text-right text-zinc-400 text-[11px]">{log.timestamp?.slice(0, 19)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UserSettings;
