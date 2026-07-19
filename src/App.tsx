import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Info,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  HelpCircle,
  FileText,
  Bookmark,
  ExternalLink,
  ThumbsUp,
  Sliders,
  ChevronDown,
  Cpu,
  Lock,
  Globe,
  Database,
  Terminal,
  Activity
} from "lucide-react";
import { SAMPLE_CASES, TAXONOMY_DETAILS } from "./data";
import { AnalysisResult, Finding, SampleCase } from "./types";

export default function App() {
  const [text, setText] = useState<string>(SAMPLE_CASES[0].text);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedJSON, setCopiedJSON] = useState<boolean>(false);
  const [analysisPhase, setAnalysisPhase] = useState<string>("");
  const [showTaxonomyGuide, setShowTaxonomyGuide] = useState<boolean>(false);

  // Playground/Model parameters
  const [model, setModel] = useState<string>("Gemini 1.5 Pro");
  const [temperature, setTemperature] = useState<number>(0.1);
  const [safetySetting, setSafetySetting] = useState<string>("BLOCK_NONE");
  const [structuredOutput, setStructuredOutput] = useState<boolean>(true);
  const [codeExecution, setCodeExecution] = useState<boolean>(false);
  const [grounding, setGrounding] = useState<boolean>(false);

  // Right sidebar active tab
  const [activeTab, setActiveTab] = useState<"diagnostics" | "json">("diagnostics");

  const findingsListRef = useRef<HTMLDivElement>(null);
  const findingCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Rotate through simulated analysis phases for a more engaging UX
  useEffect(() => {
    if (!isLoading) return;
    const phases = [
      "Ingesting content stream...",
      "Analyzing rhetorical structure...",
      "Scanning for emotional trigger words...",
      "Matching against forensic linguistic taxonomy...",
      "Calculating content objectivity index...",
      "Assembling structured findings report..."
    ];
    let currentIdx = 0;
    setAnalysisPhase(phases[0]);

    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % phases.length;
      setAnalysisPhase(phases[currentIdx]);
    }, 1800);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle media bias analysis request
  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please enter or paste some text to analyze.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedIndex(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze the text.");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCase = (sample: SampleCase) => {
    setText(sample.text);
    setResult(null);
    setSelectedIndex(null);
    setError(null);
  };

  const handleReset = () => {
    setResult(null);
    setSelectedIndex(null);
    setError(null);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyJSON = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result.findings, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  const handleSelectFinding = (index: number) => {
    setSelectedIndex(index);
    // Scroll the corresponding card in the list into view
    setTimeout(() => {
      const element = findingCardRefs.current[index];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
  };

  // Helper: Greedily calculate highlight ranges to prevent overlapping matches
  interface HighlightRange {
    start: number;
    end: number;
    findingIndex: number;
    finding: Finding;
  }

  const getHighlightRanges = (): HighlightRange[] => {
    if (!result || !result.findings) return [];
    
    const ranges: HighlightRange[] = [];
    const textLower = text.toLowerCase();

    // Sort findings by quote length descending to ensure longer sub-phrases match first
    const sortedFindings = result.findings
      .map((f, idx) => ({ f, originalIndex: idx }))
      .filter(item => item.f.exact_quote && item.f.exact_quote.trim().length > 0)
      .sort((a, b) => b.f.exact_quote.length - a.f.exact_quote.length);

    for (const { f, originalIndex } of sortedFindings) {
      const quote = f.exact_quote.trim();
      const quoteLower = quote.toLowerCase();
      
      let startIdx = 0;
      while (true) {
        const idx = textLower.indexOf(quoteLower, startIdx);
        if (idx === -1) break;

        const endIdx = idx + quote.length;
        
        // Ensure no overlap with already identified ranges
        let hasOverlap = false;
        for (const range of ranges) {
          if (Math.max(range.start, idx) < Math.min(range.end, endIdx)) {
            hasOverlap = true;
            break;
          }
        }

        if (!hasOverlap) {
          ranges.push({
            start: idx,
            end: endIdx,
            findingIndex: originalIndex,
            finding: f
          });
          break; // Found the best non-overlapping match for this finding
        }
        startIdx = idx + 1;
      }
    }

    // Sort ranges by occurrence in text
    return ranges.sort((a, b) => a.start - b.start);
  };

  const highlightRanges = getHighlightRanges();

  // Render the original text with dynamic, clickable highlights matching the professional template
  const renderHighlightedText = () => {
    if (highlightRanges.length === 0) {
      return (
        <p className="leading-relaxed text-gray-300 font-serif text-[17px] whitespace-pre-wrap">
          {text}
        </p>
      );
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    highlightRanges.forEach((range, idx) => {
      // Non-highlighted prefix
      if (range.start > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`} className="text-gray-300">
            {text.substring(lastIndex, range.start)}
          </span>
        );
      }

      // Highlighted quote
      const isSelected = selectedIndex === range.findingIndex;
      const severity = range.finding.severity;
      const type = range.finding.bias_type;
      
      let highlightClass = "";
      
      if (type === "LOADED_LANGUAGE" || severity === "HIGH") {
        highlightClass = isSelected
          ? "bg-red-500/35 border-b-2 border-red-500 text-white font-medium"
          : "bg-red-500/20 border-b-2 border-red-500/50 text-gray-200 hover:bg-red-500/30";
      } else if (type === "SENSATIONALISM" || severity === "MED") {
        highlightClass = isSelected
          ? "bg-orange-500/35 border-b-2 border-orange-500 text-white font-medium"
          : "bg-orange-500/20 border-b-2 border-orange-500/50 text-gray-200 hover:bg-orange-500/30";
      } else if (type === "SLIPPERY_SLOPE") {
        highlightClass = isSelected
          ? "bg-amber-500/35 border-b-2 border-amber-500 text-white font-medium"
          : "bg-amber-500/20 border-b-2 border-amber-500/50 text-gray-200 hover:bg-amber-500/30";
      } else {
        highlightClass = isSelected
          ? "bg-blue-500/35 border-b-2 border-blue-500 text-white font-medium"
          : "bg-blue-500/20 border-b-2 border-blue-500/50 text-gray-200 hover:bg-blue-500/30";
      }

      elements.push(
        <span
          key={`highlight-${idx}`}
          id={`highlight-segment-${range.findingIndex}`}
          onClick={() => handleSelectFinding(range.findingIndex)}
          className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-150 inline-block relative group select-text ${highlightClass} ${
            isSelected ? "ring-2 ring-blue-500/40 scale-[1.01]" : ""
          }`}
        >
          {text.substring(range.start, range.end)}
          
          {/* Miniature tag popup */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#12141D] text-white border border-gray-700 text-[10px] py-1 px-2.5 rounded-md shadow-xl whitespace-nowrap z-25 pointer-events-none font-mono">
            {type.replace("_", " ")} • {severity}
          </span>
        </span>
      );

      lastIndex = range.end;
    });

    // Remainder of text
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end" className="text-gray-300">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return (
      <div className="leading-relaxed font-serif text-[17px] whitespace-pre-wrap select-text">
        {elements}
      </div>
    );
  };

  // Compute stats on matched bias categories
  const getBiasTypeCount = () => {
    if (!result) return {};
    const counts: Record<string, number> = {};
    result.findings.forEach(f => {
      counts[f.bias_type] = (counts[f.bias_type] || 0) + 1;
    });
    return counts;
  };

  const biasCounts = getBiasTypeCount();

  // Helper to get overall color of objectivity score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-800/60 bg-emerald-900/20";
    if (score >= 50) return "text-amber-400 border-amber-800/60 bg-amber-900/20";
    return "text-rose-400 border-rose-900/60 bg-rose-900/20";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Factual & Objective";
    if (score >= 50) return "Moderate Rhetoric Bias";
    return "High Rhetorical Manipulation";
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] flex flex-col font-sans select-none">
      
      {/* Top Header Bar from design guidelines */}
      <header id="main-header" className="sticky top-0 bg-[#12141D] border-b border-gray-800 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 flex items-center justify-center rounded text-white font-bold text-lg shadow-md shadow-blue-500/10">
            Ω
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
              Linguistic Forensic API
              <span className="text-blue-500 text-xs font-mono ml-2 opacity-85 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                v1.5.0-PRO
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-950/40 border border-green-800/80 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-400 font-mono tracking-wider">API READY</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-gray-800 mx-1"></div>
          
          <button
            id="taxonomy-guide-btn"
            onClick={() => setShowTaxonomyGuide(!showTaxonomyGuide)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              showTaxonomyGuide
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                : "bg-[#1F2833] text-gray-300 border border-gray-700 hover:bg-gray-700"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Taxonomy List</span>
          </button>
          
          <button
            id="run-analysis-btn"
            onClick={result ? handleReset : handleAnalyze}
            disabled={isLoading || !text.trim()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded text-xs font-bold tracking-widest uppercase transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : result ? (
              <RefreshCw className="w-3.5 h-3.5" />
            ) : (
              <Terminal className="w-3.5 h-3.5" />
            )}
            <span>{result ? "RESET ENGINE" : "RUN ANALYSIS"}</span>
          </button>
        </div>
      </header>

      {/* Main Sandbox Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* Left Sidebar: Parameters & Configuration */}
        <aside className="w-full lg:w-[280px] bg-[#12141D] border-b lg:border-b-0 lg:border-r border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
          <div>
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              Model Parameters
            </h2>
            <div className="space-y-4">
              {/* Model selection mock dropdown */}
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Model Selection</label>
                <div className="w-full bg-[#1F2833] border border-gray-700 rounded px-3 py-2 text-xs text-white flex justify-between items-center cursor-not-allowed">
                  <span>{model}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </div>
              </div>

              {/* Temperature slider widget */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider">Temperature</label>
                  <span className="text-xs font-mono text-blue-400">{temperature.toFixed(1)}</span>
                </div>
                <div className="py-2">
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-hidden"
                  />
                  <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-1">
                    <span>0.0 (Strict)</span>
                    <span>1.0 (Creative)</span>
                  </div>
                </div>
              </div>

              {/* Safety Settings badging */}
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Safety Filters</label>
                <div className="bg-red-900/10 border border-red-900/50 rounded px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400 font-medium font-mono">{safetySetting}</span>
                  </div>
                  <span className="text-[9px] font-bold text-red-500 tracking-wider">OVERRIDDEN</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              API Settings Toggles
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-300 font-medium">Structured Output</span>
                  <span className="text-[10px] text-gray-500">Force strict JSON schema</span>
                </div>
                <button
                  onClick={() => setStructuredOutput(!structuredOutput)}
                  className={`w-9 h-5 rounded-full transition-all flex items-center p-0.5 cursor-pointer ${
                    structuredOutput ? "bg-blue-600 justify-end" : "bg-gray-800 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-300 font-medium">Code Execution</span>
                  <span className="text-[10px] text-gray-500">Execute sandbox scripts</span>
                </div>
                <button
                  onClick={() => setCodeExecution(!codeExecution)}
                  className={`w-9 h-5 rounded-full transition-all flex items-center p-0.5 cursor-pointer ${
                    codeExecution ? "bg-blue-600 justify-end" : "bg-gray-800 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-300 font-medium">Grounding (Search)</span>
                  <span className="text-[10px] text-gray-500">Cross-reference live web</span>
                </div>
                <button
                  onClick={() => setGrounding(!grounding)}
                  className={`w-9 h-5 rounded-full transition-all flex items-center p-0.5 cursor-pointer ${
                    grounding ? "bg-blue-600 justify-end" : "bg-gray-800 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick preset cases panel nested inside control bar */}
          <div className="border-t border-gray-800 pt-6 mt-auto">
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-blue-500" />
              Ingest Presets
            </h2>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {SAMPLE_CASES.map((sample) => {
                const isSelected = text === sample.text;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectCase(sample)}
                    className={`w-full text-left p-2 rounded text-xs font-medium transition-all block truncate cursor-pointer ${
                      isSelected
                        ? "bg-blue-950/45 border border-blue-800/80 text-white"
                        : "bg-[#1F2833]/35 border border-transparent text-gray-400 hover:text-white hover:bg-[#1F2833]/80"
                    }`}
                  >
                    {sample.title}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Central Area: Document Editor & Analyzed Display */}
        <section className="flex-1 flex flex-col bg-[#0B0C10] border-b lg:border-b-0 lg:border-r border-gray-800 overflow-y-auto p-6 lg:p-8 gap-6">
          
          {/* Taxonomy collapsible reference bar */}
          <AnimatePresence>
            {showTaxonomyGuide && (
              <motion.div
                id="taxonomy-guide-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden bg-[#12141D] border border-gray-800 rounded-xl shadow-2xl shrink-0"
              >
                <div className="p-4 border-b border-gray-800 bg-[#1A1D29] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="font-display font-semibold text-white text-xs uppercase tracking-wider">
                      Forensic Linguistic Taxonomy Blueprint
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowTaxonomyGuide(false)}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer font-mono"
                  >
                    [CLOSE]
                  </button>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                  {Object.values(TAXONOMY_DETAILS).map((tax) => (
                    <div key={tax.id} className="p-3 rounded bg-[#1F2833]/40 border border-gray-800 flex flex-col justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-white font-bold">{tax.name}</span>
                          <span className="text-[9px] font-mono opacity-50">({tax.id})</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-[11px]">{tax.definition}</p>
                      </div>
                      <div className="bg-[#050608]/50 p-2 rounded border border-gray-800/80 font-mono text-[10px] text-gray-500 italic">
                        Example: "{tax.example}"
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Content Box */}
          <div className="flex-1 flex flex-col bg-[#12141D] border border-gray-800 rounded-xl p-6 min-h-[380px] relative shadow-2xl">
            
            {/* Box Header stats */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {result ? "Analyzed Semantic Source" : "Input Source Narrative"}
                </h2>
              </div>
              <span className="text-xs font-mono text-gray-500">
                {text.length} characters / {text.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            {/* Input field vs highlighted display */}
            {!result && !isLoading ? (
              <div className="flex-1 flex flex-col relative">
                <textarea
                  id="user-text-input"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Paste editorial copy, corporate environmental statement, or campaign press release to analyze rhetoric and loaded fallacies..."
                  className="w-full flex-1 bg-[#1F2833]/40 hover:bg-[#1F2833]/60 focus:bg-[#1F2833]/80 text-white p-4 rounded-lg border border-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-hidden font-serif text-[16px] md:text-[17px] leading-relaxed resize-none"
                />
                
                {/* Floating control action widgets inside editor */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#12141D] border border-gray-800 p-1 rounded shadow-lg">
                  {text && (
                    <button
                      onClick={() => setText("")}
                      className="p-1.5 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors cursor-pointer"
                      title="Clear content"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={handleCopyText}
                    className="p-1.5 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors cursor-pointer"
                    title="Copy input text"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ) : result && !isLoading ? (
              <div className="flex-1 bg-[#0B0C10] rounded-lg border border-gray-800 p-5 overflow-y-auto max-h-[500px]">
                {renderHighlightedText()}
              </div>
            ) : (
              // Full screen waiting overlay styled professionally with loading step loggers
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#0B0C10]/60 rounded-lg">
                <div className="relative mb-6">
                  <div className="w-14 h-14 rounded-full border-2 border-blue-500/10 border-t-blue-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-400 animate-pulse" />
                  </div>
                </div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-white mb-2 font-semibold">Running Forensic Parse</h3>
                <p className="text-[11px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 py-1 px-4 rounded-full animate-pulse">
                  {analysisPhase}
                </p>
                <div className="w-36 bg-gray-900 h-1 rounded-full overflow-hidden mt-5">
                  <div className="bg-blue-500 h-full animate-infinite-loading rounded-full" style={{ width: "60%" }} />
                </div>
              </div>
            )}

            {/* Error notifications */}
            {error && (
              <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Bottom active info bar or legend block */}
            {result ? (
              <div className="mt-4 p-3.5 bg-[#0B0C10] border border-gray-800 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span>Click any highlighted segment to drill down into structural fallacies.</span>
                </div>
                <button
                  id="re-edit-btn"
                  onClick={handleReset}
                  className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  Edit & Re-parse
                </button>
              </div>
            ) : (
              <div className="mt-4 p-3.5 bg-[#1F2833]/20 border border-gray-800/80 rounded-lg text-xs text-gray-500 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Inputs represent un-vetted statements. Pressing <span className="font-semibold text-gray-300">Run Analysis</span> invokes the Forensic Linguistics API to evaluate semantic structure and assign objectivity indicators.
                </p>
              </div>
            )}
          </div>

          {/* Color taxonomy visual legend shown underneath */}
          <div className="p-4 bg-[#12141D] border border-gray-800 rounded-xl flex flex-wrap justify-center sm:justify-start gap-5 shrink-0 shadow-lg">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest w-full sm:w-auto mb-1 sm:mb-0">
              Taxonomy Keys:
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-xs"></div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Loaded Language</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-xs"></div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Sensationalism</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-xs"></div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Slippery Slope</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-xs"></div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Anon. Appeal</span>
            </div>
          </div>
        </section>

        {/* Right Sidebar: Objectivity Index & Diagnostics / Code JSON */}
        <aside className="w-full lg:w-[380px] bg-[#0F111A] border-t lg:border-t-0 lg:border-l border-gray-900 flex flex-col overflow-y-auto shrink-0">
          
          {/* Header tabs selecting between visual findings list and RAW JSON output matching the mockup exactly */}
          <div className="px-4 border-b border-gray-800 bg-[#12141D] flex items-center justify-between shrink-0">
            <div className="flex">
              <button
                onClick={() => setActiveTab("diagnostics")}
                className={`py-3.5 px-3 border-b-2 font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === "diagnostics"
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                Diagnostics
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`py-3.5 px-3 border-b-2 font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === "json"
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                Raw JSON
              </button>
            </div>
            
            {activeTab === "json" && result && (
              <button
                onClick={handleCopyJSON}
                className="text-[10px] font-bold font-mono bg-gray-800 px-2 py-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
              >
                {copiedJSON ? "COPIED" : "COPY"}
              </button>
            )}
          </div>

          {/* Tab content area */}
          <div className="flex-1 flex flex-col min-h-0">
            {result ? (
              <>
                {activeTab === "diagnostics" ? (
                  <div className="p-6 flex flex-col gap-6 flex-1 min-h-0">
                    
                    {/* Neutral Objectivity Index Dial */}
                    <div className="bg-[#12141D] border border-gray-800 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-md shrink-0">
                      <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-4">
                        Forensic Integrity Meter
                      </span>
                      
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="41"
                            className="stroke-gray-800/60"
                            strokeWidth="7.5"
                            fill="none"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="41"
                            className="transition-all duration-1000 ease-out"
                            stroke={
                              result.objectivityScore >= 80 ? "#10b981" :
                              result.objectivityScore >= 50 ? "#f59e0b" : "#f43f5e"
                            }
                            strokeWidth="7.5"
                            fill="none"
                            strokeDasharray="257.6"
                            strokeDashoffset={257.6 - (257.6 * result.objectivityScore) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-2xl font-display font-bold text-white tracking-tight">
                            {result.objectivityScore}%
                          </span>
                          <span className="text-[8px] text-gray-500 font-mono font-medium tracking-wide uppercase">
                            Neutrality
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className={`inline-block text-[10px] font-bold font-mono tracking-wider uppercase px-3 py-1 rounded border ${getScoreColor(result.objectivityScore)}`}>
                          {getScoreLabel(result.objectivityScore)}
                        </span>
                      </div>

                      {/* Linguistic Forensic summary text */}
                      <div className="mt-4 pt-4 border-t border-gray-800 text-left w-full">
                        <p className="text-xs text-gray-400 leading-relaxed font-serif italic">
                          "{result.summary}"
                        </p>
                      </div>
                    </div>

                    {/* Breakdown Progress Bars */}
                    {result.findings.length > 0 && (
                      <div className="bg-[#12141D] border border-gray-800 rounded-xl p-4 shrink-0 shadow-md">
                        <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                          Category Profile
                        </h3>
                        <div className="space-y-3">
                          {Object.keys(biasCounts).map((type) => {
                            const taxInfo = TAXONOMY_DETAILS[type] || { name: type, bgLight: "bg-slate-150 text-slate-800", color: "blue" };
                            const count = biasCounts[type];
                            const percentage = (count / result.findings.length) * 100;
                            
                            return (
                              <div key={type} className="text-xs">
                                <div className="flex justify-between items-center mb-1 text-[11px]">
                                  <span className="font-medium text-gray-300">{taxInfo.name}</span>
                                  <span className="font-mono text-gray-500">{count} {count > 1 ? 'hits' : 'hit'}</span>
                                </div>
                                <div className="w-full bg-[#1F2833]/60 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    style={{ width: `${percentage}%` }}
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      type === "LOADED_LANGUAGE" ? "bg-red-500" :
                                      type === "SENSATIONALISM" ? "bg-orange-500" :
                                      type === "SLIPPERY_SLOPE" ? "bg-amber-500" : "bg-blue-500"
                                    }`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Scrollable breakdown list cards */}
                    <div className="flex-1 flex flex-col min-h-0">
                      <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-800">
                        Detailed Findings ({result.findings.length})
                      </h3>
                      
                      {result.findings.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#12141D] border border-dashed border-gray-800 rounded-xl">
                          <Check className="w-6 h-6 text-emerald-500 mb-2" />
                          <p className="text-xs text-gray-300 font-bold mb-1">Strict Objective Content</p>
                          <p className="text-[10px] text-gray-500 leading-relaxed max-w-[200px]">
                            Linguistic diagnostics isolated no patterns of emotional priming or logical fallacies.
                          </p>
                        </div>
                      ) : (
                        <div 
                          ref={findingsListRef}
                          className="flex-1 overflow-y-auto space-y-3 pr-1"
                        >
                          {result.findings.map((finding, idx) => {
                            const isSelected = selectedIndex === idx;
                            const taxInfo = TAXONOMY_DETAILS[finding.bias_type] || { name: finding.bias_type, bgLight: "bg-gray-800 text-gray-400" };
                            
                            return (
                              <div
                                key={idx}
                                ref={(el) => { findingCardRefs.current[idx] = el; }}
                                onClick={() => setSelectedIndex(idx)}
                                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-[#1F2833]/45 border-blue-500 shadow-xl ring-1 ring-blue-500/20"
                                    : "bg-[#12141D] border-gray-800/80 hover:border-gray-700 hover:bg-[#12141D]/80"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                                    finding.bias_type === "LOADED_LANGUAGE" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                    finding.bias_type === "SENSATIONALISM" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                                    finding.bias_type === "SLIPPERY_SLOPE" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                    "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  }`}>
                                    {taxInfo.name}
                                  </span>
                                  <span className="text-[8px] font-mono font-bold text-gray-500">
                                    {finding.severity} SEVERITY
                                  </span>
                                </div>

                                <div className="bg-[#050608] p-2 rounded border border-gray-900 mb-2">
                                  <p className="text-[10.5px] font-mono text-gray-400 italic">
                                    "{finding.exact_quote}"
                                  </p>
                                </div>

                                <div className="flex gap-1.5 items-start">
                                  <Info className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                                  <p className="text-[11px] text-gray-400 leading-relaxed">
                                    {finding.tooltip_explanation}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  // RAW JSON Code View matching the mockup exactly with beautiful syntax coloring!
                  <div className="flex-1 bg-[#050608] p-5 font-mono text-[11px] overflow-auto leading-normal select-text">
                    <div className="text-blue-400">[</div>
                    {result.findings.map((finding, idx) => {
                      const isLast = idx === result.findings.length - 1;
                      return (
                        <div key={idx} className="pl-4">
                          <div className="text-gray-500">{"{"}</div>
                          <div className="pl-4">
                            <span className="text-yellow-500">"exact_quote"</span>: <span className="text-green-500">"{finding.exact_quote.replace(/"/g, '\\"')}"</span>,
                          </div>
                          <div className="pl-4">
                            <span className="text-yellow-500">"bias_type"</span>: <span className="text-green-500">"{finding.bias_type}"</span>,
                          </div>
                          <div className="pl-4">
                            <span className="text-yellow-500">"severity"</span>: <span className={`${finding.severity === "HIGH" ? "text-red-400" : finding.severity === "MED" ? "text-orange-400" : "text-blue-400"}`}>"{finding.severity}"</span>,
                          </div>
                          <div className="pl-4">
                            <span className="text-yellow-500">"tooltip_explanation"</span>: <span className="text-green-500">"{finding.tooltip_explanation.replace(/"/g, '\\"')}"</span>
                          </div>
                          <div className="text-gray-500">{"}"}{isLast ? "" : ","}</div>
                        </div>
                      );
                    })}
                    <div className="text-blue-400">]</div>
                  </div>
                )}
              </>
            ) : (
              // Empty initial card prompt panel (sandbox explanation matching design mood)
              <div className="p-6 flex flex-col justify-between h-full flex-1">
                <div className="space-y-6">
                  <div className="border-b border-gray-800 pb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                      API Output Sandbox
                    </h3>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed font-serif">
                    The right-hand sandbox evaluates semantic outputs parsed from the target document. Ingest text on the left to review metrics.
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded bg-[#1F2833] border border-gray-700 text-blue-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white mb-0.5">Isolate Rhetoric</h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Extract high-intensity moral adjectives engineered to evoke rapid emotional responses.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded bg-[#1F2833] border border-gray-700 text-blue-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white mb-0.5">Expose Fallacies</h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Diagnose slippery slopes, ad-hominems, and false dilemma causal links lacking logical proof.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded bg-[#1F2833] border border-gray-700 text-blue-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white mb-0.5">Objective Scoring</h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Calculate overall content neutrality ratios dynamically utilizing the Gemini 1.5/3.5 standard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#12141D] border border-gray-800 rounded-lg text-gray-500 text-[10px] leading-relaxed mt-6">
                  <div className="flex gap-1.5 items-center font-bold text-gray-400 uppercase tracking-wider mb-1 font-mono">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    Objective Metric Spec
                  </div>
                  Our assessments evaluate grammatical structures exclusively. Scoring operates independent of political alignment or moral perspectives.
                </div>
              </div>
            )}
          </div>

          {/* Underneath footer log parameters from the mockup design */}
          <div className="p-4 border-t border-gray-800 bg-[#12141D] text-[10px] font-mono text-gray-500 flex justify-between items-center shrink-0">
            <span>Linguistic Hash: 0x82f..d2a</span>
            <span>API Time: {result ? "184ms" : "0ms"}</span>
            <span>Tokens: {result ? "142" : "0"}</span>
          </div>

        </aside>

      </main>

      {/* Footer bar */}
      <footer className="bg-[#12141D] border-t border-gray-800 py-4 text-center text-[10px] text-gray-500 px-6 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p>© 2026 Forensic Linguistics Research Lab. Managed via Google AI Studio Sandbox.</p>
        <div className="flex items-center gap-3 font-mono">
          <span className="hover:text-gray-300 cursor-pointer">Taxonomy Specifications</span>
          <span>•</span>
          <span className="hover:text-gray-300 cursor-pointer">Core Sandbox API</span>
        </div>
      </footer>

    </div>
  );
}
