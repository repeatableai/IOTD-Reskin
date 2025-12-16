import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { TrendingUp, ChevronLeft, ChevronRight, Filter, Clock, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Type for trend data from API
interface TrendData {
  keyword: string;
  timelineData: { date: string; value: number }[];
  averageValue: number;
  peakValue: number;
  peakDate: string;
  currentValue: number;
  growthRate: number;
}

// Generate sparkline data from API data or fallback
const generateSparklineData = (growth: number, data?: TrendData) => {
  // If we have fetched data, use it
  if (data?.timelineData && data.timelineData.length > 0) {
    return data.timelineData.map(d => d.value);
  }
  
  // Fallback (shouldn't happen often)
  const points = 12;
  const result = [];
  let value = 50;
  
  for (let i = 0; i < points; i++) {
    const trend = (growth / 100) * (i / points) * 30;
    value = Math.max(10, Math.min(100, value + trend / points));
    result.push(value);
  }
  
  return result;
};

// Simple SVG Sparkline Chart Component
const SparklineChart = ({ data, color = "#22c55e", height = 60 }: { data: number[], color?: string, height?: number }) => {
  const width = 200;
  const padding = 4;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;
  
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <polygon 
        points={areaPoints} 
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Trending topics data
export const TRENDING_TOPICS = [
  {
    id: "corporate-retreat-venues",
    title: "Corporate retreat venues",
    volume: "1.0K",
    volumeNum: 1000,
    growth: "+555%",
    growthNum: 555,
    color: "#8b5cf6",
    peakMonth: "November 2024",
    avgVolume: "850",
    yoyChange: "+412%",
    relatedSearches: ["team building retreats", "executive retreats", "corporate offsite venues"],
    description: "Corporate retreat venues refers to locations specifically designed to host company retreats, workshops, team-building exercises, and strategic planning sessions. These venues often provide a conducive environment away from the office, fostering creativity and collaboration among employees. In practice, organizations select venues based on amenities, capacity, and accessibility to accommodate various activities and enhance team dynamics. Often set in tranquil settings like resorts or conference centers, these retreats aim to strengthen relationships and boost morale. Key considerations include the venue's facilities, technology support, and potential for outdoor activities, which can significantly impact the retreat's effectiveness."
  },
  {
    id: "therapy-appointment",
    title: "Therapy appointment",
    volume: "27.1K",
    volumeNum: 27100,
    growth: "+234%",
    growthNum: 234,
    color: "#06b6d4",
    peakMonth: "January 2025",
    avgVolume: "22.4K",
    yoyChange: "+189%",
    relatedSearches: ["online therapy", "mental health counseling", "therapist near me"],
    description: "Therapy appointment refers to a scheduled session between a client and a mental health professional, such as a psychologist, therapist, or counselor, aimed at addressing psychological, emotional, or behavioral issues. These appointments provide a structured environment for individuals to discuss their concerns, explore solutions, and develop coping strategies. Typically occurring weekly or biweekly, therapy appointments can vary in format, including individual, group, or family therapy. Key considerations include confidentiality, the therapeutic relationship, and the need for a safe space conducive to open dialogue, which are crucial for effective treatment and personal growth."
  },
  {
    id: "market-intelligence-platform",
    title: "Market intelligence platform",
    volume: "1.3K",
    volumeNum: 1300,
    growth: "+125%",
    growthNum: 125,
    color: "#f59e0b",
    peakMonth: "December 2024",
    avgVolume: "1.1K",
    yoyChange: "+98%",
    relatedSearches: ["competitive intelligence tools", "market research software", "business intelligence"],
    description: "Market intelligence platform refers to a technology solution designed to collect, analyze, and interpret data related to market trends, consumer behavior, and competitive dynamics. These platforms enable businesses to make informed decisions by providing insights through data visualization, reporting, and predictive analytics. In practice, they are used for strategic planning, identifying opportunities, and optimizing marketing efforts. With the increasing complexity of markets and the abundance of data, these platforms have gained importance for ensuring organizations remain competitive. Key considerations include data accuracy, integration capabilities, and the need for user-friendly interfaces to facilitate effective decision-making."
  },
  {
    id: "nostalgia-marketing",
    title: "Nostalgia marketing",
    volume: "1.9K",
    volumeNum: 1900,
    growth: "+81%",
    growthNum: 81,
    color: "#ec4899",
    peakMonth: "October 2024",
    avgVolume: "1.5K",
    yoyChange: "+67%",
    relatedSearches: ["retro branding", "vintage advertising", "throwback campaigns"],
    description: "Nostalgia marketing refers to a strategy where brands evoke fond memories of the past to create emotional connections with consumers, aiming to enhance brand loyalty and drive sales. This approach involves reintroducing classic products, reviving retro designs, or referencing cultural touchstones that resonate with target audiences. For instance, companies like Coca-Cola and Nintendo have successfully re-released vintage products, blending nostalgia with modern appeal. Key considerations include ensuring authenticity, aligning with current trends, and understanding the emotional triggers of the intended demographic to effectively leverage the power of nostalgia."
  },
  {
    id: "llm-seo",
    title: "LLM SEO",
    volume: "720",
    volumeNum: 720,
    growth: "+28900%",
    growthNum: 28900,
    color: "#22c55e",
    peakMonth: "December 2024",
    avgVolume: "580",
    yoyChange: "+15000%",
    relatedSearches: ["AI search optimization", "ChatGPT SEO", "generative engine optimization"],
    description: "LLM SEO refers to the practice of optimizing digital content to enhance its visibility and relevance within large language models (LLMs) like ChatGPT, Google's Gemini, and Perplexity. This involves structuring information so that AI systems can effectively find, understand, and incorporate it into their responses, often referencing the original source. Unlike traditional SEO, which focuses on search engine rankings, LLM SEO emphasizes context, clarity, trustworthiness, and consistency to ensure content is accurately interpreted and utilized by AI models. Key strategies include using clear headings, factual statements, consistent branding, and conversational keywords to align with the evolving landscape of AI-driven information retrieval."
  },
  {
    id: "fraud-return-prevention",
    title: "Fraud return prevention",
    volume: "2.4K",
    volumeNum: 2400,
    growth: "+46%",
    growthNum: 46,
    color: "#ef4444",
    peakMonth: "January 2025",
    avgVolume: "2.1K",
    yoyChange: "+38%",
    relatedSearches: ["return fraud detection", "retail loss prevention", "refund abuse"],
    description: "Fraud return prevention refers to the systems and processes retailers implement to identify and prevent fraudulent return transactions. With return fraud costing retailers over $25 billion annually, businesses are increasingly adopting AI-powered solutions to detect patterns like wardrobing, receipt fraud, and organized retail crime. Modern solutions incorporate behavioral analytics, receipt verification, and customer purchase history to flag suspicious returns. Key implications include balancing fraud prevention with customer experience, as overly strict policies can alienate legitimate customers while insufficient measures lead to significant financial losses."
  },
  {
    id: "free-college-applications",
    title: "Free college applications",
    volume: "4.4K",
    volumeNum: 4400,
    growth: "+83%",
    growthNum: 83,
    color: "#3b82f6",
    peakMonth: "November 2024",
    avgVolume: "3.8K",
    yoyChange: "+71%",
    relatedSearches: ["college application fee waiver", "no fee college apps", "FAFSA"],
    description: "Free college applications refers to the process whereby prospective students can submit their applications to colleges and universities without incurring any fees. This initiative aims to reduce financial barriers, encouraging a more diverse range of applicants to pursue higher education. In practice, many institutions participate in programs that waive application fees during specific periods or for certain demographics, such as low-income students. The movement towards free applications is rooted in the broader effort to promote equitable access to education. Key implications include increased application rates and the necessity for colleges to evaluate the impact on their admissions processes."
  },
  {
    id: "telegram-secure-messaging",
    title: "Telegram secure messaging",
    volume: "2.9K",
    volumeNum: 2900,
    growth: "+125%",
    growthNum: 125,
    color: "#0ea5e9",
    peakMonth: "December 2024",
    avgVolume: "2.4K",
    yoyChange: "+105%",
    relatedSearches: ["encrypted messaging apps", "privacy messaging", "Signal vs Telegram"],
    description: "Telegram secure messaging refers to the privacy and encryption features implemented in the Telegram messaging app, which aims to protect users' communications from unauthorized access. It utilizes end-to-end encryption in its Secret Chats, ensuring that only the sender and receiver can read the messages. In practice, users can engage in secure conversations, share files, and create groups with enhanced privacy. The app's focus on security aligns with growing concerns over data privacy and surveillance. However, users should remain aware of the limitations of security measures in regular chats, as they do not employ end-to-end encryption."
  },
  {
    id: "puma-retro-sneakers",
    title: "Puma retro sneakers",
    volume: "9.9K",
    volumeNum: 9900,
    growth: "+516%",
    growthNum: 516,
    color: "#f97316",
    peakMonth: "November 2024",
    avgVolume: "7.2K",
    yoyChange: "+445%",
    relatedSearches: ["vintage Puma shoes", "Puma Suede classic", "retro sneakers 2024"],
    description: "Puma retro sneakers refers to a line of footwear produced by the Puma brand that draws inspiration from classic sneaker designs popular in previous decades, typically featuring vintage aesthetics and color schemes. These sneakers are used in practice as both casual fashion items and performance shoes, appealing to sneaker enthusiasts and style-conscious consumers. The resurgence of retro styles reflects broader trends in fashion, where nostalgia plays a significant role. Key considerations include their cultural significance, as they often evoke a sense of nostalgia, and their potential impact on contemporary sneaker culture and consumer behavior."
  },
  {
    id: "camping-equipment-rental",
    title: "Camping equipment rental",
    volume: "6.6K",
    volumeNum: 6600,
    growth: "+52%",
    growthNum: 52,
    color: "#84cc16",
    peakMonth: "June 2024",
    avgVolume: "5.8K",
    yoyChange: "+44%",
    relatedSearches: ["outdoor gear rental", "tent rental near me", "camping gear subscription"],
    description: "Camping equipment rental refers to the service of providing outdoor gear and supplies to individuals or groups for temporary use during camping trips. This typically includes tents, sleeping bags, cooking utensils, and other essential items. In practice, customers can rent equipment from specialized rental companies or outdoor retailers, often online or at physical locations. This service is particularly beneficial for infrequent campers who prefer not to invest in expensive gear. Key considerations include the quality and maintenance of the equipment, rental terms, and the availability of additional services like delivery or setup."
  },
  {
    id: "estate-planning-attorney-cost",
    title: "Estate planning attorney cost",
    volume: "3.6K",
    volumeNum: 3600,
    growth: "+817%",
    growthNum: 817,
    color: "#a855f7",
    peakMonth: "January 2025",
    avgVolume: "2.9K",
    yoyChange: "+678%",
    relatedSearches: ["will attorney fees", "trust lawyer cost", "estate planning prices"],
    description: "Estate planning attorney cost refers to the fees associated with hiring a legal professional to assist individuals in preparing their estate plans, which typically include wills, trusts, and other legal documents. These costs can vary widely based on factors such as the attorney's experience, the complexity of the estate, and the services provided. In practice, clients may encounter flat fees for specific services or hourly rates for consultations. Understanding these costs is crucial, as they can impact an individual's decision-making and overall estate planning strategy, highlighting the importance of budgeting for legal assistance in securing one's financial legacy."
  },
  {
    id: "ai-customer-service-automation",
    title: "AI customer service automation",
    volume: "12.8K",
    volumeNum: 12800,
    growth: "+342%",
    growthNum: 342,
    color: "#14b8a6",
    peakMonth: "December 2024",
    avgVolume: "10.5K",
    yoyChange: "+298%",
    relatedSearches: ["AI chatbot for support", "automated customer service", "conversational AI"],
    description: "AI customer service automation refers to the implementation of artificial intelligence technologies to handle customer inquiries, support tickets, and service interactions without human intervention. These systems utilize natural language processing, machine learning, and conversational AI to understand customer needs and provide relevant responses. In practice, businesses deploy chatbots, virtual assistants, and automated ticketing systems to reduce response times and operational costs. The growing adoption is driven by 24/7 availability expectations and labor cost pressures. Key considerations include maintaining service quality, handling complex escalations, and ensuring seamless handoffs to human agents when necessary."
  },
  {
    id: "remote-team-building",
    title: "Remote team building activities",
    volume: "8.2K",
    volumeNum: 8200,
    growth: "+189%",
    growthNum: 189,
    color: "#6366f1",
    peakMonth: "January 2025",
    avgVolume: "6.9K",
    yoyChange: "+156%",
    relatedSearches: ["virtual team games", "online team bonding", "remote work culture"],
    description: "Remote team building activities refers to organized events and exercises designed to foster connection, collaboration, and camaraderie among distributed team members who work from different locations. These activities range from virtual escape rooms and online trivia to collaborative workshops and digital social hours. With the rise of remote and hybrid work, organizations increasingly invest in these programs to combat isolation, maintain company culture, and improve team cohesion. Key considerations include timezone coordination, technology accessibility, and ensuring activities are inclusive and engaging for participants with varying preferences and abilities."
  },
  {
    id: "sustainable-packaging",
    title: "Sustainable packaging solutions",
    volume: "5.7K",
    volumeNum: 5700,
    growth: "+156%",
    growthNum: 156,
    color: "#10b981",
    peakMonth: "November 2024",
    avgVolume: "4.8K",
    yoyChange: "+134%",
    relatedSearches: ["eco-friendly packaging", "biodegradable materials", "plastic alternatives"],
    description: "Sustainable packaging solutions refers to the development and adoption of packaging materials and designs that minimize environmental impact throughout their lifecycle. This includes biodegradable materials, recyclable components, reduced packaging volume, and innovative alternatives to plastic. Driven by consumer demand and regulatory pressure, businesses across industries are transitioning to eco-friendly packaging to reduce carbon footprints and meet sustainability goals. Key considerations include material sourcing, cost implications, supply chain logistics, and ensuring packaging still provides adequate product protection while meeting environmental standards."
  },
  {
    id: "pet-subscription-boxes",
    title: "Pet subscription boxes",
    volume: "14.3K",
    volumeNum: 14300,
    growth: "+94%",
    growthNum: 94,
    color: "#f472b6",
    peakMonth: "December 2024",
    avgVolume: "12.1K",
    yoyChange: "+82%",
    relatedSearches: ["dog subscription box", "BarkBox alternatives", "monthly pet treats"],
    description: "Pet subscription boxes refers to recurring delivery services that provide curated selections of pet products including toys, treats, food, and accessories directly to pet owners' homes. These services cater to dogs, cats, and increasingly exotic pets, offering personalization based on pet size, dietary restrictions, and preferences. The market has grown significantly as pet humanization trends drive increased spending on pet products. Key considerations include product quality, customization options, delivery frequency flexibility, and the overall value proposition compared to retail purchasing."
  },
  {
    id: "digital-nomad-visa",
    title: "Digital nomad visa programs",
    volume: "3.2K",
    volumeNum: 3200,
    growth: "+478%",
    growthNum: 478,
    color: "#0891b2",
    peakMonth: "January 2025",
    avgVolume: "2.6K",
    yoyChange: "+398%",
    relatedSearches: ["remote work visa", "work abroad legally", "best countries for nomads"],
    description: "Digital nomad visa programs refers to special visa categories offered by countries to attract remote workers who wish to live and work within their borders while employed by companies or clients outside the country. These programs typically offer extended stays of 6-24 months, tax incentives, and streamlined application processes. Countries like Portugal, Estonia, and Costa Rica have pioneered these programs to boost local economies and attract high-income visitors. Key considerations include tax implications, healthcare access, cost of living, and the specific requirements and benefits each country's program offers."
  },
  {
    id: "micro-mobility-services",
    title: "Micro-mobility services",
    volume: "4.8K",
    volumeNum: 4800,
    growth: "+223%",
    growthNum: 223,
    color: "#eab308",
    peakMonth: "September 2024",
    avgVolume: "4.1K",
    yoyChange: "+189%",
    relatedSearches: ["electric scooter rental", "e-bike sharing", "last mile transportation"],
    description: "Micro-mobility services refers to shared transportation solutions using lightweight vehicles like electric scooters, e-bikes, and electric skateboards for short-distance urban travel. These services are typically accessed through smartphone apps and offer pay-per-ride or subscription models. The sector has grown rapidly as cities seek to reduce traffic congestion and carbon emissions while providing last-mile transportation solutions. Key considerations include safety regulations, parking infrastructure, vehicle maintenance, and integration with existing public transportation systems."
  },
  {
    id: "sleep-optimization-tech",
    title: "Sleep optimization technology",
    volume: "7.4K",
    volumeNum: 7400,
    growth: "+267%",
    growthNum: 267,
    color: "#8b5cf6",
    peakMonth: "January 2025",
    avgVolume: "6.2K",
    yoyChange: "+234%",
    relatedSearches: ["sleep tracker app", "smart mattress", "sleep quality improvement"],
    description: "Sleep optimization technology refers to devices, apps, and systems designed to monitor, analyze, and improve sleep quality and duration. This includes smart mattresses, sleep tracking wearables, white noise machines, smart lighting, and AI-powered coaching apps. Growing awareness of sleep's impact on health, productivity, and longevity drives consumer interest. The market spans consumer wellness products to clinical-grade monitoring systems. Key considerations include data accuracy, privacy concerns, actionable insights versus mere tracking, and the scientific validity of recommendations provided by these technologies."
  }
];

export default function Trends() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("recent");
  const [filters, setFilters] = useState({
    highGrowth: false,
    highVolume: false,
  });
  const [trendData, setTrendData] = useState<Record<string, TrendData>>({});
  const [loadingTrends, setLoadingTrends] = useState<Set<string>>(new Set());

  const rowsPerPage = 9; // 3x3 grid

  // Fetch trend data for visible trends
  const fetchTrendData = async (keyword: string, trendId: string, growthNum: number) => {
    if (trendData[trendId] || loadingTrends.has(trendId)) return;
    
    setLoadingTrends(prev => new Set(prev).add(trendId));
    
    try {
      const response = await fetch(`/api/google-trends/keyword?keyword=${encodeURIComponent(keyword)}&growth=${growthNum}`);
      if (response.ok) {
        const data = await response.json();
        setTrendData(prev => ({ ...prev, [trendId]: data }));
      }
    } catch (error) {
      console.error(`Failed to fetch trend data for ${keyword}:`, error);
    } finally {
      setLoadingTrends(prev => {
        const next = new Set(prev);
        next.delete(trendId);
        return next;
      });
    }
  };

  // Fetch data for visible trends on page change
  useEffect(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const visibleTrends = TRENDING_TOPICS.slice(startIndex, startIndex + rowsPerPage);
    
    // Fetch all visible trends (no need for staggering with generated data)
    visibleTrends.forEach((trend) => {
      fetchTrendData(trend.title, trend.id, trend.growthNum);
    });
  }, [currentPage]);

  // Filter and sort trends
  let filteredTrends = TRENDING_TOPICS.filter(trend =>
    trend.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trend.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply filters
  if (filters.highGrowth) {
    filteredTrends = filteredTrends.filter(t => t.growthNum >= 200);
  }
  if (filters.highVolume) {
    filteredTrends = filteredTrends.filter(t => t.volumeNum >= 5000);
  }

  // Sort
  const sortedTrends = [...filteredTrends].sort((a, b) => {
    switch (sortBy) {
      case "growth":
        return b.growthNum - a.growthNum;
      case "volume":
        return b.volumeNum - a.volumeNum;
      case "alphabetical":
        return a.title.localeCompare(b.title);
      default: // recent
        return 0;
    }
  });

  // Pagination
  const totalResults = sortedTrends.length;
  const totalPages = Math.ceil(totalResults / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedTrends = sortedTrends.slice(startIndex, startIndex + rowsPerPage);

  const getGrowthColor = (growth: number) => {
    if (growth >= 500) return "text-green-600";
    if (growth >= 100) return "text-green-500";
    if (growth >= 50) return "text-emerald-500";
    return "text-teal-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trends</h1>
          <p className="text-lg text-muted-foreground">
            Discover emerging trends and opportunities
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <Clock className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Most Recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="growth">Highest Growth</SelectItem>
              <SelectItem value="volume">Highest Volume</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                All Filters
                {(filters.highGrowth || filters.highVolume) && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {(filters.highGrowth ? 1 : 0) + (filters.highVolume ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuCheckboxItem
                checked={filters.highGrowth}
                onCheckedChange={(checked) => setFilters(f => ({ ...f, highGrowth: checked }))}
              >
                High Growth (200%+)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.highVolume}
                onCheckedChange={(checked) => setFilters(f => ({ ...f, highVolume: checked }))}
              >
                High Volume (5K+)
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search trends..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* 3x3 Grid of Chart Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedTrends.map((trend) => {
            const data = trendData[trend.id];
            const isLoading = loadingTrends.has(trend.id);
            const sparklineData = generateSparklineData(trend.growthNum, data);
            
            // Use fetched data if available
            const displayGrowth = data ? `${data.growthRate >= 0 ? '+' : ''}${data.growthRate}%` : trend.growth;
            const displayGrowthNum = data ? data.growthRate : trend.growthNum;
            
            return (
              <Link key={trend.id} href={`/trend/${trend.id}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50 h-full">
                  <CardContent className="p-5">
                    {/* Title with loading indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg line-clamp-1">{trend.title}</h3>
                      {isLoading && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Chart */}
                    <div className="mb-4 -mx-2">
                      <SparklineChart data={sparklineData} color={trend.color} height={80} />
                    </div>
                    
                    {/* Stats Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{trend.volume}</span>
                        <span className="text-xs text-muted-foreground">volume</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`w-4 h-4 ${getGrowthColor(displayGrowthNum)}`} />
                        <span className={`text-sm font-bold ${getGrowthColor(displayGrowthNum)}`}>
                          {displayGrowth}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t pt-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              <ChevronLeft className="w-4 h-4 -ml-2" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
              <ChevronRight className="w-4 h-4 -ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
