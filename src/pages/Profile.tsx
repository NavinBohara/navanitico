import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { uploadUserFile, getPublicUrl } from '../lib/storage';
import { fetchProfile, upsertProfile } from '../lib/profiles';
import { 
  UserIcon, 
  EnvelopeIcon, 
  AcademicCapIcon,
  TrophyIcon,
  BookmarkIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  StarIcon,
  PencilIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, login, logout, signInWithProvider, signUpWithPassword, signInWithPassword } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', name: '' });
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    level: user?.level || 'beginner'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.email) {
      try {
        await login(loginForm.email, loginForm.name || undefined);
        setLoginStatus('Magic link sent! Check your email to finish signing in.');
      } catch (err: any) {
        setLoginStatus(err?.message || 'Failed to send sign-in link.');
      }
    }
  };

  const handleEditSave = () => {
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const { path } = await uploadUserFile(user.id, file);
      const url = getPublicUrl(path);
      setAvatarUrl(url);
      await upsertProfile(user.id, { avatar_url: url });
    } catch (err) {
      // no-op
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const profile = await fetchProfile(user.id);
        if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
      } catch {}
    })();
  }, [user?.id]);

  const achievements = [
    { id: 1, title: 'First Steps', description: 'Completed your first learning module', icon: AcademicCapIcon, earned: true },
    { id: 2, title: 'Budget Master', description: 'Created your first budget plan', icon: ChartBarIcon, earned: user?.budgetHistory.length > 0 },
    { id: 3, title: 'Game Champion', description: 'Reached level 5 in the financial game', icon: TrophyIcon, earned: user?.gameProgress.level >= 5 },
    { id: 4, title: 'Knowledge Seeker', description: 'Saved 10 articles for later reading', icon: BookmarkIcon, earned: user?.savedArticles.length >= 10 },
    { id: 5, title: 'Consistent Learner', description: 'Completed 5 learning modules', icon: StarIcon, earned: user?.completedModules.length >= 5 },
    { id: 6, title: 'Financial Guru', description: 'Completed all advanced modules', icon: CurrencyDollarIcon, earned: false }
  ];

  const recentActivity = [
    { id: 1, action: 'Completed "What is Money?" module', date: '2024-01-15', type: 'learning' },
    { id: 2, action: 'Reached Level 3 in Financial Game', date: '2024-01-14', type: 'game' },
    { id: 3, action: 'Created monthly budget plan', date: '2024-01-13', type: 'budget' },
    { id: 4, action: 'Saved article: "Investment Tips"', date: '2024-01-12', type: 'bookmark' },
    { id: 5, action: 'Used EMI Calculator', date: '2024-01-11', type: 'calculator' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-coral-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Welcome to NavaNiti
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to track your progress and personalize your learning experience
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={loginForm.name}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                Send magic link
              </button>
              {loginStatus && (
                <div className="text-sm text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 p-3 rounded-md">
                  {loginStatus}
                </div>
              )}
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="px-3 text-xs text-gray-500 dark:text-gray-400">Or continue with</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => signInWithProvider('google')}
                className="py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Continue with Google
              </button>
              <button
                onClick={() => signInWithProvider('github')}
                className="py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Continue with GitHub
              </button>
            </div>

            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Email & password</h3>
              {authError && (
                <div className="mb-3 text-sm text-red-600">{authError}</div>
              )}
              <div className="grid gap-3">
                <input
                  type="text"
                  placeholder="Full name (for sign up)"
                  value={passwordForm.name}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={passwordForm.email}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={async () => {
                      setAuthError(null);
                      try {
                        await signUpWithPassword(passwordForm.email, passwordForm.password, passwordForm.name || undefined);
                        setLoginStatus('Sign up successful! Check your email to confirm.');
                      } catch (e: any) {
                        setAuthError(e?.message || 'Sign up failed');
                      }
                    }}
                    className="py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700"
                  >
                    Sign up
                  </button>
                  <button
                    onClick={async () => {
                      setAuthError(null);
                      try {
                        await signInWithPassword(passwordForm.email, passwordForm.password);
                        setLoginStatus('Signed in successfully!');
                      } catch (e: any) {
                        setAuthError(e?.message || 'Sign in failed');
                      }
                    }}
                    className="py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
              <h3 className="font-bold text-teal-800 dark:text-teal-200 mb-2">Why create a profile?</h3>
              <ul className="text-sm text-teal-700 dark:text-teal-300 space-y-1">
                <li>• Track your learning progress</li>
                <li>• Save articles and resources</li>
                <li>• Personalized recommendations</li>
                <li>• Earn achievements and badges</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-teal-500 to-coral-500 rounded-2xl p-8 text-white mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="avatar" className="w-24 h-24 object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
                <p className="text-lg text-white/90 mb-2">{user.email}</p>
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {user.level.charAt(0).toUpperCase() + user.level.slice(1)} Level
                  </span>
                  <div className="flex items-center space-x-1">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span>{user.gameProgress.coins} Coins</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500/80 backdrop-blur-sm rounded-lg hover:bg-red-500 transition-colors"
              >
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Level
                  </label>
                  <select
                    value={editForm.level}
                    onChange={(e) => setEditForm(prev => ({ ...prev, level: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avatar
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  {uploading && <div className="text-sm text-gray-500 mt-1">Uploading...</div>}
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleEditSave}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Learning Progress</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/30 rounded-xl">
                  <AcademicCapIcon className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-teal-600">{user.completedModules.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Modules Completed</div>
                </div>
                
                <div className="text-center p-4 bg-coral-50 dark:bg-coral-900/30 rounded-xl">
                  <TrophyIcon className="w-8 h-8 text-coral-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-coral-600">{user.gameProgress.level}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Game Level</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl">
                  <StarIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">{user.gameProgress.score}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {Math.round((user.completedModules.length / 10) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-coral-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(user.completedModules.length / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Recent Activity</h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'learning' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      activity.type === 'game' ? 'bg-green-100 dark:bg-green-900/30' :
                      activity.type === 'budget' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      activity.type === 'bookmark' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-gray-100 dark:bg-gray-600'
                    }`}>
                      {activity.type === 'learning' && <AcademicCapIcon className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'game' && <TrophyIcon className="w-5 h-5 text-green-600" />}
                      {activity.type === 'budget' && <ChartBarIcon className="w-5 h-5 text-purple-600" />}
                      {activity.type === 'bookmark' && <BookmarkIcon className="w-5 h-5 text-yellow-600" />}
                      {activity.type === 'calculator' && <CogIcon className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white">{activity.action}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Achievements</h2>
              
              <div className="space-y-4">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        achievement.earned
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.earned
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                        }`}>
                          {achievement.earned ? (
                            <CheckCircleIcon className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold ${
                            achievement.earned
                              ? 'text-green-800 dark:text-green-200'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {achievement.title}
                          </h3>
                          <p className={`text-sm ${
                            achievement.earned
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-gray-500 dark:text-gray-500'
                          }`}>
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-coral-50 dark:from-teal-900/30 dark:to-coral-900/30 rounded-lg">
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">Keep Learning!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete more modules and activities to unlock new achievements and badges.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;