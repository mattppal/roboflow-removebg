import React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import ImageProcessor from "@/components/ImageProcessor"

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ImageProcessor />
      </div>
    </ThemeProvider>
  )
}

export default App
