import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Loader2 } from "lucide-react";

const SECTORS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Manufacturing",
  "Energy",
  "Media",
  "Education",
  "Real Estate",
  "Transportation",
  "Defense",
  "Other",
];

interface ScannerInputFormProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  sector: string;
  setSector: (value: string) => void;
  customSector: string;
  setCustomSector: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function ScannerInputForm({
  companyName,
  setCompanyName,
  sector,
  setSector,
  customSector,
  setCustomSector,
  description,
  setDescription,
  onSubmit,
  isLoading,
}: ScannerInputFormProps) {
  return (
    <div className="space-y-6 py-4">
      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-[#1B2A4A] font-semibold">
          Company / Solution Name
        </Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter company or solution name"
          className="border-[#1B2A4A]/20 focus:border-[#C5985E] focus:ring-[#C5985E]"
        />
      </div>

      {/* Sector */}
      <div className="space-y-2">
        <Label htmlFor="sector" className="text-[#1B2A4A] font-semibold">
          Sector
        </Label>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="border-[#1B2A4A]/20 focus:border-[#C5985E] focus:ring-[#C5985E]">
            <SelectValue placeholder="Select sector" />
          </SelectTrigger>
          <SelectContent>
            {SECTORS.map((s) => (
              <SelectItem key={s} value={s.toLowerCase()}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sector === 'other' && (
          <Input
            id="customSector"
            value={customSector}
            onChange={(e) => setCustomSector(e.target.value)}
            placeholder="Enter your sector"
            className="mt-2 border-[#1B2A4A]/20 focus:border-[#C5985E] focus:ring-[#C5985E]"
          />
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-[#1B2A4A] font-semibold">
          Description (Optional)
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the business or solution..."
          rows={4}
          className="border-[#1B2A4A]/20 focus:border-[#C5985E] focus:ring-[#C5985E] resize-none"
        />
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-br from-[#1B2A4A] to-[#1B2A4A]/90 rounded-lg p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-[#C5985E] rounded-full animate-pulse" />
          <h4 className="font-semibold text-sm">
            Powered by Claude Opus — Maximum Depth
          </h4>
        </div>
        <ul className="text-sm text-white/80 space-y-1.5 mb-3">
          <li className="flex items-center gap-2">
            <span className="text-[#C5985E]">01</span> AI Disruption Risk Score (0-100)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#C5985E]">02</span> 5-Vector Vulnerability Analysis with Named Threats
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#C5985E]">03</span> Helfert 5-Pillar Moat Durability Assessment
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#C5985E]">04</span> 3-Scenario Margin Compression Model
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#C5985E]">05</span> Expert Panel: Damodaran, Gurley, Thiel, Kahneman, McGrath
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#C5985E]">06</span> Torpedo Premortem — Failure Mode Analysis
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#C5985E]">07</span> Priority-Weighted Strategic Action Plan
          </li>
        </ul>
      </div>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={isLoading || !companyName.trim() || !sector || (sector === 'other' && !customSector.trim())}
        className="w-full bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5 mr-2" />
            Run AI Disruption Scan
          </>
        )}
      </Button>
    </div>
  );
}
