import { useState, useEffect, useRef } from "react"
import { FlowCanvas } from "./components/FlowCanvas"
import { Sidebar } from "./components/Sidebar"
import { DataPanel } from "./components/DataPanel"
import { PanelLeftClose, PanelLeft, PanelBottomClose, PanelBottom, Download, Upload } from "lucide-react"
import { useStore } from "./store/useStore"

function App() {
  const [showSidebar, setShowSidebar] = useState(true)
  const [showDataPanel, setShowDataPanel] = useState(true)
  const [panelHeight, setPanelHeight] = useState(320)
  const [isResizing, setIsResizing] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    let filename = window.prompt("Nombre del archivo de exportación:", "edudb_export")
    if (filename === null) return // User cancelled
    
    filename = filename.trim()
    if (filename === "") filename = "edudb_export"
    const finalFilename = filename.endsWith(".json") ? filename : `${filename}.json`

    const state = useStore.getState()
    const data = {
      nodes: state.nodes,
      edges: state.edges,
      rows: state.rows
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = finalFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const result = event.target?.result
        if (typeof result === 'string') {
          const data = JSON.parse(result)
          const state = useStore.getState()
          state.loadSchema(data.nodes || [], data.edges || [], data.rows || [])
        }
      } catch (err) {
        console.error("Error importing JSON:", err)
        alert("El archivo no es válido o está corrupto.")
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      // Calculate new height from bottom
      const newHeight = window.innerHeight - e.clientY
      // Constrain it explicitly so it doesn't break the layout completely
      if (newHeight > 100 && newHeight < window.innerHeight - 100) {
        setPanelHeight(newHeight)
      }
    }
    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

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
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImport} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors flex items-center gap-1.5 text-sm"
              title="Importar base de datos"
            >
              <Upload size={18} />
              <span className="hidden sm:inline">Importar</span>
            </button>
            <button 
              onClick={handleExport} 
              className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors flex items-center gap-1.5 text-sm"
              title="Exportar base de datos"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <div className="w-px h-6 bg-border mx-1"></div>
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
        
        {showDataPanel && (
          <div 
            className="h-1.5 w-full bg-border hover:bg-primary/50 cursor-ns-resize transition-colors shrink-0 z-30 relative group flex items-center justify-center"
            onMouseDown={() => setIsResizing(true)}
            title="Arrastrar para redimensionar el panel"
          >
             <div className="w-12 h-0.5 bg-muted-foreground/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        )}
        <div 
          className={`transition-[height] duration-75 overflow-hidden flex flex-col ${showDataPanel ? '' : 'hidden'}`}
          style={{ height: showDataPanel ? `${panelHeight}px` : '0px' }}
        >
          <DataPanel />
        </div>
      </div>
    </div>
  )
}

export default App
