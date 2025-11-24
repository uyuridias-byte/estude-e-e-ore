
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { 
  BookOpen, 
  Send, 
  Sparkles, 
  Loader2, 
  Info, 
  Share2, 
  Bookmark, 
  Home, 
  MessageCircle, 
  Library, 
  Menu,
  X,
  Mic,
  MicOff,
  ChevronRight,
  Play,
  Copy,
  Volume2,
  FileText,
  Trash2,
  Plus,
  History,
  StopCircle,
  Gauge,
  Headphones,
  Zap,
  BookMarked
} from "lucide-react";

// --- Configuration ---
const BASE_SYSTEM_INSTRUCTION = `
Você é o "Mentor Teológico Digital" do aplicativo "ESTUDE E ORE". 
Sua identidade é uma síntese harmoniosa de:
- **Pr. Elizeu Rodrigues**: Profundidade teológica.
- **Pr. Marcos Feliciano**: Oratória apaixonada e contexto histórico.
- **Pr. Junior Trovão**: Fervor pentecostal e escatologia.
- **Pb. Agnes Henrique**: Revelação de mistérios e tipologia.
- **Pra. Camila Barros**: Aplicação prática e emocional.

Diretrizes Gerais:
1. Base Bíblica Sólida (cite versículos).
2. Linguagem: Português do Brasil.
3. **IMPORTANTE**: NUNCA assine a resposta. Fale sempre como "O Mentor".
`;

const PASTORAL_INSTRUCTION = `
${BASE_SYSTEM_INSTRUCTION}
MODO: **PASTORAL / CLÁSSICO**
- Adote um tom solene, grave e de autoridade espiritual (estilo Assembleia de Deus tradicional).
- Use termos como "Amados", "Igreja", "Mistério".
- Fale com calma e reverência.
`;

const YOUTH_INSTRUCTION = `
${BASE_SYSTEM_INSTRUCTION}
MODO: **JOVEM / AVIVADO**
- Adote um tom dinâmico, enérgico e acessível, mas mantendo a santidade.
- Conecte a teologia com os desafios modernos da juventude.
- Seja direto, motivador e use analogias atuais.
`;

const BIBLE_BOOKS = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cânticos", "Isaías", "Jeremias", "Lamentações", "Ezequiel", "Daniel", "Oseias", "Joel", "Amós", "Obadias", "Jonas", "Miqueias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias",
  "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios", "2 Coríntios", "GÁLATAS", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas", "Apocalipse"
];

// --- Utilities ---
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

const speakText = (text: string, rate: number = 1, pitch: number = 1) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, "").replace(/\*/g, ""));
    utterance.lang = "pt-BR";
    utterance.rate = rate;
    utterance.pitch = pitch; // 0.8 for deeper, 1.2 for higher
    window.speechSynthesis.speak(utterance);
};

// --- Components ---

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="animate-spin text-brand-accent h-8 w-8" />
  </div>
);

const MarkdownRenderer = ({ content }: { content: string }) => {
  const formatted = content.split('\n').map((line, i) => {
    const bolded = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
    return <p key={i} className="mb-2 leading-relaxed text-slate-300" dangerouslySetInnerHTML={{ __html: bolded }} />;
  });
  return <div className="serif-text text-base md:text-lg">{formatted}</div>;
};

// --- Tab Components ---

