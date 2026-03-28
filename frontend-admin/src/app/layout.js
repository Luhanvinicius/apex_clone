"use client"
import './globals.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Home, Trophy, BarChart2, Wrench, Settings, Mail, 
  Infinity as LoopIcon, CornerUpRight, Wallet, User, Headphones, Search, Bell,
  ArrowUp, ArrowDown, ChevronDown
} from 'lucide-react';

const NavItem = ({ href, icon: Icon, label, active, badge }) => (
  <Link 
    href={href} 
    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
      active 
      ? 'bg-selectedSidebar text-white font-semibold' 
      : 'text-slate-400 hover:bg-selectedSidebar/50 hover:text-slate-200'
    }`}
  >
    <Icon size={20} className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`} />
    <span className="text-sm tracking-tight">{label}</span>
    {badge && (
      <span className="ml-auto bg-blue-600 text-[10px] px-1.5 py-0.5 rounded font-black uppercase text-white tracking-widest leading-none">
        {badge}
      </span>
    )}
  </Link>
);

export default function RootLayout({ children }) {
  const [isAuthPath, setIsAuthPath] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bots, setBots] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [showBotList, setShowBotList] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    const authPath = path === '/login' || path === '/setup';
    const token = localStorage.getItem('apex_token');
    
    setIsAuthPath(authPath);

    if (token) {
      if (authPath) {
        window.location.href = '/';
      } else {
        fetchBots();
      }
    } else if (!authPath) {
      window.location.href = '/login';
    }
    
    const handleBotChange = () => fetchBots();
    window.addEventListener('botChanged', handleBotChange);
    
    setLoading(false);
    return () => window.removeEventListener('botChanged', handleBotChange);
  }, []);

  const fetchBots = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/config');
      const botList = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
      setBots(botList);
      
      const savedBotId = localStorage.getItem('selected_bot_id');
      if (savedBotId) {
        const found = botList.find(b => b.id === savedBotId);
        if (found) setSelectedBot(found);
        // If not found in list, we don't overwrite local storage yet 
        // to avoid reverting to the first bot during high-speed creation
      } else if (botList.length > 0) {
        selectBot(botList[0]);
      }
    } catch (e) { console.error(e); setBots([]); }
  };

  const selectBot = (bot) => {
    setSelectedBot(bot);
    localStorage.setItem('selected_bot_id', bot.id);
    setShowBotList(false);
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('botChanged', { detail: bot.id }));
  };

  if (loading) return (
    <html lang="pt-br">
      <body className="bg-black text-white flex items-center justify-center min-h-screen">
        <div className="text-xs font-black uppercase tracking-[0.4em] animate-pulse text-slate-800">
          Sincronizando Apex Cloud...
        </div>
      </body>
    </html>
  );

  return (
    <html lang="pt-br">
      <head>
        <title>Apex VIPs - Intelligent Bot Management</title>
      </head>
      <body className={`flex h-screen overflow-hidden bg-black text-white`}>
        {isAuthPath ? (
           <main className="flex-1 w-full bg-black">
             {children}
           </main>
        ) : (
          <div className="flex w-full h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black">
            {/* Sidebar Apex Style */}
            <aside className="w-[280px] bg-black border-r border-darkBorder flex flex-col z-20">
              <div className="p-8 pt-10">
                <div className="flex items-center gap-3 mb-6 pl-2">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center -rotate-6 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                      <span className="text-black font-black text-2xl tracking-tighter italic">A</span>
                   </div>
                </div>

                {/* Bot Selector Dropdown */}
                <div className="mb-8 px-2 relative">
                   <div 
                     onClick={() => setShowBotList(!showBotList)}
                     className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between text-slate-500 cursor-pointer hover:border-white/10 transition-all"
                   >
                      <span className="text-[10px] font-black uppercase tracking-widest truncate">
                        {selectedBot ? selectedBot.botUsername : 'Selecionar Bot...'}
                      </span>
                      <ChevronDown size={14} className={`transition-transform ${showBotList ? 'rotate-180' : ''}`} />
                   </div>

                   {showBotList && (
                     <div className="absolute top-full left-2 right-2 mt-2 bg-[#111] border border-white/5 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {bots.length === 0 ? (
                          <div className="p-4 text-[10px] font-bold text-slate-600 text-center uppercase tracking-widest">Nenhum bot criado</div>
                        ) : bots.map(bot => (
                          <div 
                            key={bot.id}
                            onClick={() => selectBot(bot)}
                            className={`p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-all flex items-center justify-between group ${selectedBot?.id === bot.id ? 'bg-white/5' : ''}`}
                          >
                             <span className={`text-[10px] font-black uppercase tracking-widest ${selectedBot?.id === bot.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                {bot.botUsername}
                             </span>
                             {selectedBot?.id === bot.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                          </div>
                        ))}
                        <Link href="/bot/create" onClick={()=>setShowBotList(false)} className="mt-2 p-4 rounded-xl border border-dashed border-white/5 flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest text-slate-700 hover:text-slate-400">
                           <Wrench size={12} /> Criar Novo Bot
                        </Link>
                     </div>
                   )}
                </div>

                <nav className="space-y-1">
                  <NavItem href="/" icon={Home} label="Dashboard" active={window.location.pathname === '/'} />
                  <NavItem href="/ranking" icon={Trophy} label="Ranking" active={window.location.pathname === '/ranking'} />
                  <NavItem href="/stats" icon={BarChart2} label="Estatísticas" active={window.location.pathname === '/stats'} />
                  <NavItem href="/bot/create" icon={Wrench} label="Criar Bot" active={window.location.pathname === '/bot/create'} />
                  <NavItem href="/settings" icon={Settings} label="Configurar Bot" active={window.location.pathname === '/settings'} />
                  <NavItem href="/mailing" icon={Mail} label="Mailing" active={window.location.pathname === '/mailing'} />
                  <NavItem href="/tracking" icon={LoopIcon} label="Trackeamento" badge="NOVO" active={window.location.pathname === '/tracking'} />
                  <NavItem href="/redirects" icon={CornerUpRight} label="Redirecionadores" active={window.location.pathname === '/redirects'} />
                  <NavItem href="/payments" icon={Wallet} label="Pagamentos" active={window.location.pathname === '/payments'} />
                  <NavItem href="/account" icon={User} label="Minha Conta" active={window.location.pathname === '/account'} />
                  <NavItem href="/support" icon={Headphones} label="Suporte" active={window.location.pathname === '/support'} />
                </nav>
              </div>
              
              <div className="mt-auto p-4 space-y-4">
                 <div className="px-4 py-2 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white">
                       <span>{selectedBot ? '0 | R$ 0,00' : '- | R$ -'}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="w-0 h-full bg-slate-500"></div>
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 text-center">Bot Selecionado: {selectedBot?.botUsername || 'Nenhum'}</p>
                 </div>

                 <div className="flex flex-col items-center gap-2 pt-4 group cursor-pointer">
                    <div className="w-14 h-14 rounded-[22px] border-2 border-white/10 flex items-center justify-center p-3 opacity-60 group-hover:opacity-100 transition-all group-hover:border-white/20">
                       <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                    </div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-400 transition-colors">@apexvips_</span>
                 </div>

                 <div className="bg-darkCard p-4 rounded-2xl flex items-center gap-3 cursor-pointer mt-4" onClick={() => {localStorage.removeItem('apex_token'); window.location.href='/login'}}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center font-bold text-lg">
                       L
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <p className="text-sm font-bold truncate">Log Out</p>
                       <p className="text-xs text-slate-500 truncate">Clique para sair</p>
                    </div>
                 </div>
              </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
              <header className="h-20 flex items-center justify-end px-12 gap-6 relative z-10">
                 <div className="flex items-center gap-2 bg-darkCard/50 border border-darkBorder px-4 py-2 rounded-xl text-slate-400 group focus-within:border-blue-500/50 transition-all">
                    <Search size={18} className="group-focus-within:text-blue-500 transition-colors" />
                    <input className="bg-transparent outline-none text-sm placeholder:text-slate-600 font-medium" placeholder="Pesquisar registro..." />
                 </div>
                 <button className="relative w-11 h-11 bg-darkCard/50 border border-darkBorder rounded-xl flex items-center justify-center text-slate-400 hover:bg-darkCard transition-all">
                    <Bell size={20} />
                    <div className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full border-2 border-black"></div>
                 </button>
                 <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-darkBorder flex items-center justify-center text-slate-500 overflow-hidden cursor-pointer">
                    <img src="https://ui-avatars.com/api/?name=Luhan&background=111&color=fff" alt="User" />
                 </div>
              </header>

              <main className="flex-1 overflow-y-auto px-12 pb-12 pt-4 relative z-0">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
