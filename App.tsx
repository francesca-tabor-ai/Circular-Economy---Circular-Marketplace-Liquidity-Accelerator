
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { View, Supplier, Buyer, LiquidityInsight, ChatMessage, GeneratedAsset } from './types';
import StatCard from './components/StatCard';
import LiquidityChart from './components/LiquidityChart';
import { getLiquidityInsights, generateOutreachPlaybook, createFounderChat, generateMarketplaceImage, generateDemandStrategy, getApiKeyError } from './services/geminiService';

// Lazy image component for better performance
const LazyImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} loading="lazy" />
);

const FOUNDER_IMAGE_URL = "https://i.postimg.cc/HjfLFvxr/1-Aries-Circular-Marketplace-Liquidity-Accelerator-(CMLA).png";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('Landing');
  const [marketplaceVertical, setMarketplaceVertical] = useState('EV Battery Second-Life');
  const [insights, setInsights] = useState<LiquidityInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPlaybook, setAiPlaybook] = useState<string>('');
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false);
  
  // Demand State
  const [demandStrategy, setDemandStrategy] = useState<string>('');
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<"1:1" | "16:9" | "9:16">("16:9");

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Error State
  const [apiError, setApiError] = useState<string | null>(null);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Initialize Chat Session
  useEffect(() => {
    chatRef.current = createFounderChat();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isChatLoading) return;

    setChatMessages(prev => [...prev, { role: 'user', text: text }]);
    setIsChatLoading(true);
    setApiError(null);

    try {
      if (!chatRef.current) {
        setChatMessages(prev => [...prev, { role: 'model', text: getApiKeyError() }]);
        setIsChatLoading(false);
        return;
      }
        const response = await chatRef.current.sendMessage({ message: text });
        setChatMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error: any) {
      const errorMessage = error?.message?.includes('API key') ? getApiKeyError() : "Signal lost. Connection unstable. Stand by.";
      setChatMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setApiError(null);
    try {
    const url = await generateMarketplaceImage(imagePrompt, selectedAspectRatio);
    if (url) {
      const newAsset: GeneratedAsset = {
        id: Math.random().toString(36).substring(7),
        url: url,
        prompt: imagePrompt,
        timestamp: Date.now()
      };
      setGeneratedAssets(prev => [newAsset, ...prev]);
    }
    } catch (error: any) {
      if (error?.message?.includes('API key')) {
        setApiError(getApiKeyError());
      } else {
        setApiError("Failed to generate image. Please try again.");
      }
    } finally {
    setIsGeneratingImage(false);
    }
  };

  const getStarterProbes = (view: View) => {
    switch (view) {
      case 'Landing':
        return [
          "What's the main operational constraint right now?",
          "How do I improve my liquidity score?",
          "Explain your 'Systems Operator' philosophy."
        ];
      case 'Dashboard':
        return [
          "What's the main operational constraint right now?",
          "How do I improve my liquidity score?",
          "Explain your 'Systems Operator' philosophy."
        ];
      case 'Visuals':
        return [
          "How do I visualize a supply chain for used batteries?",
          "What kind of images appeal to enterprise recyclers?",
          "Mock up a high-end refurbishment facility visual."
        ];
      case 'AI-Lab':
        return [
          "Optimise my pricing model for circular materials.",
          "Write a 3-step outbound sequence for recyclers.",
          "How do I automate these tactics into a playbook?"
        ];
      case 'About':
        return [
          "Tell me about the failure that changed your mindset.",
          "Why focus on liquidity over sustainability branding?",
          "What is your long-term vision for CMLA?"
        ];
      case 'Demand':
        return [
          "How do I bridge the gap between enterprise and direct segments?",
          "Generate a qualification checklist for industrial buyers.",
          "How do we handle off-take guarantees?"
        ];
      default:
        return [
          "What is the next operational step?",
          "How do we seed demand fast?",
          "Diagnose our current liquidity gap."
        ];
    }
  };

  // Mock Data
  const suppliers: Supplier[] = [
    { id: '1', name: 'LithiumRecycle Corp', category: 'Battery', status: 'Active', supplyVolume: 450, lockInScore: 85 },
    { id: '2', name: 'EcoVolt Systems', category: 'Battery', status: 'Contracted', supplyVolume: 120, lockInScore: 60 },
    { id: '3', name: 'GreenCell Trading', category: 'Energy Storage', status: 'Onboarding', supplyVolume: 800, lockInScore: 20 },
  ];

  const buyers: Buyer[] = [
    { id: '1', name: 'Apex Grid Storage', qualificationScore: 92, segment: 'Enterprise', acquisitionStatus: 'First Trade' },
    { id: '2', name: 'Solara Energy Solutions', qualificationScore: 78, segment: 'SME', acquisitionStatus: 'Qualified' },
    { id: '3', name: 'Nexa Components Ltd', qualificationScore: 45, segment: 'Enterprise', acquisitionStatus: 'Contacted' },
    { id: '4', name: 'Direct Charge Co', qualificationScore: 20, segment: 'Direct', acquisitionStatus: 'Target' },
  ];

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setIsAnalyzing(true);
    setApiError(null);
    try {
    const result = await getLiquidityInsights(marketplaceVertical, {
      activeSuppliers: 15,
      activeBuyers: 12,
      weeklyTrans: 42
    });
    setInsights(result);
    } catch (error: any) {
      if (error?.message?.includes('API key')) {
        setApiError(getApiKeyError());
        setInsights([]);
      } else {
        setApiError("Failed to fetch insights. Please try again.");
        setInsights([]);
      }
    } finally {
    setIsAnalyzing(false);
    }
  };

  const handleGeneratePlaybook = async (role: 'Supplier' | 'Buyer') => {
    setIsGeneratingPlaybook(true);
    setApiError(null);
    try {
    const result = await generateOutreachPlaybook(role, marketplaceVertical, "Exclusive early access to secondary market volume with guaranteed buy-backs.");
    setAiPlaybook(result);
    } catch (error: any) {
      if (error?.message?.includes('API key')) {
        setApiError(getApiKeyError());
        setAiPlaybook('');
      } else {
        setApiError("Failed to generate playbook. Please try again.");
        setAiPlaybook('');
      }
    } finally {
    setIsGeneratingPlaybook(false);
    }
  };

  const handleSeedDemand = async (segment: 'Enterprise' | 'SME' | 'Direct') => {
    setIsGeneratingStrategy(true);
    setApiError(null);
    try {
    const result = await generateDemandStrategy(segment, marketplaceVertical);
    setDemandStrategy(result);
    } catch (error: any) {
      if (error?.message?.includes('API key')) {
        setApiError(getApiKeyError());
        setDemandStrategy('');
      } else {
        setApiError("Failed to generate strategy. Please try again.");
        setDemandStrategy('');
      }
    } finally {
    setIsGeneratingStrategy(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-semibold text-[#0a2540] tracking-tight">Marketplace Health</h1>
          <p className="text-[#6b7280] mt-2 text-lg font-medium leading-relaxed max-w-2xl">
            Liquidity acceleration engine for <span className="text-emerald-600 font-bold">{marketplaceVertical}</span>. 
            Currently at Phase 1: Rapid Supply Acquisition.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold tracking-tight">Liquidity Score: 74/100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stagger-item">
        <StatCard title="Transactions (Wk)" value="42" change="+12%" trend="up" icon="fa-bolt-lightning" />
        </div>
        <div className="stagger-item">
        <StatCard title="Supply Lock-in" value="68%" change="+5%" trend="up" icon="fa-shield-halved" />
        </div>
        <div className="stagger-item">
        <StatCard title="Demand Coverage" value="1.2x" change="-0.1x" trend="down" icon="fa-chart-line" />
        </div>
        <div className="stagger-item">
        <StatCard title="Time-to-Match" value="1.4d" change="Faster" trend="up" icon="fa-hourglass-start" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white border border-[#e5e7eb] p-8 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-extrabold text-[#0a2540]">Transaction Velocity</h3>
              <p className="text-[#9ca3af] text-sm font-medium mt-1">Growth rate of cleared trades per week</p>
            </div>
          </div>
          <LiquidityChart />
        </div>
        
        <div className="bg-[#0a2540] text-white p-8 rounded-xl flex flex-col shadow-xl ring-1 ring-slate-800 card-micro">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold">AI Strategist</h3>
              <p className="text-[#6b7280] text-xs font-medium uppercase tracking-widest mt-1">Liquidity Guard</p>
            </div>
            <button 
              onClick={fetchInsights}
              className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center hover:bg-[#374151] transition-colors border border-slate-700"
            >
              <i className={`fas fa-wand-sparkles text-emerald-400 ${isAnalyzing ? 'animate-pulse' : ''}`}></i>
            </button>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {apiError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-triangle text-rose-500 mt-0.5"></i>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-rose-900 mb-1">API Key Required</p>
                    <p className="text-xs text-rose-700 leading-relaxed">{apiError}</p>
                  </div>
                </div>
              </div>
            )}
            {insights.length > 0 ? insights.map((insight, idx) => (
              <div key={idx} className="group border-b border-slate-800 pb-6 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${insight.priority === 'High' ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                  <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest">
                    {insight.priority} Priority
                  </span>
                </div>
                <h4 className="font-bold text-base mb-2 group-hover:text-emerald-400 transition-colors">{insight.title}</h4>
                <p className="text-sm text-[#9ca3af] leading-relaxed mb-4">
                  {insight.description}
                </p>
                <button className="text-xs font-bold text-emerald-400 flex items-center gap-2 hover:translate-x-1 transition-transform">
                  EXECUTE PLAYBOOK <i className="fas fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <i className="fas fa-microchip text-4xl mb-4"></i>
                <p className="text-xs font-medium">Crunching market data...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVisuals = () => (
    <div className="space-y-10 animate-in slide-in-from-right-8 duration-700">
      <div className="border-b border-[#e5e7eb] pb-8">
        <h1 className="text-4xl font-semibold text-[#0a2540] tracking-tight">Visual Lab</h1>
        <p className="text-[#6b7280] mt-2 text-lg font-medium">Generate high-fidelity assets to seed demand and build brand authority.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#e5e7eb] p-8 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-[#0a2540] mb-6">Asset Brief</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-widest">Prompt</label>
                <textarea 
                  rows={4}
                  className="w-full bg-[#f6f9fc] border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="e.g., A clean, high-tech recycling facility with automated sorting arms, soft cinematic lighting..."
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-widest">Aspect Ratio</label>
                <div className="flex gap-2">
                  {(["1:1", "16:9", "9:16"] as const).map(ratio => (
                    <button 
                      key={ratio}
                      onClick={() => setSelectedAspectRatio(ratio)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedAspectRatio === ratio 
                          ? 'bg-[#0a2540] text-white border-slate-900' 
                          : 'bg-white text-[#6b7280] border-[#e5e7eb] hover:border-slate-300'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt}
                className="w-full py-4 bg-[#0a2540] text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-[#1f2937] disabled:opacity-50 transition-all uppercase tracking-widest"
              >
                {isGeneratingImage ? <><i className="fas fa-circle-notch animate-spin mr-2"></i> RENDERING...</> : 'Generate Visual'}
              </button>
              {apiError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-exclamation-triangle text-rose-500 mt-0.5"></i>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-rose-900 mb-1">API Key Required</p>
                      <p className="text-xs text-rose-700 leading-relaxed">{apiError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-emerald-900 text-emerald-50 p-6 rounded-xl">
            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
              <i className="fas fa-lightbulb"></i> Pro Tip
            </h4>
            <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
              Enterprise buyers value "operational clarity." Use visuals that show the scale of your processing capability to build instant trust.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {isGeneratingImage && (
              <div className={`bg-[#f3f4f6] rounded-xl animate-pulse flex items-center justify-center ${
                selectedAspectRatio === '1:1' ? 'aspect-square' : selectedAspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'
              }`}>
                <i className="fas fa-camera text-slate-300 text-4xl"></i>
              </div>
            )}
            
            {generatedAssets.map(asset => (
              <div key={asset.id} className="group relative bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <img src={asset.url} className="w-full h-auto object-cover" alt={asset.prompt} />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                   <p className="text-white text-xs font-medium line-clamp-2 mb-4">{asset.prompt}</p>
                   <div className="flex gap-2">
                     <a href={asset.url} download={`cmla-asset-${asset.id}.png`} className="flex-1 py-2 bg-white text-[#0a2540] rounded-xl text-[10px] font-bold text-center uppercase tracking-widest hover:bg-emerald-400 hover:text-white transition-colors">
                       Download
                     </a>
                     <button className="w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/40 transition-colors">
                        <i className="fas fa-expand"></i>
                     </button>
                   </div>
                </div>
              </div>
            ))}

            {generatedAssets.length === 0 && !isGeneratingImage && (
              <div className="col-span-2 py-32 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-[#e5e7eb] rounded-xl">
                <i className="fas fa-images text-5xl mb-6"></i>
                <p className="font-bold tracking-tight">No assets generated yet.</p>
                <p className="text-xs mt-1">Start by describing your circular operation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSupply = () => (
    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-between items-end border-b border-[#e5e7eb] pb-8">
        <div>
          <h1 className="text-4xl font-semibold text-[#0a2540] tracking-tight">Supply Engine</h1>
          <p className="text-[#6b7280] mt-2 text-lg font-medium">Capture early suppliers to build a defensive moat.</p>
        </div>
        <button className="stripe-button px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center gap-2">
          <i className="fas fa-plus"></i> NEW PARTNER
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-[#e5e7eb] p-8 rounded-xl shadow-sm">
          <p className="text-[#9ca3af] text-[11px] uppercase font-extrabold tracking-widest mb-4">Concentration Risk</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-[#f3f4f6] rounded-full overflow-hidden">
              <div className="h-full bg-rose-500" style={{ width: '75%' }}></div>
            </div>
            <span className="text-lg font-extrabold text-[#0a2540]">75%</span>
          </div>
          <p className="text-rose-500 text-[10px] font-bold mt-2"><i className="fas fa-exclamation-triangle mr-1"></i> High risk: Diversify sources</p>
        </div>
        <div className="bg-white border border-[#e5e7eb] p-8 rounded-xl shadow-sm">
          <p className="text-[#9ca3af] text-[11px] uppercase font-extrabold tracking-widest mb-2">Incentive ROI</p>
          <p className="text-4xl font-semibold text-[#0a2540] tracking-tighter">4.2<span className="text-xl text-[#9ca3af] ml-1">x</span></p>
          <p className="text-emerald-500 text-[10px] font-bold mt-1 tracking-tight">Efficient burn-to-liquidity ratio</p>
        </div>
        <div className="bg-white border border-[#e5e7eb] p-8 rounded-xl shadow-sm">
          <p className="text-[#9ca3af] text-[11px] uppercase font-extrabold tracking-widest mb-2">Avg Lock-In Score</p>
          <p className="text-4xl font-semibold text-[#0a2540] tracking-tighter">62<span className="text-slate-300">/100</span></p>
        </div>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f6f9fc]/50 border-b border-[#f3f4f6]">
            <tr>
              <th className="px-8 py-5 text-[10px] font-extrabold uppercase text-[#9ca3af] tracking-widest">Partner</th>
              <th className="px-8 py-5 text-[10px] font-extrabold uppercase text-[#9ca3af] tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-extrabold uppercase text-[#9ca3af] tracking-widest">Wkly Volume</th>
              <th className="px-8 py-5 text-[10px] font-extrabold uppercase text-[#9ca3af] tracking-widest">Lock-In Score</th>
              <th className="px-8 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {suppliers.map(s => (
              <tr key={s.id} className="hover:bg-[#f6f9fc]/30 transition-colors group">
                <td className="px-8 py-6">
                  <p className="font-bold text-[#0a2540]">{s.name}</p>
                  <p className="text-xs text-[#6b7280] font-medium">{s.category}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-tight ${
                    s.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    s.status === 'Contracted' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    'bg-[#f3f4f6] text-[#6b7280]'
                  }`}>
                    {s.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-8 py-6 font-mono text-sm font-bold text-slate-600">{s.supplyVolume}u</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-[#f3f4f6] rounded-full w-28 overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${s.lockInScore > 70 ? 'bg-emerald-500' : s.lockInScore > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${s.lockInScore}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-[#0a2540]">{s.lockInScore}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-[#9ca3af] hover:text-[#0a2540]"><i className="fas fa-arrow-right"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDemand = () => (
    <div className="space-y-10 animate-in slide-in-from-top-8 duration-700">
      <div className="flex justify-between items-end border-b border-[#e5e7eb] pb-8">
        <div>
          <h1 className="text-4xl font-semibold text-[#0a2540] tracking-tight">Demand Seeding</h1>
          <p className="text-[#6b7280] mt-2 text-lg font-medium">Build a deep pipeline of high-intent circular off-takers.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white border border-[#e5e7eb] text-[#0a2540] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#f6f9fc] transition-colors">
            SEGMENT ANALYSIS
          </button>
          <button className="bg-blue-600 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors">
            QUALIFY LEAD
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#e5e7eb] p-6 rounded-xl shadow-sm">
          <p className="text-[#9ca3af] text-[10px] uppercase font-black tracking-widest mb-1">Pipeline Depth</p>
          <p className="text-2xl font-black text-slate-950">142 Leads</p>
          <p className="text-emerald-500 text-[10px] font-bold mt-1 tracking-tight">+14 this week</p>
        </div>
        <div className="bg-white border border-[#e5e7eb] p-6 rounded-xl shadow-sm">
          <p className="text-[#9ca3af] text-[10px] uppercase font-black tracking-widest mb-1">Demand Coverage</p>
          <p className="text-2xl font-black text-slate-950">1.4x <span className="text-sm text-[#9ca3af] font-bold">Supply</span></p>
          <p className="text-blue-500 text-[10px] font-bold mt-1 tracking-tight">Healthy overflow</p>
        </div>
        <div className="bg-white border border-[#e5e7eb] p-6 rounded-xl shadow-sm">
          <p className="text-[#9ca3af] text-[10px] uppercase font-black tracking-widest mb-1">Avg Qualification</p>
          <p className="text-2xl font-black text-slate-950">68%</p>
          <p className="text-[#9ca3af] text-[10px] font-bold mt-1 tracking-tight">Ready for trade</p>
        </div>
        <div className="bg-white border border-[#e5e7eb] p-6 rounded-xl shadow-sm">
          <p className="text-[#9ca3af] text-[10px] uppercase font-black tracking-widest mb-1">Conversion Velocity</p>
          <p className="text-2xl font-black text-slate-950">12.4%</p>
          <p className="text-rose-500 text-[10px] font-bold mt-1 tracking-tight">-2.1% slowdown</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-[#e5e7eb] rounded-xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-[#f3f4f6] flex justify-between items-center">
            <h3 className="font-black text-[#0a2540] text-lg uppercase tracking-tight">Lead Pipeline</h3>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-[#f3f4f6] rounded-md text-[9px] font-black text-[#6b7280] uppercase tracking-widest">Filter: All</span>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f6f9fc]/50">
                <th className="px-8 py-4 text-[9px] font-black uppercase text-[#9ca3af] tracking-widest">Buyer</th>
                <th className="px-8 py-4 text-[9px] font-black uppercase text-[#9ca3af] tracking-widest">Segment</th>
                <th className="px-8 py-4 text-[9px] font-black uppercase text-[#9ca3af] tracking-widest">Status</th>
                <th className="px-8 py-4 text-[9px] font-black uppercase text-[#9ca3af] tracking-widest">Qual Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {buyers.map(b => (
                <tr key={b.id} className="hover:bg-[#f6f9fc]/30 transition-colors cursor-pointer">
                  <td className="px-8 py-5">
                    <p className="font-bold text-[#0a2540]">{b.name}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${
                      b.segment === 'Enterprise' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      b.segment === 'SME' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-[#f6f9fc] text-slate-600 border-[#f3f4f6]'
                    }`}>
                      {b.segment.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-[#6b7280]">{b.acquisitionStatus}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#f3f4f6] rounded-full w-20 overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${b.qualificationScore}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-[#0a2540]">{b.qualificationScore}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-indigo-900 text-white p-8 rounded-xl shadow-xl flex flex-col">
          <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Demand Seeder AI</h3>
          <p className="text-indigo-300 text-xs font-medium mb-8">Generate ruthless tactics for specific segments.</p>
          
          <div className="space-y-4 mb-8">
            <button 
              onClick={() => handleSeedDemand('Enterprise')}
              className="w-full text-left p-4 bg-indigo-800/50 hover:bg-indigo-800 border border-indigo-700/50 rounded-xl transition-all group"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Enterprise</span>
                <i className="fas fa-chevron-right text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
              <p className="text-sm font-bold">High-volume off-take strategy</p>
            </button>
            <button 
              onClick={() => handleSeedDemand('SME')}
              className="w-full text-left p-4 bg-indigo-800/50 hover:bg-indigo-800 border border-indigo-700/50 rounded-xl transition-all group"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">SME</span>
                <i className="fas fa-chevron-right text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
              <p className="text-sm font-bold">Flexible lot pricing model</p>
            </button>
          </div>

          <div className="flex-1 bg-indigo-950/50 rounded-xl p-6 font-mono text-xs leading-relaxed overflow-y-auto">
            {apiError ? (
              <div className="bg-rose-900/50 border border-rose-700/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-triangle text-rose-400 mt-0.5"></i>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-rose-300 mb-1">API Key Required</p>
                    <p className="text-xs text-rose-200 leading-relaxed">{apiError}</p>
                  </div>
                </div>
              </div>
            ) : isGeneratingStrategy ? (
              <div className="flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <p className="text-indigo-400 font-bold">CALCULATING STRATEGY...</p>
              </div>
            ) : demandStrategy ? (
              <div className="whitespace-pre-wrap animate-in fade-in duration-500">
                {demandStrategy}
              </div>
            ) : (
              <p className="text-indigo-700 font-bold uppercase tracking-widest text-center py-12">SYSTEM IDLE</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAILab = () => (
    <div className="space-y-10 animate-in zoom-in-95 duration-500">
       <div className="border-b border-[#e5e7eb] pb-8">
        <h1 className="text-4xl font-semibold text-[#0a2540] tracking-tight">Playbook Lab</h1>
        <p className="text-[#6b7280] mt-2 text-lg font-medium">Turn tactics into repeatable AI-driven growth workflows.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white border border-[#e5e7eb] p-8 rounded-xl shadow-sm space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#0a2540]">Sequence Generator</h3>
            <p className="text-sm text-[#6b7280] font-medium">Generate category-leadership focused outbound copy.</p>
          </div>
          
          <div className="space-y-6">
            <div className="p-1 bg-[#f3f4f6] rounded-xl flex">
              <button className="flex-1 py-2 rounded-lg bg-white shadow-sm text-[#0a2540] text-xs font-bold transition-all">SUPPLIERS</button>
              <button className="flex-1 py-2 rounded-lg text-[#6b7280] text-xs font-bold hover:text-[#0a2540] transition-all">BUYERS</button>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-widest">Vertical Category</label>
              <input 
                className="w-full bg-white border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm" 
                value={marketplaceVertical}
                onChange={(e) => setMarketplaceVertical(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-widest">Core Value Prop</label>
              <textarea 
                rows={4}
                className="w-full bg-white border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                placeholder="e.g., Immediate liquidity for surplus EV batteries..."
              />
            </div>

            <button 
              onClick={() => handleGeneratePlaybook('Supplier')}
              disabled={isGeneratingPlaybook}
              className="stripe-gradient w-full py-4 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/10 hover:opacity-90 disabled:opacity-50 transition-all uppercase tracking-widest"
            >
              {isGeneratingPlaybook ? <><i className="fas fa-circle-notch animate-spin mr-2"></i> GENERATING...</> : 'Launch Generation'}
            </button>
          </div>
        </div>

        <div className="bg-[#f6f9fc] border-2 border-dashed border-[#e5e7eb] p-8 rounded-xl relative min-h-[500px] overflow-hidden">
          <div className="absolute top-8 right-8">
            <button className="bg-white border border-[#e5e7eb] w-10 h-10 rounded-xl shadow-sm text-[#9ca3af] hover:text-[#0a2540] transition-colors flex items-center justify-center">
              <i className="fas fa-copy"></i>
            </button>
          </div>
          <h3 className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-widest mb-6">Generated Logic</h3>
          
          {apiError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <i className="fas fa-exclamation-triangle text-rose-500 mt-0.5"></i>
                <div className="flex-1">
                  <p className="text-sm font-bold text-rose-900 mb-1">API Key Required</p>
                  <p className="text-xs text-rose-700 leading-relaxed">{apiError}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-sm text-slate-700 leading-loose whitespace-pre-wrap font-medium">
            {aiPlaybook || (
              <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center mb-6">
                  <i className="fas fa-code text-2xl"></i>
                </div>
                <p className="text-sm font-bold tracking-tight">System ready for logic input.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLanding = () => (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Full-Page Image */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images3.alphacoders.com/596/596454.jpg)'
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[#0a2540]/70"></div>
        
        {/* Header with Dashboard Button - Overlay */}
        <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex justify-end">
            <button
              onClick={() => setCurrentView('Dashboard')}
              className="stripe-gradient px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <i className="fas fa-chart-line"></i>
              Dashboard
            </button>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 text-center space-y-6">
          <h1 className="text-5xl lg:text-7xl font-semibold text-white tracking-tight leading-tight">
            Reach Marketplace Liquidity<br />Before Your Competitors Do
          </h1>
          <p className="text-xl lg:text-2xl text-white/90 font-normal max-w-3xl mx-auto leading-relaxed">
            The liquidity acceleration platform built for venture-backed circular marketplaces racing to win category leadership.
          </p>
          <p className="text-lg text-white/80 font-normal">
            Get from zero → consistent weekly transactions in under 90 days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <button
              onClick={() => setCurrentView('Dashboard')}
              className="stripe-gradient px-8 py-4 rounded-xl text-white font-bold text-base shadow-xl shadow-emerald-500/20 hover:opacity-90 transition-all uppercase tracking-widest btn-micro"
            >
              Start Your Liquidity Sprint
            </button>
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-white/10 backdrop-blur-sm border-2 border-white/30 px-8 py-4 rounded-xl text-white font-bold text-base hover:bg-white/20 transition-all uppercase tracking-widest btn-micro"
            >
              Talk to the Founder AI
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof / Positioning Strip */}
      <section className="bg-[#f6f9fc] border-y border-[#e5e7eb] py-8">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <p className="text-center text-sm font-bold text-slate-600 uppercase tracking-widest mb-4">Built for founders operating where:</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <i className="fas fa-puzzle-piece text-2xl text-[#9ca3af]"></i>
              <p className="text-sm font-bold text-slate-700">Supply is fragmented</p>
            </div>
            <div className="space-y-2">
              <i className="fas fa-clock text-2xl text-[#9ca3af]"></i>
              <p className="text-sm font-bold text-slate-700">Timing decides winners</p>
            </div>
            <div className="space-y-2">
              <i className="fas fa-network-wired text-2xl text-[#9ca3af]"></i>
              <p className="text-sm font-bold text-slate-700">Network effects lock markets</p>
            </div>
            <div className="space-y-2">
              <i className="fas fa-bolt text-2xl text-[#9ca3af]"></i>
              <p className="text-sm font-bold text-slate-700">Speed beats theory</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 py-20">
        <div className="space-y-6">
          <h2 className="text-4xl font-semibold text-[#0a2540] tracking-tight">THE PROBLEM</h2>
          <h3 className="text-3xl font-bold text-slate-800">Circular Marketplaces Don't Fail Because of Vision</h3>
          <h4 className="text-2xl font-bold text-rose-600">They Fail Because They Never Reach Liquidity.</h4>
          <div className="bg-[#f6f9fc] border border-[#e5e7eb] rounded-xl p-8 space-y-4">
            <p className="text-lg font-bold text-slate-700">You can have:</p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-3">
                <i className="fas fa-check-circle text-emerald-500 mt-1"></i>
                <span className="font-medium">Strong supply pipeline</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-check-circle text-emerald-500 mt-1"></i>
                <span className="font-medium">Investor backing</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-check-circle text-emerald-500 mt-1"></i>
                <span className="font-medium">Strong sustainability story</span>
              </li>
            </ul>
            <p className="pt-4 text-lg font-bold text-[#0a2540] border-t border-[#e5e7eb]">
              But if transactions don't happen fast, the market moves on.
            </p>
            <p className="text-slate-600 font-medium">
              Most marketplaces lose 12–24 months solving the same early-stage liquidity problems. By then, competitors exist.
            </p>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="bg-[#0a2540] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 space-y-8">
          <h2 className="text-4xl font-semibold tracking-tight">THE SOLUTION</h2>
          <h3 className="text-3xl font-bold">The Circular Marketplace Liquidity Accelerator</h3>
          <p className="text-xl font-bold text-emerald-400">We exist for one outcome:</p>
          <p className="text-2xl font-extrabold">Consistent, repeat marketplace transactions — fast.</p>
          <div className="bg-[#1f2937]/50 border border-slate-700 rounded-xl p-8 space-y-4">
            <p className="text-lg font-bold">We help you:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <i className="fas fa-lock text-emerald-400 mt-1"></i>
                <span className="font-medium">Lock early supply partners</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-seedling text-emerald-400 mt-1"></i>
                <span className="font-medium">Seed real demand (not vanity signups)</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-chart-line text-emerald-400 mt-1"></i>
                <span className="font-medium">Diagnose liquidity gaps in real time</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-book text-emerald-400 mt-1"></i>
                <span className="font-medium">Execute proven marketplace launch playbooks</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-20">
        <h2 className="text-4xl font-semibold text-[#0a2540] tracking-tight text-center mb-12">HOW IT WORKS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-[#0a2540] rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">1</div>
            <h3 className="text-xl font-bold text-[#0a2540] mb-3">Lock Supply Early</h3>
            <p className="text-slate-600 font-medium">Secure suppliers before competitors can access them.</p>
          </div>
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-[#0a2540] rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">2</div>
            <h3 className="text-xl font-bold text-[#0a2540] mb-3">Seed Qualified Demand</h3>
            <p className="text-slate-600 font-medium">Bring in buyers that actually transact.</p>
          </div>
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-[#0a2540] rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">3</div>
            <h3 className="text-xl font-bold text-[#0a2540] mb-3">Monitor Liquidity Health Live</h3>
            <p className="text-slate-600 font-medium">See transaction risk before it becomes failure.</p>
          </div>
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-[#0a2540] rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">4</div>
            <h3 className="text-xl font-bold text-[#0a2540] mb-3">Execute Operator-Grade Playbooks</h3>
            <p className="text-slate-600 font-medium">Use real launch tactics from high-performance systems environments.</p>
          </div>
        </div>
      </section>

      {/* Founder AI Section */}
      <section className="bg-[#f6f9fc] border-y border-[#e5e7eb] py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 space-y-8">
          <h2 className="text-4xl font-semibold text-[#0a2540] tracking-tight">FOUNDER AI SECTION</h2>
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#0a2540] rounded-xl flex items-center justify-center overflow-hidden">
                <img src={FOUNDER_IMAGE_URL} className="w-full h-full object-cover" alt="Alex Voss" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0a2540]">Meet Alex Voss</h3>
                <p className="text-slate-600 font-medium">Founder. Systems Operator. Liquidity Strategist.</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-lg font-bold text-[#0a2540]">Inside the platform, you get direct access to the Founder AI.</p>
              <div className="space-y-2 text-slate-600">
                <p className="font-medium">Not support scripts.</p>
                <p className="font-medium">Not generic chatbot answers.</p>
              </div>
              <div className="bg-[#f6f9fc] border border-[#e5e7eb] rounded-xl p-6 mt-6">
                <p className="text-sm font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Operator-level guidance on:</p>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-3">
                    <i className="fas fa-arrow-right text-emerald-600 mt-1"></i>
                    <span className="font-medium">What to do next to unlock transactions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-arrow-right text-emerald-600 mt-1"></i>
                    <span className="font-medium">Where liquidity is actually breaking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-arrow-right text-emerald-600 mt-1"></i>
                    <span className="font-medium">How to make high-speed supply and demand decisions</span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#0a2540] text-white rounded-xl p-6 mt-6">
                <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-2">Founder Philosophy</p>
                <p className="text-lg font-bold italic">"Circular systems aren't green systems. They're systems that keep you operational when everyone else stops."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 py-20">
        <h2 className="text-4xl font-semibold text-[#0a2540] tracking-tight mb-8">WHO THIS IS FOR</h2>
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-[#0a2540] mb-6">Built For</h3>
          <p className="text-lg font-bold text-slate-700 mb-4">VC-backed circular marketplace founders who are:</p>
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start gap-3">
              <i className="fas fa-check-circle text-emerald-600 mt-1"></i>
              <span className="font-medium">Building supply-constrained markets</span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fas fa-check-circle text-emerald-600 mt-1"></i>
              <span className="font-medium">Creating new circular categories</span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fas fa-check-circle text-emerald-600 mt-1"></i>
              <span className="font-medium">Racing competitors to lock supply</span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fas fa-check-circle text-emerald-600 mt-1"></i>
              <span className="font-medium">Measured on transaction growth, not vanity metrics</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Core Outcomes */}
      <section className="bg-[#0a2540] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <h2 className="text-4xl font-semibold tracking-tight mb-8">CORE OUTCOMES</h2>
          <h3 className="text-2xl font-bold mb-8">What Success Looks Like</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1f2937]/50 border border-slate-700 rounded-xl p-6 flex items-start gap-4">
              <i className="fas fa-check-circle text-emerald-400 text-2xl"></i>
              <p className="font-bold text-lg">First transactions in weeks, not months</p>
            </div>
            <div className="bg-[#1f2937]/50 border border-slate-700 rounded-xl p-6 flex items-start gap-4">
              <i className="fas fa-check-circle text-emerald-400 text-2xl"></i>
              <p className="font-bold text-lg">Repeat transactions before next funding round</p>
            </div>
            <div className="bg-[#1f2937]/50 border border-slate-700 rounded-xl p-6 flex items-start gap-4">
              <i className="fas fa-check-circle text-emerald-400 text-2xl"></i>
              <p className="font-bold text-lg">Supply partners locked before competitors enter</p>
            </div>
            <div className="bg-[#1f2937]/50 border border-slate-700 rounded-xl p-6 flex items-start gap-4">
              <i className="fas fa-check-circle text-emerald-400 text-2xl"></i>
              <p className="font-bold text-lg">Real liquidity signals investors trust</p>
            </div>
          </div>
        </div>
      </section>

      {/* Different From Everything Else */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 py-20">
        <h2 className="text-4xl font-semibold text-[#0a2540] tracking-tight mb-8">DIFFERENT FROM EVERYTHING ELSE</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-8">
            <h3 className="text-xl font-bold text-[#0a2540] mb-4">We are not:</h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-3">
                <i className="fas fa-times-circle text-rose-600 mt-1"></i>
                <span className="font-medium">Generic startup tooling</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-times-circle text-rose-600 mt-1"></i>
                <span className="font-medium">Sustainability analytics dashboards</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-times-circle text-rose-600 mt-1"></i>
                <span className="font-medium">Marketplace SaaS templates</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-times-circle text-rose-600 mt-1"></i>
                <span className="font-medium">Venture studio programs</span>
              </li>
            </ul>
          </div>
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-8">
            <h3 className="text-xl font-bold text-[#0a2540] mb-4">We are:</h3>
            <div className="bg-emerald-100 border border-emerald-300 rounded-xl p-6">
              <p className="text-2xl font-extrabold text-emerald-900">Liquidity acceleration infrastructure</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Credibility */}
      <section className="bg-[#f6f9fc] border-y border-[#e5e7eb] py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <h2 className="text-4xl font-semibold text-[#0a2540] tracking-tight mb-8">TRUST / CREDIBILITY</h2>
          <p className="text-lg font-bold text-slate-700 mb-6">Designed using principles from:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-6">
              <i className="fas fa-truck-fast text-2xl text-[#9ca3af] mb-3"></i>
              <p className="font-bold text-[#0a2540]">Mission-critical logistics environments</p>
            </div>
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-6">
              <i className="fas fa-triangle-exclamation text-2xl text-[#9ca3af] mb-3"></i>
              <p className="font-bold text-[#0a2540]">Disaster response systems</p>
            </div>
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-6">
              <i className="fas fa-trophy text-2xl text-[#9ca3af] mb-3"></i>
              <p className="font-bold text-[#0a2540]">Elite performance operations</p>
            </div>
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-6">
              <i className="fas fa-rocket text-2xl text-[#9ca3af] mb-3"></i>
              <p className="font-bold text-[#0a2540]">High-speed marketplace launches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-[#0a2540] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight">If You're Building a Circular Marketplace</h2>
          <h3 className="text-3xl font-bold text-emerald-400">Speed Is Not Optional.</h3>
          <p className="text-xl font-bold">Be first to liquidity.<br />Or compete for it later.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <button
              onClick={() => setCurrentView('Dashboard')}
              className="stripe-gradient px-8 py-4 rounded-xl text-white font-bold text-base shadow-xl shadow-emerald-500/20 hover:opacity-90 transition-all uppercase tracking-widest"
            >
              Start Your Liquidity Sprint
            </button>
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-white text-[#0a2540] border-2 border-white px-8 py-4 rounded-xl font-bold text-base hover:bg-[#f3f4f6] transition-all uppercase tracking-widest"
            >
              Speak to Founder AI
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-[#9ca3af] py-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-lg font-bold">Circular markets will be won by the companies that stay operational longest.</p>
        </div>
      </footer>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-16 animate-in fade-in slide-in-from-right-8 duration-700 pb-20">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-semibold text-[#0a2540] tracking-tighter leading-[1.1]">
          We exist for one reason: to help circular economy marketplaces reach liquidity fast.
        </h1>
        <p className="mt-8 text-xl text-slate-600 leading-relaxed font-medium">
          In emerging circular markets, the first company to unlock consistent transactions usually wins. 
        </p>
      </div>
    </div>
  );

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(userInput);
    setUserInput('');
  };

  // Render landing page separately (full page, no sidebar)
  if (currentView === 'Landing') {
  return (
      <>
        <div className="stripe-gradient h-1 w-full fixed top-0 z-50"></div>
        {renderLanding()}
        {/* Founder AI Component - only show on landing if chat is open */}
        {isChatOpen && (
          <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
            <div className="w-96 bg-white border border-[#e5e7eb] rounded-xl shadow-2xl flex flex-col overflow-hidden mb-4 border-b-4 border-b-slate-900 animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-4 bg-[#0a2540] text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#e5e7eb] rounded-xl flex items-center justify-center overflow-hidden border border-slate-700 shadow-inner">
                    <img src={FOUNDER_IMAGE_URL} className="w-full h-full object-cover" alt="Alex Voss" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Alex Voss</h4>
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Systems Operator</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-[#9ca3af] hover:text-white transition-colors">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="flex-1 h-[450px] overflow-y-auto p-4 space-y-4 bg-[#f6f9fc]/50 custom-scrollbar">
                {chatMessages.length === 0 && (
                  <div className="space-y-4 py-2 animate-in fade-in duration-500">
                    {!chatRef.current ? (
                      <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-sm">
                        <div className="flex items-start gap-3">
                          <i className="fas fa-exclamation-triangle text-rose-500 mt-0.5"></i>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-rose-900 mb-1">API Key Required</p>
                            <p className="text-xs text-rose-700 leading-relaxed">{getApiKeyError()}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-white border border-[#e5e7eb] p-4 rounded-xl shadow-sm rounded-tl-none font-medium text-slate-800 text-sm leading-relaxed">
                          Systems are online. I'm Alex Voss. I don't care about theory—I care about liquidity. 
                          <br/><br/>
                          I learned circular thinking when supply chains failed in the field. Here, we move fast or we fail. What's the operational constraint?
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest pl-1">Operational Probes (Landing)</p>
                      {[
                        "What's the main operational constraint right now?",
                        "How do I improve my liquidity score?",
                        "Explain your 'Systems Operator' philosophy."
                      ].map((probe, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(probe)}
                          className="w-full text-left bg-white hover:bg-emerald-50 border border-[#e5e7eb] hover:border-emerald-200 p-3 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-700 transition-all shadow-sm"
                        >
                          <i className="fas fa-arrow-right mr-2 opacity-30 text-[10px]"></i>
                          {probe}
                        </button>
                      ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#0a2540] text-white rounded-tr-none' 
                        : 'bg-white border border-[#e5e7eb] text-slate-800 shadow-sm rounded-tl-none font-medium'
                    }`}>
                      {msg.text}
                      {msg.image && (
                        <div className="mt-4 rounded-xl overflow-hidden shadow-md">
                          <img src={msg.image} className="w-full h-auto" alt="Generated Visual" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-[#e5e7eb] px-4 py-3 rounded-xl rounded-tl-none shadow-sm flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSubmitMessage} className="p-4 bg-white border-t border-[#f3f4f6] flex gap-2">
                <input 
                  type="text"
                  placeholder="Ask Alex about constraints..."
                  className="flex-1 bg-[#f3f4f6] border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#0a2540] outline-none transition-all font-medium"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={isChatLoading}
                  className="w-10 h-10 bg-[#0a2540] text-white rounded-xl flex items-center justify-center hover:bg-[#1f2937] transition-colors disabled:opacity-50"
                >
                  <i className="fas fa-paper-plane text-xs"></i>
                </button>
              </form>
            </div>
          </div>
        )}
        {!isChatOpen && (
          <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="w-16 h-16 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 transition-all group relative border-4 border-white overflow-hidden ring-1 ring-[#e5e7eb]"
            >
              <img src={FOUNDER_IMAGE_URL} className="w-full h-full object-cover rounded-[1.8rem]" alt="Founder Avatar" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white z-10"></span>
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-[#0a2540]">
      <div className="stripe-gradient h-1 w-full absolute top-0 z-50"></div>
      
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-[#e5e7eb] flex flex-col z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 bg-[#0a2540] rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
              <i className="fas fa-infinity text-white text-lg"></i>
            </div>
            <div className="leading-none">
              <span className="text-2xl font-black tracking-tighter text-slate-950 block">CMLA</span>
              <span className="text-[9px] font-black text-[#9ca3af] uppercase tracking-widest">Accelerator v2.0</span>
            </div>
          </div>

          <nav className="space-y-2">
            <SidebarItem icon="fa-house" label="Overview" active={currentView === 'Dashboard'} onClick={() => setCurrentView('Dashboard')} />
            <SidebarItem icon="fa-cubes-stacked" label="Supply Engine" active={currentView === 'Supply'} onClick={() => setCurrentView('Supply')} />
            <SidebarItem icon="fa-users-between-lines" label="Demand Seeding" active={currentView === 'Demand'} onClick={() => setCurrentView('Demand')} />
            <SidebarItem icon="fa-flask-vial" label="Playbook Lab" active={currentView === 'AI-Lab'} onClick={() => setCurrentView('AI-Lab')} />
            <SidebarItem icon="fa-camera-retro" label="Visual Lab" active={currentView === 'Visuals'} onClick={() => setCurrentView('Visuals')} />
            <SidebarItem icon="fa-circle-info" label="About Us" active={currentView === 'About'} onClick={() => setCurrentView('About')} />
          </nav>
        </div>

        <div className="mt-auto p-8">
          <div className="bg-[#f6f9fc] rounded-xl p-5 border border-[#f3f4f6]">
            <p className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-widest mb-3">Liquidity Velocity</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <p className="text-xs font-bold text-[#0a2540] tracking-tight">90-Day Sprint: Day 34</p>
            </div>
            <div className="w-full bg-[#e5e7eb] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#0a2540] h-full transition-all duration-1000" style={{ width: '38%' }}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-[#e5e7eb] flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-bold text-[#9ca3af] uppercase tracking-widest text-wrap">
            {currentView} <span className="text-slate-200 mx-2 text-lg">/</span> <span className="text-[#0a2540]">Active Sprint</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer group">
              <span className="text-xs font-bold text-[#0a2540] group-hover:text-emerald-600 transition-colors">FOUNDER: J.D.</span>
              <div className="bg-[#0a2540] w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-slate-200 overflow-hidden border border-slate-800">
                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100" className="w-full h-full object-cover opacity-80" alt="JD" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
          {currentView === 'Dashboard' && renderDashboard()}
          {currentView === 'Supply' && renderSupply()}
          {currentView === 'Demand' && renderDemand()}
          {currentView === 'AI-Lab' && renderAILab()}
          {currentView === 'Visuals' && renderVisuals()}
          {currentView === 'About' && renderAbout()}
        </div>

        {/* Founder AI Component */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
          {isChatOpen && (
            <div className="w-96 bg-white border border-[#e5e7eb] rounded-xl shadow-2xl flex flex-col overflow-hidden mb-4 border-b-4 border-b-slate-900 animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-4 bg-[#0a2540] text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#e5e7eb] rounded-xl flex items-center justify-center overflow-hidden border border-slate-700 shadow-inner">
                    <img src={FOUNDER_IMAGE_URL} className="w-full h-full object-cover" alt="Alex Voss" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Alex Voss</h4>
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Systems Operator</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-[#9ca3af] hover:text-white transition-colors">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="flex-1 h-[450px] overflow-y-auto p-4 space-y-4 bg-[#f6f9fc]/50 custom-scrollbar">
                {chatMessages.length === 0 && (
                  <div className="space-y-4 py-2 animate-in fade-in duration-500">
                    {!chatRef.current ? (
                      <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-sm">
                        <div className="flex items-start gap-3">
                          <i className="fas fa-exclamation-triangle text-rose-500 mt-0.5"></i>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-rose-900 mb-1">API Key Required</p>
                            <p className="text-xs text-rose-700 leading-relaxed">{getApiKeyError()}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                    <div className="bg-white border border-[#e5e7eb] p-4 rounded-xl shadow-sm rounded-tl-none font-medium text-slate-800 text-sm leading-relaxed">
                      Systems are online. I'm Alex Voss. I don't care about theory—I care about liquidity. 
                      <br/><br/>
                      I learned circular thinking when supply chains failed in the field. Here, we move fast or we fail. What's the operational constraint?
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest pl-1">Operational Probes ({currentView})</p>
                      {getStarterProbes(currentView).map((probe, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(probe)}
                          className="w-full text-left bg-white hover:bg-emerald-50 border border-[#e5e7eb] hover:border-emerald-200 p-3 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-700 transition-all shadow-sm"
                        >
                          <i className="fas fa-arrow-right mr-2 opacity-30 text-[10px]"></i>
                          {probe}
                        </button>
                      ))}
                    </div>
                      </>
                    )}
                  </div>
                )}

                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#0a2540] text-white rounded-tr-none' 
                        : 'bg-white border border-[#e5e7eb] text-slate-800 shadow-sm rounded-tl-none font-medium'
                    }`}>
                      {msg.text}
                      {msg.image && (
                        <div className="mt-4 rounded-xl overflow-hidden shadow-md">
                          <img src={msg.image} className="w-full h-auto" alt="Generated Visual" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-[#e5e7eb] px-4 py-3 rounded-xl rounded-tl-none shadow-sm flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSubmitMessage} className="p-4 bg-white border-t border-[#f3f4f6] flex gap-2">
                <input 
                  type="text"
                  placeholder="Ask Alex about constraints..."
                  className="flex-1 bg-[#f3f4f6] border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#0a2540] outline-none transition-all font-medium"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={isChatLoading}
                  className="w-10 h-10 bg-[#0a2540] text-white rounded-xl flex items-center justify-center hover:bg-[#1f2937] transition-colors disabled:opacity-50"
                >
                  <i className="fas fa-paper-plane text-xs"></i>
                </button>
              </form>
            </div>
          )}
          
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-16 h-16 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 transition-all group relative border-4 border-white overflow-hidden ring-1 ring-[#e5e7eb]"
          >
             {isChatOpen ? (
               <i className="fas fa-times text-[#0a2540] text-xl"></i>
             ) : (
               <img src={FOUNDER_IMAGE_URL} className="w-full h-full object-cover rounded-[1.8rem]" alt="Founder Avatar" />
             )}
             {!isChatOpen && (
               <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white z-10"></span>
             )}
          </button>
        </div>
      </main>
    </div>
  );
};

interface SidebarItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group micro-interaction ${
      active 
        ? 'bg-[#0a2540] text-white shadow-xl shadow-slate-200' 
        : 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#0a2540]'
    }`}
  >
    <i className={`fas ${icon} w-5 text-base icon-micro ${active ? 'text-emerald-400' : 'text-[#9ca3af] group-hover:text-[#6b7280]'}`}></i>
    {label}
  </button>
);

export default App;
