'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchGraphQL } from '@/app/lib/auth';
import { processAuditData, processXPData, processLevelData } from '@/app/lib/dataProcessing';
import AuditRatioChart from '@/app/components/AuditRatioChart';
import XPProgressGraph from '@/app/components/XPProgressGraph';
import ProjectHistory from '@/app/components/ProjectHistory';
// import AuditHistory from '@/app/components/AuditHistory';
import AnimatedBackground from '@/app/components/AnimatedBackground';

interface UserData {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  attrs: any;
}

interface AuditData {
  done: number;
  received: number;
  doneXP: number;
  receivedXP: number;
  ratio: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [xpData, setXPData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [totalUserXP, setTotalUserXP] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.replace('/login');
          return;
        }

        const query = `query User {
          user {
            auditRatio
            email
            firstName
            lastName
            login
            totalDown
            totalUp
            attrs
          }
          audit(where: { auditorLogin: { _eq: "zalhaj" } }) {
            attrs
            auditedAt
            auditorId
            auditorLogin
            closedAt
            closureMessage
            closureType
            createdAt
            endAt
            grade
            groupId
            id
            resultId
            updatedAt
            version
          }
          transaction(where: {
            type: { _eq: "xp" },
            eventId: { _in: [72, 20, 250] }
          }) {
            amount
            createdAt
            userLogin
            type
            path
            eventId
          }
          event_user(where: { eventId: { _in: [72, 20, 250] } }) {
            createdAt
            eventId
            id
            level
            userAuditRatio
            userId
            userLogin
            userName
            cohorts {
              id
              labelId
              labelName
              userId
            }
          }
          xp_view(where: { originEventId: { _in: [72, 20, 250] } }) {
            amount
            originEventId
            path
            userId
          }
        }`;

        const response = await fetchGraphQL(query, token);

        if (!response?.data?.user?.[0]) {
          throw new Error('No user data received');
        }

        const processedAuditData = processAuditData(response.data);
        setAuditData(processedAuditData);

        // Filter XP data for the specific events
        const filteredXPData = response.data.xp_view.filter((xp: any) =>
          [72, 20, 250].includes(xp.originEventId)
        );

        const processedXPData = processXPData({
          ...response.data,
          xp_view: filteredXPData
        });

        setXPData(processedXPData);
        setTransactions(response.data.transaction || []);

        // Calculate XP totals for each event user
        const eventUsersWithXP = response.data.event_user.map((user: any) => {
          const userXP = response.data.transaction
            .filter((t: any) => t.userLogin === user.userLogin && t.type === 'xp')
            .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          return { ...user, calculatedXP: userXP };
        });

        setAudits(response.data.audit || []);

        const levelData = processLevelData(response.data);
        setXPData(levelData);

        const totalXP = processedXPData[0]?.xp || 0;
        setTotalUserXP(totalXP);

        // Get user's level from event_user
        const userLevel = response.data.event_user
          .find((eu: any) => eu.userLogin === response.data.user[0]?.login)?.level || 0;

        // Set user data with level from event_user
        setUser({
          ...response.data.user[0],
          attrs: {
            ...response.data.user[0]?.attrs,
            level: userLevel
          }
        });

        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data');
        localStorage.removeItem('token');
        router.replace('/login');
      }
    };

    fetchData();
  }, [router]);

  const formatMB = (bytes: number) => {
    const mb = bytes / 1000000;
    return `${mb.toFixed(2)} MB`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

  const formatDateOfBirth = (dateString: string) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Message */}
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="p-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Welcome back, {user?.firstName}!
                  </h1>
                  <p className="text-white/80">
                    Track your progress and achievements here
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl
                           hover:bg-blue-700 transform hover:-translate-y-0.5 
                           transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-white/80">{user?.email}</p>
                  <p className="text-white/80">
                    Born: {formatDateOfBirth(user?.attrs?.dateOfBirth)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-white/5 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-bold border border-white/10">
                    @{user?.login}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <h3 className="font-semibold text-white/80 text-lg mb-2">Total XP</h3>
                  <div className="flex items-center">
                    <p className="text-3xl font-bold text-white">
                      {totalUserXP}
                    </p>
                    <span className="ml-2 text-white/80 text-sm">XP</span>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <h3 className="font-semibold text-white/80 text-lg mb-2">Current Level</h3>
                  <p className="text-3xl font-bold text-white">{user?.attrs?.level || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Audit Statistics */}
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="p-6">
                {auditData && (auditData.done > 0 || auditData.received > 0) ? (
                  <AuditRatioChart data={auditData} />
                ) : (
                  <div className="text-white">
                    <h2 className="text-xl font-bold mb-4">Audit Ratio</h2>
                    <p>No audit data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Project History */}
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="p-6">
                <ProjectHistory transactions={transactions} />
              </div>
            </div>

            {/* Full Width Level Distribution */}
            <div className="md:col-span-2">
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 min-h-[600px]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="p-6">
                  {xpData && xpData.length > 0 ? (
                    <div className="w-full h-full">
                      <XPProgressGraph
                        data={xpData}
                        userLevel={user?.attrs?.level || 0}
                      />
                    </div>
                  ) : (
                    <div className="text-white">
                      <h2 className="text-xl font-bold mb-4">Level Distribution</h2>
                      <p>No level data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom decorative dots */}
          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-blue-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-purple-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-pink-500/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
