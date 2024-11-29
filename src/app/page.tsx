import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  SplitSquareHorizontal,
  Boxes,
  Search,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/app/components/header";
import { Footer } from "./components/footer"

// Arrow component
const Arrow = () => (
  <div className="hidden lg:flex items-center justify-center">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="text-primary/30"
    >
      <path
        d="M0 12H22.5M22.5 12L16.5 6M22.5 12L16.5 18"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  </div>
);

// FeatureCard component
const FeatureCard = ({ feature }: { feature: (typeof features)[0] }) => (
  <div className="group relative overflow-hidden rounded-2xl border bg-background h-[230px] p-6 transition-all hover:shadow-lg">
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
    <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
      {feature.icon}
    </div>
    <h3 className="mb-3 text-lg font-bold">{feature.title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-4">
      {feature.description}
    </p>
  </div>
);

const features = [
  {
    title: "Text Splitting",
    description:
      "Visualize how documents are split into meaningful chunks while preserving semantic coherence and context",
    icon: <SplitSquareHorizontal className="h-6 w-6 text-primary" />,
  },
  {
    title: "Vector Embedding",
    description: 
      "See how text is transformed into numerical vectors and visualize their relationships in high-dimensional space",
    icon: <Boxes className="h-6 w-6 text-primary" />,
  },
  {
    title: "Semantic Search",
    description: 
      "Experience real-time vector similarity search and understand how relevant context is retrieved from your knowledge base",
    icon: <Search className="h-6 w-6 text-primary" />,
  },
  {
    title: "Context Generation",
    description: 
      "Watch how the LLM combines retrieved context with user queries to generate accurate, contextual responses",
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-32 pb-20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50 dark:from-blue-950/30 dark:to-indigo-950/30" />
            <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          </div>
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Interactive RAG Playground
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                Debug, visualize, and master Retrieval-Augmented Generation through hands-on experiments and real-time demonstrations
              </p>
            </div>
            <div className="flex space-x-4">
              <Button size="lg" className="h-12 px-8 group" asChild>
                <Link href="/experiment">
                  Start Experiment
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
            <div className="w-[280px] shrink-0">
              <FeatureCard feature={features[0]} />
            </div>
            <Arrow />
            <div className="w-[280px] shrink-0">
              <FeatureCard feature={features[1]} />
            </div>
            <Arrow />
            <div className="w-[280px] shrink-0">
              <FeatureCard feature={features[2]} />
            </div>
            <Arrow />
            <div className="w-[280px] shrink-0">
              <FeatureCard feature={features[3]} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
