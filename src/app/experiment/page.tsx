import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"
import { ExperimentContent } from "./components/experiment-content"

export default function ExperimentPage() {
  return (
    <>
      <Header />
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-20">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">RAG Playground</h1>
            <p className="text-muted-foreground">
              Explore each step of the RAG pipeline through interactive visualizations
            </p>
          </div>
          <ExperimentContent />
        </div>
      </main>
      <Footer />
    </>
  )
} 