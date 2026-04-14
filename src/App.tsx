import { FlowCanvas } from "./components/FlowCanvas"
import { Sidebar } from "./components/Sidebar"
import { DataPanel } from "./components/DataPanel"

function App() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 relative">
        <header className="h-14 border-b bg-card flex items-center px-6 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              db
            </div>
            <h1 className="font-semibold text-lg text-foreground tracking-tight">EduDB Visualizer</h1>
          </div>
        </header>
        <main className="flex-1 relative bg-muted/20">
          <FlowCanvas />
        </main>
        <DataPanel />
      </div>
    </div>
  )
}

export default App
