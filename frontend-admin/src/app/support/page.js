"use client"
import { Headphones, Send } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="-mx-4 -mb-12 min-h-screen bg-[#242426] px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 pt-7 sm:pt-8 lg:pt-9 pb-10 flex items-start justify-center animate-in fade-in zoom-in-95 duration-700">
      <div className="relative w-full max-w-[780px] rounded-[18px] border border-white/[0.04] bg-gradient-to-b from-[#272727] to-[#242424] shadow-[0_8px_24px_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="px-7 py-8 sm:px-10 sm:py-10 md:px-12 md:py-10 space-y-8 sm:space-y-10 relative z-10">
          <div className="space-y-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <Headphones size={22} className="text-white/80" />
              <h1 className="text-[clamp(2rem,2.6vw,3rem)] font-black text-white tracking-tight leading-none whitespace-nowrap">
                Entre em Contato Conosco
              </h1>
            </div>

            <p className="text-[#c7c7c7] text-base sm:text-[17px] font-bold tracking-tight leading-snug max-w-[640px]">
              Suporte e Atendimento Exclusivamente pelo Telegram:
            </p>
          </div>

          <div className="flex justify-center">
            <a
              href="https://t.me/ApexVips_Suporte"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#4a4a4a] hover:bg-[#575757] border border-white/[0.08] shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-all hover:scale-[1.04] active:scale-[0.99]"
            >
              <Send
                size={18}
                className="text-white/90 transition-transform"
              />
              <span className="text-sm sm:text-base font-black text-white tracking-tight">
                Suporte no Telegram
              </span>
            </a>
          </div>

          <div className="space-y-4 sm:space-y-5 pt-1">
            <h2 className="text-xl sm:text-[2rem] font-black text-[#d3d3d3] tracking-tight">
              Fique por dentro das novidades:
            </h2>
            <p className="text-white/85 text-sm sm:text-[15px] font-semibold leading-relaxed max-w-[640px]">
              Siga nosso canal no Telegram e nosso Instagram para novidades, promoções e atualizações.
            </p>

            <div className="flex items-center justify-center gap-5 pt-2">
              <a
                href="https://t.me/apexvips_"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#4a4a4a] hover:bg-[#575757] border border-white/[0.08] flex items-center justify-center text-white/85 hover:text-white transition-all shadow-[0_10px_26px_rgba(0,0,0,0.3)]"
                aria-label="Telegram"
              >
                <Send size={18} />
              </a>
              <a
                href="https://instagram.com/apexvips_"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#4a4a4a] hover:bg-[#575757] border border-white/[0.08] flex items-center justify-center text-white/85 hover:text-white transition-all shadow-[0_10px_26px_rgba(0,0,0,0.3)]"
                aria-label="Instagram"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
