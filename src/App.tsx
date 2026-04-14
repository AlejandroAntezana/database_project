import { useState } from "react"
import { FlowCanvas } from "./components/FlowCanvas"
import { Sidebar } from "./components/Sidebar"
import { DataPanel } from "./components/DataPanel"
import { PanelLeftClose, PanelLeft, PanelBottomClose, PanelBottom } from "lucide-react"

function App() {
  const [showSidebar, setShowSidebar] = useState(true)
  const [showDataPanel, setShowDataPanel] = useState(true)

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      <div className={`${showSidebar ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden shrink-0 border-r border-border backdrop-blur-md bg-card/90 flex flex-col`}>
        <Sidebar className="w-72" />
      </div>
      
      <div className="flex flex-col flex-1 relative min-w-0">
        <header className="h-14 border-b bg-card flex items-center px-6 shadow-sm z-10 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              db
            </div>
            <h1 className="font-semibold text-lg text-foreground tracking-tight">EduDB Visualizer</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSidebar(!showSidebar)} 
              className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors"
              title={showSidebar ? "Ocultar panel lateral" : "Mostrar panel lateral"}
            >
              {showSidebar ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>
            <button 
              onClick={() => setShowDataPanel(!showDataPanel)} 
              className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors"
              title={showDataPanel ? "Ocultar panel inferior" : "Mostrar panel inferior"}
            >
              {showDataPanel ? <PanelBottomClose size={20} /> : <PanelBottom size={20} />}
            </button>
          </div>
        </header>
        <main className="flex-1 relative bg-muted/20">
          <FlowCanvas />
        </main>
        
        <div className={`transition-all duration-300 overflow-hidden ${showDataPanel ? 'h-80' : 'h-0'}`}>
          <DataPanel />
        </div>
      </div>
    </div>
  )
}

export default App
