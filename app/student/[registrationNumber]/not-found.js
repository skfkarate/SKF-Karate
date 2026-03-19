import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#080b14] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-crimson rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-navy-light rounded-full mix-blend-multiply filter blur-[128px] opacity-40 pointer-events-none"></div>

      <div className="glass-card relative z-10 w-full max-w-lg p-10 md:p-16 rounded-3xl text-center border border-[rgba(255,183,3,0.15)] shadow-[0_0_50px_rgba(214,40,40,0.1)]">
        <h1 className="text-[120px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-gold to-crimson tracking-tighter mb-4 opacity-80">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Student Not Found</h2>
        <p className="text-gray-400 mb-10 text-lg">
          We couldn't find a karate profile matching that registration number. Please check the number and try again.
        </p>

        <Link
          href="/student"
          className="inline-block relative overflow-hidden group bg-[rgba(255,183,3,0.1)] border border-[rgba(255,183,3,0.3)] text-gold px-8 py-4 font-bold tracking-[0.2em] uppercase rounded hover:text-white transition-all w-full md:w-auto"
        >
          <span className="relative z-10">Search Again</span>
          <div className="absolute inset-0 h-full w-full scale-0 rounded transition-all duration-300 group-hover:scale-100 group-hover:bg-[rgba(214,40,40,0.8)]/50 z-0"></div>
        </Link>
      </div>
    </div>
  );
}
