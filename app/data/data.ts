import { AnalysisType } from "@/types";
import {
  Brain,
  Hash,
  List,
  MessageCircle,
  MessageSquare,
  Shield,
  Sparkles,
  Upload,
  Users,
  Zap, // Added for a more "active" feel
  Lock,
} from "lucide-react";

export const features = [
  {
    icon: Zap, // Changed for more "energy"
    title: "Agentic Intelligence",
    description: "Move beyond summaries with Gemini 3.1—context-aware analysis that understands your goals.",
  },
  {
    icon: Shield, // Kept Shield, upgraded text
    title: "Isolated Tenancy",
    description: "Enterprise-grade data silos ensure your organization's documents remain strictly private.",
  },
  {
    icon: Upload,
    title: "Seamless Ingestion",
    description: "High-speed processing for PDF, Markdown, and Cloud docs with instant vector indexing.",
  },
  {
    icon: Lock, // Added Lock for trust
    title: "Zero-Knowledge Security",
    description: "Protected Vercel Blob storage with time-limited signed access for every file.",
  },
];

// Changed from string[] to object[] to support the more descriptive UI
export const steps = [
  { 
    title: "Onboard Team", 
    description: "Deploy your dedicated multi-tenant workspace in seconds." 
  },
  { 
    title: "Ingest Data", 
    description: "Upload local files or sync cloud directories securely." 
  },
  { 
    title: "Run Analysis", 
    description: "Choose from 5+ specialized AI workflows to extract value." 
  },
  { 
    title: "Action Insights", 
    description: "Export structured data or chat with your document base." 
  },
];

export const allowedTypes = [
  "text/plain",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/markdown",
  "text/x-markdown",
  "",
];

export const analysisTypes: {
  value: AnalysisType;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}[] = [
  {
    value: "summary",
    label: "Synthesis", // Sounds more sophisticated than "Summary"
    description: "Distill complex documents into high-level executive briefs.",
    icon: Sparkles,
  },
  {
    value: "qa",
    label: "Interrogation", // Sounds like a deeper AI dive
    description: "Ask your document anything and get cited, factual answers.",
    icon: MessageCircle,
  },
  {
    value: "sentiment",
    label: "Tone & Intent",
    description: "Detect emotional undertones and hidden risks in the text.",
    icon: MessageSquare,
  },
  {
    value: "entities",
    label: "Entity Map",
    description: "Identify and link people, organizations, and legal terms.",
    icon: Hash,
  },
  {
    value: "extract",
    label: "Structured Data",
    description: "Convert raw text into clean, production-ready JSON schemas.",
    icon: List,
  },
];

// Format file size (Kept exactly as is to ensure no logic breaks)
export const formatFileSize = (bytes?: number) => {
  if (!bytes) return "N/A";
  if (bytes < 1024) return bytes + " bytes";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};
