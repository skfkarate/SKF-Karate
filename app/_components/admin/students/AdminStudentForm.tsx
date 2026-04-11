'use client';

import { useState, useMemo } from 'react';
import { BELTS } from '@/lib/data/belts';
import { DEFAULT_POINTS, calculateTournamentPoints } from '@/lib/utils/points';

export default function AdminStudentForm({ initialData = null, isEditing = false, onSave }) {
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState(initialData || {
    firstName: '', lastName: '', dateOfBirth: '', gender: 'male', photoUrl: '',
    branchName: 'Sunkadakatte', currentBelt: 'white', joinDate: new Date().toISOString().split('T')[0], status: 'active',
    parentName: '', phone: '', email: '', isPublic: true, isFeatured: false,
    achievements: [], pointsHistory: [], pointsBalance: 0, pointsLifetime: 0
  });

  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    type: 'belt-grading', date: new Date().toISOString().split('T')[0],
    title: 'Passed White Belt Grading', description: '', pointsAwarded: DEFAULT_POINTS['belt-grading'], photoUrl: '',
    beltEarned: 'white', tournamentName: '', tournamentLevel: 'inter-dojo', eventCategory: '', ageGroup: 'Sub-Junior', awardedBy: '', awardReason: ''
  });

  const handleInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveAchievement = () => {
    // Determine points logic if it is tournament
    let pts = newAchievement.pointsAwarded;
    if (newAchievement.type.startsWith('tournament')) {
      pts = calculateTournamentPoints(newAchievement.type, newAchievement.tournamentLevel);
    }

    const achievementToAdd = {
      ...newAchievement,
      id: `ach_${Date.now()}`,
      pointsAwarded: parseInt(pts) || 0
    };

    const newHistory = {
      id: `pt_${Date.now()}`,
      date: newAchievement.date,
      description: achievementToAdd.title,
      points: achievementToAdd.pointsAwarded,
      balance: formData.pointsBalance + achievementToAdd.pointsAwarded
    };

    setFormData(prev => ({
      ...prev,
      achievements: [achievementToAdd, ...prev.achievements],
      pointsHistory: [newHistory, ...prev.pointsHistory],
      pointsBalance: prev.pointsBalance + achievementToAdd.pointsAwarded,
      pointsLifetime: prev.pointsLifetime + Math.max(0, achievementToAdd.pointsAwarded),
      // Automatically upgrade current belt if they passed a grading
      currentBelt: newAchievement.type === 'belt-grading' ? newAchievement.beltEarned : prev.currentBelt
    }));

    setShowAchievementModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
  };

  return (
    <div className="glass-card rounded-2xl shadow-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden max-w-5xl mx-auto bg-[#0a0f1c]">

      {/* Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.1)] bg-[rgba(20,33,61,0.5)] uppercase tracking-[0.2em] text-xs font-bold">
        {['info', 'achievements', 'points'].map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-5 text-center transition-all duration-300 ${activeTab === tab ? 'bg-[rgba(214,40,40,0.1)] text-white border-b-2 border-brand-red shadow-[inset_0_-2px_10px_rgba(214,40,40,0.2)]' : 'text-gray-500 hover:bg-[rgba(255,255,255,0.02)] hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-10">

        {/* Tab 1: Info (The main form) */}
        <form onSubmit={handleSubmit} className={activeTab === 'info' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Details */}
            <div className="space-y-5 bg-[rgba(0,0,0,0.3)] p-6 rounded-xl border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-lg font-bold text-white border-b border-[rgba(255,255,255,0.1)] pb-3 flex items-center gap-2"><span className="text-brand-red">■</span> Personal Details</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">First Name *</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleInfoChange} type="text" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Last Name *</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleInfoChange} type="text" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Date of Birth *</label>
                  <input required name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInfoChange} type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gender *</label>
                  <select required name="gender" value={formData.gender} onChange={handleInfoChange} className="input-field">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Photo URL</label>
                <input name="photoUrl" value={formData.photoUrl} onChange={handleInfoChange} type="text" placeholder="https://..." className="input-field" />
              </div>

              <h3 className="text-lg font-bold text-white border-b border-[rgba(255,255,255,0.1)] pb-3 pt-6 flex items-center gap-2"><span className="text-gray-500">■</span> Contact (Admin Only)</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Parent Name</label>
                  <input name="parentName" value={formData.parentName} onChange={handleInfoChange} type="text" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone</label>
                  <input name="phone" value={formData.phone} onChange={handleInfoChange} type="tel" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                <input name="email" value={formData.email} onChange={handleInfoChange} type="email" className="input-field" />
              </div>
            </div>

            {/* Association Details */}
            <div className="space-y-5 bg-[rgba(0,0,0,0.3)] p-6 rounded-xl border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-lg font-bold text-white border-b border-[rgba(255,255,255,0.1)] pb-3 flex items-center gap-2"><span className="text-gold">■</span> Association Details</h3>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Registration Number</label>
                <input readOnly={isEditing} name="registrationNumber" value={formData.registrationNumber || 'Auto-generated on save'} onChange={handleInfoChange} type="text" className={`w-full border rounded p-3 font-mono tracking-widest ${isEditing ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] text-gray-500 cursor-not-allowed' : 'bg-[rgba(20,33,61,0.5)] text-brand-red border-[rgba(255,255,255,0.1)] focus:border-brand-red outline-none'}`} />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Branch *</label>
                  <select required name="branchName" value={formData.branchName} onChange={handleInfoChange} className="input-field">
                    {['Sunkadakatte', 'Rajajinagar', 'Malleshwaram', 'Yeshwanthpur', 'Vijayanagar'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status *</label>
                  <select required name="status" value={formData.status} onChange={handleInfoChange} className="input-field">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Belt *</label>
                  <select required name="currentBelt" value={formData.currentBelt} onChange={handleInfoChange} className="input-field">
                    {BELTS.map(b => (
                      <option key={b.colour} value={b.colour}>{b.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Join Date *</label>
                  <input required name="joinDate" value={formData.joinDate} onChange={handleInfoChange} type="date" className="input-field" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white border-b border-[rgba(255,255,255,0.1)] pb-3 pt-6 flex items-center gap-2"><span className="text-gray-500">■</span> Visibility Flags</h3>
              <div className="flex gap-6 mt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input name="isPublic" type="checkbox" checked={formData.isPublic} onChange={handleInfoChange} className="w-5 h-5 bg-[rgba(20,33,61,0.5)] border border-[rgba(255,255,255,0.1)] rounded focus:ring-brand-red text-brand-red" />
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Public Profile</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input name="isFeatured" type="checkbox" checked={formData.isFeatured} onChange={handleInfoChange} className="w-5 h-5 bg-[rgba(20,33,61,0.5)] border border-[rgba(255,255,255,0.1)] rounded focus:ring-gold text-gold" />
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Featured Athlete</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-4 border-t border-[rgba(255,255,255,0.1)] pt-8">
            <button type="submit" className="bg-brand-red text-white py-4 px-10 rounded font-bold uppercase tracking-widest hover:bg-red-700 transition shadow-[0_0_20px_rgba(214,40,40,0.4)] hover:shadow-[0_0_30px_rgba(214,40,40,0.6)] border border-red-500 text-sm">
              {isEditing ? 'Save Changes' : 'Create Athlete Profile'}
            </button>
          </div>
        </form>

        {/* Tab 2: Achievements */}
        {activeTab === 'achievements' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8 border-b border-[rgba(255,255,255,0.1)] pb-4">
              <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                <span className="text-brand-red">■</span> Achievements Timeline
              </h3>
              <button onClick={() => setShowAchievementModal(true)} className="bg-[rgba(255,255,255,0.05)] text-white px-5 py-2.5 rounded shadow-[0_5px_15px_rgba(0,0,0,0.3)] font-bold tracking-widest uppercase text-xs hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] flex items-center gap-2 hover:border-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Record Event
              </button>
            </div>

            {formData.achievements.length === 0 ? (
              <div className="glass-card text-center p-10 border border-[rgba(255,255,255,0.05)] rounded-2xl">
                <p className="text-gray-500 italic">No achievements recorded yet. Oss!</p>
              </div>
            ) : (
              <div className="border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden divide-y divide-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.3)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                {formData.achievements.map((ach, idx) => (
                  <div key={idx} className="p-5 flex items-center justify-between hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                    <div>
                      <p className="font-bold text-white tracking-wide">{ach.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm font-semibold">
                        <span className="text-gray-500">{new Date(ach.date).toLocaleDateString()}</span>
                        <span className="text-[rgba(255,255,255,0.1)]">&bull;</span>
                        <span className="text-gold">+{ach.pointsAwarded} pts</span>
                      </div>
                    </div>
                    <div>
                      <button className="text-red-500/50 hover:text-red-500 text-xs uppercase tracking-widest font-black transition-colors px-3 py-1.5 border border-transparent hover:border-red-500/30 rounded bg-transparent hover:bg-red-500/10">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Points History */}
        {activeTab === 'points' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 bg-[rgba(20,33,61,0.5)] p-8 rounded-2xl border border-[rgba(255,183,3,0.2)] shadow-[inset_0_0_30px_rgba(255,183,3,0.05)] gap-4">
              <div>
                <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-2 opacity-80">Current Balance</h3>
                <p className="text-5xl font-black text-white flex items-center gap-3">
                  <span className="text-brand-red drop-shadow-[0_0_10px_rgba(214,40,40,0.5)]">⬡</span> {formData.pointsBalance}
                </p>
              </div>
              <button className="bg-[rgba(255,255,255,0.05)] text-white px-5 py-2.5 rounded shadow-[0_5px_15px_rgba(0,0,0,0.3)] font-bold tracking-widest uppercase text-xs hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] hover:border-white transition-all">
                + Manual Adjustment
              </button>
            </div>

            <div className="glass-card border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden bg-[rgba(0,0,0,0.3)]">
              <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[rgba(255,255,255,0.02)] text-gray-400 border-b border-[rgba(255,255,255,0.05)] uppercase tracking-widest text-xs font-bold">
                    <th className="p-5">Date</th>
                    <th className="p-5">Description</th>
                    <th className="p-5">Points</th>
                    <th className="p-5">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {formData.pointsHistory.map((pt, idx) => (
                    <tr key={idx} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="p-5 text-gray-400 font-medium tracking-wide">{new Date(pt.date).toLocaleDateString()}</td>
                      <td className="p-5 text-gray-200 font-bold tracking-wide">{pt.description}</td>
                      <td className={`p-5 font-black text-lg ${pt.points > 0 ? 'text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.3)]' : 'text-brand-red'}`}>{pt.points > 0 ? '+' : ''}{pt.points}</td>
                      <td className="p-5 text-gray-500 font-mono tracking-wider">{pt.balance}</td>
                    </tr>
                  ))}
                  {formData.pointsHistory.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-gray-500 italic border-t border-[rgba(255,255,255,0.05)]">No points history available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Basic Modal for new Achievement */}
        {showAchievementModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="glass-card rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[rgba(255,255,255,0.1)] p-8 w-full max-w-xl animate-fade-in relative overflow-hidden bg-[#0a0f1c]">
              {/* Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red rounded-full mix-blend-multiply filter blur-[96px] opacity-10 pointer-events-none"></div>

              <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                <span className="text-gold">★</span> Record Achievement
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Type *</label>
                  <select
                    value={newAchievement.type}
                    onChange={e => setNewAchievement({ ...newAchievement, type: e.target.value, title: `Recorded ${e.target.value}`, pointsAwarded: DEFAULT_POINTS[e.target.value] || 0 })}
                    className="input-field"
                  >
                    <option value="belt-grading">Belt Grading Passed</option>
                    <option value="tournament-gold">Tournament Gold</option>
                    <option value="tournament-silver">Tournament Silver</option>
                    <option value="tournament-bronze">Tournament Bronze</option>
                    <option value="tournament-participation">Tournament Participation</option>
                    <option value="special-award">Special Award</option>
                    <option value="attendance-milestone">Attendance Milestone</option>
                    <option value="birthday-bonus">Birthday Bonus</option>
                    <option value="enrollment">Enrollment</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title *</label>
                    <input type="text" value={newAchievement.title} onChange={e => setNewAchievement({ ...newAchievement, title: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Date *</label>
                    <input type="date" value={newAchievement.date} onChange={e => setNewAchievement({ ...newAchievement, date: e.target.value })} className="input-field" />
                  </div>
                </div>

                {newAchievement.type === 'belt-grading' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Belt Earned *</label>
                    <select value={newAchievement.beltEarned} onChange={e => setNewAchievement({ ...newAchievement, beltEarned: e.target.value })} className="input-field">
                      {BELTS.map(b => <option key={b.colour} value={b.colour}>{b.label}</option>)}
                    </select>
                  </div>
                )}

                {newAchievement.type.startsWith('tournament') && (
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tournament Level</label>
                      <select value={newAchievement.tournamentLevel} onChange={e => setNewAchievement({ ...newAchievement, tournamentLevel: e.target.value })} className="input-field">
                        <option value="inter-dojo">Inter-Dojo</option>
                        <option value="district">District</option>
                        <option value="state">State</option>
                        <option value="national">National</option>
                        <option value="international">International</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Points Overwrite</label>
                      <input type="number" value={newAchievement.pointsAwarded} onChange={e => setNewAchievement({ ...newAchievement, pointsAwarded: e.target.value })} className="input-field" />
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-10 flex justify-end gap-4 border-t border-[rgba(255,255,255,0.1)] pt-6">
                <button type="button" onClick={() => setShowAchievementModal(false)} className="px-8 py-3 border border-[rgba(255,255,255,0.1)] hover:border-white rounded font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest text-xs">Cancel</button>
                <button type="button" onClick={handleSaveAchievement} className="px-8 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] hover:border-white text-white rounded font-bold transition-all uppercase tracking-widest text-xs shadow-lg">Save Achievement</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