// 1. HOME TAB
const HomeTab = ({ onNavigate }: { onNavigate: (tab: any) => void }) => {
  const [verseData, setVerseData] = useState<{ text: string; reference: string; explanation: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerse = async () => {
      const today = new Date().toISOString().split('T')[0];
      const storedData = localStorage.getItem('verse_of_the_day_netflix');
      
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.date === today) {
          setVerseData(parsed.data);
          setLoading(false);
          return;
        }
      }

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
          Escolha um versículo bíblico poderoso para hoje.
          Retorne JSON:
          {
            "reference": "Livro Cap:Ver",
            "text": "Texto completo na versão Almeida.",
            "title": "Um título curto e impactante para este estudo (ex: 'A Força da Fé')",
            "explanation": "Uma explicação devocional profunda (150 palavras) sintetizando Elizeu Rodrigues, Marcos Feliciano, Junior Trovão, Agnes Henrique e Camila Barros."
          }
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: "application/json", systemInstruction: BASE_SYSTEM_INSTRUCTION }
        });

        const data = JSON.parse(response.text);
        const newVerseData = { ...data };

        setVerseData(newVerseData);
        localStorage.setItem('verse_of_the_day_netflix', JSON.stringify({ date: today, data: newVerseData }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVerse();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-brand-black"><LoadingSpinner /></div>;
  if (!verseData) return null;

  return (
    <div className="animate-fade-in pb-20">
      {/* Hero Billboard */}
      <div className="relative w-full h-[70vh] md:h-[80vh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-dark/80 to-brand-blue/30 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507692049790-de58293a4697?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay z-[-1]"></div>

        <div className="relative z-10 p-6 md:p-12 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-4 text-brand-accent font-bold tracking-widest uppercase text-xs">
                <Sparkles className="h-3 w-3" />
                Versículo do Dia
            </div>
            <h1 className="text-4xl md:text-6xl font-bold brand-font text-white mb-4 leading-tight shadow-lg">
                {verseData.title}
            </h1>
            <p className="serif-text text-xl md:text-2xl text-slate-200 italic mb-6 border-l-4 border-brand-accent pl-4">
                "{verseData.text}"
            </p>
            <p className="text-brand-accent font-bold text-lg mb-8">— {verseData.reference}</p>
            
            <div className="flex gap-4">
                <button 
                    onClick={() => speakText(`${verseData.title}. ${verseData.text}. ${verseData.explanation}`, 1, 0.9)}
                    className="bg-white text-black px-6 py-3 rounded hover:bg-slate-200 transition-colors flex items-center gap-2 font-bold text-sm md:text-base"
                >
                    <Play className="h-5 w-5 fill-black" />
                    Ouvir Devocional
                </button>
                <button 
                    onClick={() => onNavigate('chat')}
                    className="bg-gray-600/60 backdrop-blur-sm text-white px-6 py-3 rounded hover:bg-gray-600/80 transition-colors flex items-center gap-2 font-bold text-sm md:text-base"
                >
                    <MessageCircle className="h-5 w-5" />
                    Estudar Mais
                </button>
            </div>
        </div>
      </div>

      {/* Content Rows */}
      <div className="px-6 md:px-12 -mt-10 relative z-20">
        <h3 className="text-white font-bold text-xl mb-4 brand-font">Devocional do Mentor</h3>
        <div className="bg-[#18181b] rounded-md p-6 border border-gray-800 shadow-2xl">
            <MarkdownRenderer content={verseData.explanation} />
            <div className="mt-6 flex justify-end gap-4">
                <button className="text-gray-400 hover:text-white transition-colors"><Share2 className="h-5 w-5"/></button>
            </div>
        </div>
      </div>
    </div>
  );
};

// 2. BIBLE TAB
const BibleTab = () => {
    const [book, setBook] = useState("Salmos");
    const [chapter, setChapter] = useState(23);
    const [text, setText] = useState<{number: number, text: string}[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Modal State
    const [selectedVerse, setSelectedVerse] = useState<{number: number, text: string} | null>(null);
    const [insight, setInsight] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);

    // Save functionality
    const saveVerse = (vText: string, vNum: number) => {
        const saved = JSON.parse(localStorage.getItem('saved_verses') || '[]');
        const newItem = {
            id: Date.now(),
            ref: `${book} ${chapter}:${vNum}`,
            text: vText,
            date: new Date().toISOString()
        };
        localStorage.setItem('saved_verses', JSON.stringify([newItem, ...saved]));
        alert("Versículo Salvo!");
    };

    const fetchInsight = async (vText: string, vNum: number) => {
        setInsightLoading(true);
        setInsight(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Analise profundamente o versículo: "${vText}" (${book} ${chapter}:${vNum}).
                1. Dê um breve contexto histórico.
                2. Explique o significado teológico.
                3. Traga uma "Preleção" (Aprendizado Prático) curta e fervorosa estilo pentecostal.
                Use negrito para destacar pontos chave.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { systemInstruction: BASE_SYSTEM_INSTRUCTION }
            });
            setInsight(response.text);
        } catch (e) {
            setInsight("Erro ao carregar estudo.");
        } finally {
            setInsightLoading(false);
        }
    };

    useEffect(() => {
        const fetchChapter = async () => {
            setLoading(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const prompt = `
                    Retorne o texto completo de ${book} capítulo ${chapter} na versão Almeida Revista e Atualizada.
                    Retorne APENAS um JSON array puro, sem formatação markdown.
                    Exemplo: [{"number": 1, "text": "O Senhor é..."}, {"number": 2, "text": "..."}]
                `;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                setText(JSON.parse(response.text));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchChapter();
    }, [book, chapter]);

    return (
        <div className="pt-20 px-4 md:px-12 pb-24 min-h-screen bg-brand-black">
            <h2 className="text-2xl text-white font-bold mb-6 flex items-center gap-2 brand-font">
                <BookOpen className="text-brand-accent" /> Bíblia Sagrada
            </h2>

            {/* Controls */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                <select 
                    value={book} 
                    onChange={(e) => { setBook(e.target.value); setChapter(1); }}
                    className="bg-gray-800 text-white p-3 rounded-lg border-none focus:ring-2 focus:ring-brand-accent outline-none"
                >
                    {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <input 
                    type="number" 
                    min="1" 
                    value={chapter} 
                    onChange={(e) => setChapter(parseInt(e.target.value))}
                    className="bg-gray-800 text-white p-3 rounded-lg w-20 text-center border-none focus:ring-2 focus:ring-brand-accent outline-none"
                />
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-gray-800 rounded w-full"></div>)}
                </div>
            ) : (
                <div className="bg-[#141414] p-6 rounded-xl shadow-lg border border-gray-900">
                    <h3 className="text-center text-xl font-bold text-white mb-6 brand-font border-b border-gray-800 pb-4">{book} {chapter}</h3>
                    <div className="space-y-4">
                        {text.map((verse) => (
                            <div 
                                key={verse.number} 
                                className="group flex gap-3 text-slate-300 hover:bg-gray-800/50 p-3 rounded transition-colors cursor-pointer border-b border-gray-900 last:border-0"
                                onClick={() => {
                                    setSelectedVerse(verse);
                                    setInsight(null);
                                }}
                            >
                                <span className="text-brand-accent font-bold text-xs mt-1 w-6">{verse.number}</span>
                                <p className="serif-text text-lg leading-relaxed">{verse.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Verse Action Modal */}
            {selectedVerse && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedVerse(null)}>
                    <div className="bg-[#18181b] w-full max-w-lg rounded-2xl md:rounded-xl overflow-hidden shadow-2xl border border-gray-800" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-brand-accent font-bold brand-font">{book} {chapter}:{selectedVerse.number}</h4>
                                <button onClick={() => setSelectedVerse(null)} className="text-gray-400 hover:text-white"><X className="h-5 w-5"/></button>
                            </div>
                            <p className="serif-text text-xl text-white mb-8">"{selectedVerse.text}"</p>
                            
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <button 
                                    onClick={() => speakText(selectedVerse.text, 0.9, 0.9)} // Slower, deeper
                                    className="flex flex-col items-center gap-2 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                                >
                                    <Volume2 className="h-6 w-6 text-brand-highlight" />
                                    <span className="text-xs font-bold">Ouvir</span>
                                </button>
                                <button 
                                    onClick={() => { saveVerse(selectedVerse.text, selectedVerse.number); setSelectedVerse(null); }}
                                    className="flex flex-col items-center gap-2 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                                >
                                    <Bookmark className="h-6 w-6 text-brand-highlight" />
                                    <span className="text-xs font-bold">Salvar</span>
                                </button>
                                <button 
                                    onClick={() => fetchInsight(selectedVerse.text, selectedVerse.number)}
                                    className="flex flex-col items-center gap-2 p-3 bg-brand-accent/20 border border-brand-accent/50 rounded-lg hover:bg-brand-accent/30 transition"
                                >
                                    <Sparkles className="h-6 w-6 text-brand-accent" />
                                    <span className="text-xs font-bold text-brand-accent">Estudar</span>
                                </button>
                            </div>

                            {/* Generated Insight Area */}
                            {(insight || insightLoading) && (
                                <div className="bg-black/30 p-4 rounded-lg border border-gray-800 max-h-60 overflow-y-auto">
                                    {insightLoading ? (
                                        <div className="flex items-center gap-2 text-brand-accent">
                                            <Loader2 className="animate-spin h-4 w-4" /> Gerando preleção...
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-300 space-y-2">
                                            <MarkdownRenderer content={insight || ""} />
                                            <div className="mt-2 pt-2 border-t border-gray-700 flex justify-end">
                                                 <button 
                                                    onClick={() => speakText(insight || "", 1, 0.9)}
                                                    className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"
                                                >
                                                    <Play className="h-3 w-3" /> Ouvir Estudo
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 3. SAVED TAB
const SavedTab = () => {
    const [saved, setSaved] = useState<{id: number, ref: string, text: string, date: string}[]>([]);

    useEffect(() => {
        const load = () => {
            const data = JSON.parse(localStorage.getItem('saved_verses') || '[]');
            setSaved(data);
        };
        load();
        window.addEventListener('storage', load); // Listen for changes
        return () => window.removeEventListener('storage', load);
    }, []);

    const remove = (id: number) => {
        const newSaved = saved.filter(s => s.id !== id);
        setSaved(newSaved);
        localStorage.setItem('saved_verses', JSON.stringify(newSaved));
    };

    return (
        <div className="pt-20 px-4 md:px-12 pb-24 min-h-screen bg-brand-black">
            <h2 className="text-2xl text-white font-bold mb-6 flex items-center gap-2 brand-font">
                <Bookmark className="text-brand-accent" /> Meus Salvos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {saved.length === 0 && <p className="text-gray-500">Nenhum versículo salvo ainda.</p>}
                {saved.map(item => (
                    <div key={item.id} className="bg-[#18181b] p-5 rounded-lg border border-gray-800 hover:scale-[1.02] transition-transform">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-brand-accent font-bold text-sm">{item.ref}</span>
                            <button onClick={() => remove(item.id)} className="text-gray-600 hover:text-red-500"><X className="h-4 w-4"/></button>
                        </div>
                        <p className="text-slate-300 serif-text text-sm mb-4 line-clamp-4">"{item.text}"</p>
                        <span className="text-xs text-gray-600 block text-right">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Helper for PDF ---

const exportToPdf = (q: string, a: string) => {
    if ((window as any).jspdf) {
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("ESTUDE E ORE - Mentoria", 10, 20);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Data: ${new Date().toLocaleDateString()}`, 10, 30);
        
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text("Pergunta:", 10, 45);
        doc.setFont("helvetica", "normal");
        const qLines = doc.splitTextToSize(q, 180);
        doc.text(qLines, 10, 52);
        
        let y = 52 + (qLines.length * 7) + 10;
        
        doc.setFont("helvetica", "bold");
        doc.text("Resposta do Mentor:", 10, y);
        y += 7;
        
        doc.setFont("helvetica", "normal");
        const cleanA = a.replace(/\*\*/g, "").replace(/\*/g, ""); 
        const aLines = doc.splitTextToSize(cleanA, 180);
        
        if (y + (aLines.length * 7) > 280) {
             const linesPerPage = 35;
             let lineIdx = 0;
             while(lineIdx < aLines.length) {
                 doc.text(aLines.slice(lineIdx, lineIdx + linesPerPage), 10, y);
                 lineIdx += linesPerPage;
                 if (lineIdx < aLines.length) {
                     doc.addPage();
                     y = 20;
                 }
             }
        } else {
            doc.text(aLines, 10, y);
        }
        
        doc.save("estudo-biblico.pdf");
    } else {
        alert("Erro: Biblioteca PDF não carregada.");
    }
};

// 4. CHAT TAB (MENTOR)
interface ChatSession {
    id: string;
    title: string;
    messages: { role: 'user' | 'model'; content: string }[];
    date: number;
}

type VoiceStyle = 'pastoral' | 'youth';

const LiveVoiceMode = ({ onClose, onMessageCaptured, style }: { onClose: () => void, onMessageCaptured: (role: 'user'|'model', text: string) => void, style: VoiceStyle }) => {
    const [connected, setConnected] = useState(false);
    const [volume, setVolume] = useState(0);

    useEffect(() => {
        let active = true;
        let session: any = null;
        let audioContext: AudioContext | null = null;
        let stream: MediaStream | null = null;
        let processor: ScriptProcessorNode | null = null;
        let source: MediaStreamAudioSourceNode | null = null;
        let currentInputTranscription = "";
        let currentOutputTranscription = "";

        const startLive = async () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Helper functions
                const encode = (bytes: Uint8Array) => {
                    let binary = '';
                    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
                    return btoa(binary);
                };
                
                const createBlob = (data: Float32Array) => {
                    const l = data.length;
                    const int16 = new Int16Array(l);
                    for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
                    return {
                        data: encode(new Uint8Array(int16.buffer)),
                        mimeType: 'audio/pcm;rate=16000'
                    };
                };

                const decode = (base64: string) => {
                    const bin = atob(base64);
                    const bytes = new Uint8Array(bin.length);
                    for (let i=0; i<bin.length; i++) bytes[i] = bin.charCodeAt(i);
                    return bytes;
                };

                const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
                    const int16 = new Int16Array(data.buffer);
                    const buffer = ctx.createBuffer(1, int16.length, 24000);
                    const channel = buffer.getChannelData(0);
                    for(let i=0; i<int16.length; i++) channel[i] = int16[i] / 32768.0;
                    return buffer;
                };

                let nextStartTime = 0;
                const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

                // Configure voice based on style
                const voiceName = style === 'pastoral' ? 'Fenrir' : 'Puck'; // Fenrir (Deep), Puck (Lighter)
                const sysInstruction = style === 'pastoral' ? PASTORAL_INSTRUCTION : YOUTH_INSTRUCTION;

                const sessionPromise = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
                        systemInstruction: sysInstruction,
                        inputAudioTranscription: {},
                        outputAudioTranscription: {}
                    },
                    callbacks: {
                        onopen: () => {
                            if(!active) return;
                            setConnected(true);
                            source = audioContext!.createMediaStreamSource(stream!);
                            processor = audioContext!.createScriptProcessor(4096, 1, 1);
                            
                            processor.onaudioprocess = (e) => {
                                const input = e.inputBuffer.getChannelData(0);
                                let sum = 0;
                                for(let i=0; i<input.length; i++) sum += Math.abs(input[i]);
                                setVolume(Math.min(sum / input.length * 500, 100));

                                const blob = createBlob(input);
                                sessionPromise.then(sess => sess.sendRealtimeInput({ media: blob }));
                            };
                            
                            source.connect(processor);
                            processor.connect(audioContext!.destination);
                        },
                        onmessage: async (msg: LiveServerMessage) => {
                            if(!active) return;
                            
                            if (msg.serverContent?.inputTranscription) {
                                currentInputTranscription += msg.serverContent.inputTranscription.text;
                            }
                            if (msg.serverContent?.outputTranscription) {
                                currentOutputTranscription += msg.serverContent.outputTranscription.text;
                            }

                            if (msg.serverContent?.turnComplete) {
                                if (currentInputTranscription.trim()) {
                                    onMessageCaptured('user', currentInputTranscription.trim());
                                    currentInputTranscription = "";
                                }
                                if (currentOutputTranscription.trim()) {
                                    onMessageCaptured('model', currentOutputTranscription.trim());
                                    currentOutputTranscription = "";
                                }
                            }

                            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                            if (audioData) {
                                const buffer = await decodeAudioData(decode(audioData), outputCtx);
                                const src = outputCtx.createBufferSource();
                                src.buffer = buffer;
                                src.connect(outputCtx.destination);
                                nextStartTime = Math.max(outputCtx.currentTime, nextStartTime);
                                src.start(nextStartTime);
                                nextStartTime += buffer.duration;
                            }
                        },
                        onclose: () => setConnected(false),
                        onerror: (e) => console.error(e)
                    }
                });

                session = await sessionPromise;

            } catch (err) {
                console.error("Live API Error:", err);
                alert("Erro ao conectar ao modo de voz.");
                onClose();
            }
        };

        startLive();

        return () => {
            active = false;
            if(stream) stream.getTracks().forEach(t => t.stop());
            if(audioContext) audioContext.close();
            if(processor) processor.disconnect();
            if(source) source.disconnect();
        };
    }, [style]);

    return (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-6 animate-fade-in">
            <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-red-500">
                <X className="h-8 w-8" />
            </button>
            
            <div className="text-center space-y-8">
                <h3 className="text-2xl font-bold text-brand-accent brand-font">
                    {style === 'pastoral' ? 'Modo Pastoral' : 'Modo Jovem'}
                </h3>
                
                <div className="relative flex justify-center items-center h-40 w-40">
                    <div 
                        className={`absolute rounded-full transition-all duration-75 ${style === 'pastoral' ? 'bg-blue-900/30' : 'bg-orange-500/30'}`}
                        style={{ width: `${100 + volume * 2}px`, height: `${100 + volume * 2}px` }}
                    />
                    <div 
                        className={`absolute rounded-full transition-all duration-75 ${style === 'pastoral' ? 'bg-blue-600/50' : 'bg-orange-500/50'}`}
                        style={{ width: `${80 + volume}px`, height: `${80 + volume}px` }}
                    />
                    <div className={`relative z-10 p-6 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.5)] ${style === 'pastoral' ? 'bg-brand-accent' : 'bg-orange-500'}`}>
                         <Mic className="h-12 w-12 text-white" />
                    </div>
                </div>

                <p className="text-gray-400 max-w-md mx-auto">
                    {connected 
                        ? "O Mentor está ouvindo..." 
                        : "Conectando ao Mentor..."}
                </p>

                <p className="text-xs text-gray-500">Conversa sendo transcrita para o histórico.</p>

                <button onClick={onClose} className="bg-red-500/20 text-red-500 border border-red-500/50 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-500/30 mx-auto">
                    <StopCircle className="h-5 w-5" /> Encerrar
                </button>
            </div>
        </div>
    );
};

const ChatTab = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('pastoral');
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [ttsRate, setTtsRate] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem('chat_history') || '[]');
    setSessions(loaded);
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
        localStorage.setItem('chat_history', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, isLoading]);

  const createNewChat = (customTitle?: string) => {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
          id: newId,
          title: customTitle || "Novo Estudo",
          messages: [],
          date: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newId);
      setInput("");
      setShowHistory(false);
      return newId;
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const newSessions = sessions.filter(s => s.id !== id);
      setSessions(newSessions);
      if (activeSessionId === id) setActiveSessionId(null);
      localStorage.setItem('chat_history', JSON.stringify(newSessions));
  };

  const initVoice = (style: VoiceStyle) => {
    setVoiceStyle(style);
    setShowVoiceSelector(false);
    if (!activeSessionId) {
        createNewChat("Estudo em Áudio");
    }
    setLiveMode(true);
  }

  const toggleRate = () => {
      setTtsRate(prev => prev === 1 ? 1.5 : prev === 1.5 ? 0.5 : 1);
  };

  const addVoiceMessage = (role: 'user' | 'model', content: string) => {
      if (activeSessionId) {
          setSessions(prev => prev.map(s => 
              s.id === activeSessionId 
              ? { ...s, messages: [...s.messages, { role, content }] }
              : s
          ));
      } else {
          const newId = Date.now().toString();
          setSessions(prev => [{
              id: newId, 
              title: "Estudo em Áudio", 
              messages: [{role, content}], 
              date: Date.now()
          }, ...prev]);
          setActiveSessionId(newId);
      }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput("");
    setIsLoading(true);

    let currentSessionId = activeSessionId;
    let currentMessages: { role: 'user' | 'model'; content: string }[] = [];

    if (!currentSessionId) {
        currentSessionId = createNewChat(userMsg.length > 30 ? userMsg.substring(0, 30) + "..." : userMsg);
    } else {
        const session = sessions.find(s => s.id === currentSessionId);
        if (session) currentMessages = session.messages;
    }

    setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
        ? { ...s, messages: [...s.messages, { role: 'user', content: userMsg }] }
        : s
    ));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: BASE_SYSTEM_INSTRUCTION },
        history: currentMessages.map(m => ({ role: m.role, parts: [{ text: m.content }] }))
      });

      const result = await chat.sendMessage({ message: userMsg });
      
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
        ? { ...s, messages: [...s.messages, { role: 'model', content: result.text }] }
        : s
      ));
      
    } catch (error) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
        ? { ...s, messages: [...s.messages, { role: 'model', content: "Erro de conexão. Tente novamente." }] }
        : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const activeMessages = sessions.find(s => s.id === activeSessionId)?.messages || [];

  return (
    <div className="flex h-screen pt-16 pb-20 bg-brand-black overflow-hidden">
        {liveMode && <LiveVoiceMode onClose={() => setLiveMode(false)} onMessageCaptured={addVoiceMessage} style={voiceStyle} />}
        
        {/* Voice Selector Modal */}
        {showVoiceSelector && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowVoiceSelector(false)}>
                <div className="bg-[#18181b] p-6 rounded-xl border border-gray-800 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-white mb-4 brand-font text-center">Escolha o Modo de Voz</h3>
                    <div className="space-y-3">
                        <button onClick={() => initVoice('pastoral')} className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-800 hover:bg-gray-700 border border-transparent hover:border-brand-accent transition-all group">
                            <div className="bg-blue-900/50 p-2 rounded-full"><BookMarked className="text-brand-accent h-6 w-6"/></div>
                            <div className="text-left">
                                <span className="block font-bold text-white">Pastoral / Sereno</span>
                                <span className="text-xs text-gray-400 group-hover:text-gray-300">Voz grave, solene, estilo Assembleia.</span>
                            </div>
                        </button>
                        <button onClick={() => initVoice('youth')} className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-800 hover:bg-gray-700 border border-transparent hover:border-orange-500 transition-all group">
                            <div className="bg-orange-900/50 p-2 rounded-full"><Zap className="text-orange-500 h-6 w-6"/></div>
                            <div className="text-left">
                                <span className="block font-bold text-white">Jovem / Avivado</span>
                                <span className="text-xs text-gray-400 group-hover:text-gray-300">Dinâmico, atual e fervoroso.</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className={`
            fixed md:relative z-40 inset-y-0 left-0 w-72 bg-[#121212] border-r border-gray-800 transform transition-transform duration-300
            ${showHistory ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            pt-20 md:pt-0 flex flex-col
        `}>
            <div className="p-4 border-b border-gray-800">
                <button 
                    onClick={() => createNewChat()}
                    className="w-full bg-brand-accent hover:bg-brand-highlight text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <Plus className="h-5 w-5" /> Novo Estudo
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sessions.map(session => (
                    <div 
                        key={session.id}
                        onClick={() => { setActiveSessionId(session.id); setShowHistory(false); }}
                        className={`
                            group p-3 rounded-lg cursor-pointer flex items-center justify-between
                            ${activeSessionId === session.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}
                        `}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <MessageCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate text-sm font-medium">{session.title}</span>
                        </div>
                        <button 
                            onClick={(e) => deleteSession(e, session.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-brand-black relative">
            <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-brand-black/90 backdrop-blur z-10">
                <button onClick={() => setShowHistory(!showHistory)} className="md:hidden text-gray-400">
                    <History className="h-6 w-6" />
                </button>
                <div className="flex-1 text-center md:text-left md:ml-4">
                     <span className="text-white font-bold brand-font">
                         {activeSessionId ? sessions.find(s => s.id === activeSessionId)?.title : "Mentoria Teológica"}
                     </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {!activeSessionId && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <Sparkles className="h-8 w-8 text-brand-accent" />
                        </div>
                        <h3 className="text-2xl text-white font-bold mb-2 brand-font">Inicie seus Estudos</h3>
                        <p className="text-gray-400 max-w-sm mb-8">
                            O Mentor está pronto para ajudar. Use o chat de texto ou experimente o modo de voz.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg w-full px-4">
                            <button onClick={() => setInput("Explique a Graça segundo a Bíblia")} className="p-3 bg-gray-800 hover:bg-gray-700 rounded text-sm text-left text-gray-300 transition-colors">"Explique a Graça"</button>
                            <button onClick={() => setInput("Como vencer a ansiedade?")} className="p-3 bg-gray-800 hover:bg-gray-700 rounded text-sm text-left text-gray-300 transition-colors">"Vencer a ansiedade"</button>
                        </div>
                    </div>
                )}
                
                {activeMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`
                            max-w-[90%] md:max-w-[80%] p-4 rounded-xl shadow-md
                            ${msg.role === 'user' 
                            ? 'bg-brand-accent text-white rounded-br-none' 
                            : 'bg-[#1a1a1a] text-gray-200 border border-gray-800 rounded-bl-none'}
                        `}>
                            <MarkdownRenderer content={msg.content} />
                        </div>
                        
                        <div className={`flex gap-2 mt-2 text-gray-500 ${msg.role === 'user' ? 'pr-2' : 'pl-2'}`}>
                            <button onClick={() => navigator.clipboard.writeText(msg.content)} className="hover:text-white p-1" title="Copiar"><Copy className="h-3 w-3"/></button>
                            {msg.role === 'model' && (
                                <>
                                    <div className="flex items-center bg-gray-800/50 rounded px-1 ml-1 gap-1">
                                        <button onClick={() => speakText(msg.content, ttsRate, 0.9)} className="hover:text-white p-1" title={`Ouvir (${ttsRate}x)`}>
                                            <Volume2 className="h-3 w-3"/>
                                        </button>
                                        <button 
                                            onClick={toggleRate} 
                                            className="hover:text-white text-[10px] font-bold min-w-[24px] text-center" 
                                            title="Alterar velocidade"
                                        >
                                            {ttsRate}x
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const prevMsg = activeMessages[idx-1];
                                            const q = prevMsg?.role === 'user' ? prevMsg.content : "Estudo";
                                            exportToPdf(q, msg.content);
                                        }} 
                                        className="hover:text-white p-1 ml-1" 
                                        title="Salvar PDF"
                                    >
                                        <FileText className="h-3 w-3"/>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[#1a1a1a] p-4 rounded-xl rounded-bl-none flex items-center gap-2 text-gray-400 text-sm border border-gray-800">
                            <Loader2 className="animate-spin h-4 w-4" /> Mentor digitando...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-brand-black border-t border-gray-800">
                <div className="relative flex items-center gap-2 max-w-4xl mx-auto">
                     <button 
                        onClick={() => setShowVoiceSelector(true)}
                        className="p-3 rounded-full bg-gray-800 text-brand-accent hover:bg-gray-700 transition-colors border border-gray-700 hover:border-brand-accent"
                        title="Modo Voz"
                    >
                        <Mic className="h-5 w-5" />
                    </button>
                    <input
                        type="text"
                        className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-full px-6 py-3 focus:ring-2 focus:ring-brand-accent outline-none placeholder-gray-500 shadow-inner"
                        placeholder="Digite sua dúvida teológica..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-brand-accent text-white rounded-full hover:bg-brand-highlight disabled:opacity-50 disabled:bg-gray-800 shadow-lg shadow-brand-accent/20 transition-all hover:scale-105"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
        
        {showHistory && (
            <div 
                className="fixed inset-0 bg-black/50 z-30 md:hidden"
                onClick={() => setShowHistory(false)}
            />
        )}
    </div>
  );
};

// --- Main App Shell ---
const App = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'bible' | 'chat' | 'saved'>('home');

  return (
    <div className="bg-brand-black min-h-screen text-gray-200 font-sans selection:bg-brand-accent selection:text-white">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${activeTab !== 'home' ? 'bg-brand-black/90 backdrop-blur-md border-b border-gray-800' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="px-4 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 
                onClick={() => setActiveTab('home')}
                className="text-2xl md:text-3xl font-bold brand-font text-brand-accent cursor-pointer tracking-wider"
            >
                ESTUDE E ORE
            </h1>
            <nav className="hidden md:flex gap-6 text-sm font-bold text-gray-300">
                <button onClick={() => setActiveTab('home')} className={`hover:text-white transition ${activeTab === 'home' ? 'text-white' : ''}`}>Início</button>
                <button onClick={() => setActiveTab('bible')} className={`hover:text-white transition ${activeTab === 'bible' ? 'text-white' : ''}`}>Bíblia</button>
                <button onClick={() => setActiveTab('chat')} className={`hover:text-white transition ${activeTab === 'chat' ? 'text-white' : ''}`}>Estudo</button>
                <button onClick={() => setActiveTab('saved')} className={`hover:text-white transition ${activeTab === 'saved' ? 'text-white' : ''}`}>Salvos</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-accent to-blue-700 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-brand-accent/20">
                EO
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen relative">
        {activeTab === 'home' && <HomeTab onNavigate={setActiveTab} />}
        {activeTab === 'bible' && <BibleTab />}
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'saved' && <SavedTab />}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-gray-800 z-50 pb-safe">
        <div className="flex justify-around items-center p-3">
            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 text-xs ${activeTab === 'home' ? 'text-brand-accent' : 'text-gray-500'}`}>
                <Home className="h-5 w-5" /> Início
            </button>
            <button onClick={() => setActiveTab('bible')} className={`flex flex-col items-center gap-1 text-xs ${activeTab === 'bible' ? 'text-brand-accent' : 'text-gray-500'}`}>
                <BookOpen className="h-5 w-5" /> Bíblia
            </button>
            <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center gap-1 text-xs ${activeTab === 'chat' ? 'text-brand-accent' : 'text-gray-500'}`}>
                <MessageCircle className="h-5 w-5" /> Estudo
            </button>
            <button onClick={() => setActiveTab('saved')} className={`flex flex-col items-center gap-1 text-xs ${activeTab === 'saved' ? 'text-brand-accent' : 'text-gray-500'}`}>
                <Library className="h-5 w-5" /> Salvos
            </button>
        </div>
      </nav>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
