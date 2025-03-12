import Link from 'next/link';
import AnimatedBackground from '@/app/components/AnimatedBackground';

export default function Home() {
    return (
      <main className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        {/* Gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
        
        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-12 shadow-2xl border border-white/20 hover:border-white/40 transition-all duration-300">
            <h1 className="text-5xl font-bold text-white mb-6 animate-fade-in bg-gradient-to-r from-white to-white/80 bg-clip-text">
              Welcome to GraphQL Profile
            </h1>
            <p className="mt-4 text-white/90 text-lg">
              Please <Link href="/login" className="text-white font-bold hover:text-blue-200 underline decoration-2 decoration-blue-300 transition-all">login</Link> to continue
            </p>
          </div>
        </div>
      </main>
    );
}
  