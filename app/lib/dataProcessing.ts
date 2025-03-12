export interface AuditData {
  received: number;
  done: number;
  receivedXP: number;
  doneXP: number;
  ratio: number;
}

export interface XPDataPoint {
  xp: number;
  userCount: number;
}

export interface LevelDataPoint {
  level: number;
  userCount: number;
}

function bytesToMB(bytes: number): string {
  const mb = bytes / 1000000;
  return mb.toFixed(2);
}

export function processAuditData(userData: any): AuditData {
  if (!userData?.user?.[0]) {
    return { done: 0, received: 0, doneXP: 0, receivedXP: 0, ratio: 1 };
  }

  const user = userData.user[0];
  const ratio = user.auditRatio || 1;
  const totalUp = user.totalUp || 0;
  const totalDown = user.totalDown || 0;

  const transactions = userData.transaction || [];
  const auditXP = transactions.filter((t: any) => t.type === 'audit');
  
  const doneXP = auditXP.reduce((sum: number, t: any) => 
    t.path?.includes('up') ? sum + (t.amount || 0) : sum, 0
  );

  const receivedXP = auditXP.reduce((sum: number, t: any) => 
    t.path?.includes('down') ? sum + (t.amount || 0) : sum, 0
  );

  return {
    done: totalUp,
    received: totalDown,
    doneXP,
    receivedXP,
    ratio
  };
}

export function processXPData(userData: any): XPDataPoint[] {
  if (!userData?.event_user || !userData?.transaction) {
    return [];
  }

  const userXPs = new Map<string, number>();
  
  userData.event_user
    .filter((user: any) => user.eventId === 72)
    .forEach((user: any) => {
      userXPs.set(user.userLogin, 0);
    });

  userData.transaction
    .filter((t: any) => t.type === 'xp')
    .forEach((t: any) => {
      if (userXPs.has(t.userLogin)) {
        const currentXP = userXPs.get(t.userLogin) || 0;
        userXPs.set(t.userLogin, currentXP + (t.amount || 0));
      }
    });

  const bucketSize = 5000;
  const distribution = new Map<number, number>();

  Array.from(userXPs.values())
    .filter(xp => xp > 0)
    .forEach(xp => {
      const bucket = Math.floor(xp / bucketSize) * bucketSize;
      distribution.set(bucket, (distribution.get(bucket) || 0) + 1);
    });

  return Array.from(distribution.entries())
    .sort(([xpA], [xpB]) => xpA - xpB)
    .map(([xp, count]) => ({
      xp,
      userCount: count
    }));
}

export function processLevelData(userData: any): LevelDataPoint[] {
  if (!userData?.event_user) {
    return [];
  }

  const levelDistribution = new Map<number, number>();

  userData.event_user.forEach((user: any) => {
    const level = user.level || 0;
    levelDistribution.set(level, (levelDistribution.get(level) || 0) + 1);
  });

  return Array.from(levelDistribution.entries())
    .sort(([levelA], [levelB]) => levelA - levelB)
    .map(([level, count]) => ({
      level,
      userCount: count
    }));
} 