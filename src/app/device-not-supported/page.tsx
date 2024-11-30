import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"

export default function DeviceNotSupportedPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-center">Mobile Device Not Supported</h1>
          <p className="text-muted-foreground max-w-md text-center">
            RAG Playground is currently only available on desktop devices. Please switch to a desktop device for the best experience.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
} 