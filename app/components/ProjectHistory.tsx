'use client';

interface Project {
  name: string;
  amount: number;
  date: string;
  path: string;
}

interface ProjectHistoryProps {
  transactions: {
    amount: number;
    createdAt: string;
    userLogin: string;
    type: string;
    path: string;
  }[];
}

export default function ProjectHistory({ transactions }: ProjectHistoryProps) {
  // Process and sort transactions
  const projects: Project[] = transactions
    .filter(t => t.type === 'xp' && !t.path.includes('checkpoint'))
    .map(t => ({
      name: t.path.split('/').pop() || '',
      amount: t.amount / 1000,
      date: new Date(t.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      path: t.path
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Project History
      </h2>
      <div className="h-[400px] overflow-y-auto pr-2 space-y-4">
        {projects.map((project, index) => (
          <div
            key={index}
            className="group p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm
                     hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-white/90 capitalize group-hover:text-white transition-colors">
                  {project.name.replace(/-/g, ' ')}
                </h3>
                <p className="text-sm text-white/60">{project.date}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">
                  {project.amount.toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 