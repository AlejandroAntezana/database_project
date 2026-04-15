import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Trash2, Plus, TerminalSquare, MessageSquareText } from 'lucide-react'
import type { DataType } from '../store/useStore'

export function QueryBuilder() {
  const nodes = useStore(state => state.nodes)
  const selectedQueryTable = useStore(state => state.selectedQueryTable)
  const queryConditions = useStore(state => state.queryConditions)
  const logicalOperator = useStore(state => state.logicalOperator)
  const querySorts = useStore(state => state.querySorts)
  
  const setQueryTable = useStore(state => state.setQueryTable)
  const addQueryCondition = useStore(state => state.addQueryCondition)
  const updateQueryCondition = useStore(state => state.updateQueryCondition)
  const removeQueryCondition = useStore(state => state.removeQueryCondition)
  const setLogicalOperator = useStore(state => state.setLogicalOperator)
  const addQuerySort = useStore(state => state.addQuerySort)
  const updateQuerySort = useStore(state => state.updateQuerySort)
  const removeQuerySort = useStore(state => state.removeQuerySort)

  const selectedTableData = useMemo(() => {
    return nodes.find(n => n.id === selectedQueryTable)?.data as any
  }, [nodes, selectedQueryTable])

  const tableCols = selectedTableData?.columns || []

  const getOpOptions = (colName: string) => {
    const col = tableCols.find((c: any) => c.name === colName)
    if (!col) return []
    const t = col.type as DataType
    if (t === 'Boolean') return [{ val: 'IS_TRUE', label: 'Es verdadero' }, { val: 'IS_FALSE', label: 'Es falso' }]
    if (t === 'Varchar') return [{ val: '=', label: 'Es igual a' }, { val: 'CONTAINS', label: 'Contiene' }]
    return [{ val: '=', label: 'Es igual a' }, { val: '>', label: 'Es mayor a' }, { val: '<', label: 'Es menor a' }]
  }

  const sqlTranslation = useMemo(() => {
    if (!selectedTableData) return "Selecciona una tabla..."
    let sql = `SELECT * FROM ${selectedTableData.name}`
    
    if (queryConditions.length > 0) {
      const conds = queryConditions.map(c => {
        if (!c.column || !c.operator) return '...'
        const colType = tableCols.find((col: any) => col.name === c.column)?.type
        let valStr = String(c.value || '')
        if (colType === 'Varchar' || colType === 'Date') valStr = `'${valStr}'`
        
        if (c.operator === 'IS_TRUE') return `${c.column} = true`
        if (c.operator === 'IS_FALSE') return `${c.column} = false`
        if (c.operator === 'CONTAINS') return `${c.column} LIKE '%${c.value}%'`
        return `${c.column} ${c.operator} ${valStr}`
      })
      sql += `\nWHERE \n  ${conds.join(` \n  ${logicalOperator} `)}`
    }
    
    if (querySorts.length > 0) {
      const sorts = querySorts.map(s => `${s.column} ${s.direction}`)
      sql += `\nORDER BY ${sorts.join(', ')}`
    }
    
    return sql + ";"
  }, [selectedTableData, queryConditions, logicalOperator, querySorts, tableCols])

  const naturalTranslation = useMemo(() => {
    if (!selectedTableData) return "Selecciona una tabla para empezar."
    let text = `Buscar en la tabla "${selectedTableData.name}"`
    
    if (queryConditions.length > 0) {
      const conds = queryConditions.map(c => {
        if (!c.column || !c.operator) return '...'
        const opLabel = getOpOptions(c.column).find(o => o.val === c.operator)?.label?.toLowerCase() || ''
        if (c.operator === 'IS_TRUE' || c.operator === 'IS_FALSE') {
           return `[${c.column}] ${opLabel}`
        }
        return `[${c.column}] ${opLabel} "${c.value || ''}"`
      })
      text += ` donde se cumpla ${logicalOperator === 'AND' ? 'TODA' : 'ALGUNA'} de estas condiciones:\n - ` + conds.join(`\n - `)
    }
    
    if (querySorts.length > 0) {
      const sorts = querySorts.map(s => `[${s.column}] ordenado de ${s.direction === 'ASC' ? 'menor a mayor' : 'mayor a menor'}`)
      text += `\nOrdenado por: ` + sorts.join(', ')
    }
    
    return text
  }, [selectedTableData, queryConditions, logicalOperator, querySorts, tableCols])

  return (
    <div className="flex flex-col h-full bg-muted/10 overflow-hidden">
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-6">
        
        {/* Table Selector */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">1. Seleccionar Tabla (FROM)</label>
          <select 
            className="w-full bg-background border border-input rounded p-2 text-sm font-semibold"
            value={selectedQueryTable || ''}
            onChange={(e) => setQueryTable(e.target.value)}
          >
            <option value="">-- Tabla --</option>
            {nodes.map(n => <option key={n.id} value={n.id}>{(n.data as any).name}</option>)}
          </select>
        </div>

        {selectedTableData && (
          <>
            {/* Filters (WHERE) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">2. Filtros (WHERE)</label>
                 <Button variant="outline" size="sm" onClick={() => addQueryCondition({ column: '', operator: '', value: '' })} className="h-7 text-xs">
                    <Plus size={12} className="mr-1" /> Añadir Condición
                 </Button>
              </div>

              {queryConditions.length > 1 && (
                <div className="flex items-center gap-2 mb-3 bg-indigo-50 dark:bg-indigo-950 p-2 rounded-md border border-indigo-100 dark:border-indigo-900 w-fit">
                   <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">Unir con:</span>
                   <select 
                      className="text-xs bg-background border rounded px-2 py-1 font-bold text-indigo-700 mx-2"
                      value={logicalOperator}
                      onChange={(e) => setLogicalOperator(e.target.value as 'AND' | 'OR')}
                   >
                     <option value="AND">Y (Se cumplen TODAS)</option>
                     <option value="OR">O (Se cumple ALGUNA)</option>
                   </select>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {queryConditions.length === 0 && (
                  <div className="text-xs text-muted-foreground p-3 bg-background border border-dashed rounded text-center">Sin filtros (trae todos los registros)</div>
                )}
                {queryConditions.map((c) => {
                  const opts = getOpOptions(c.column)
                  const isBooleanOp = c.operator === 'IS_TRUE' || c.operator === 'IS_FALSE'
                  
                  return (
                    <div key={c.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-background p-2 border rounded-md shadow-sm">
                      <select 
                        className="flex-1 min-w-[120px] bg-muted/50 border rounded p-1.5 text-xs text-foreground"
                        value={c.column}
                        onChange={(e) => {
                            // Clear operator and value when changing column
                            updateQueryCondition(c.id, { column: e.target.value, operator: '', value: '' })
                        }}
                      >
                        <option value="">-- Columna --</option>
                        {tableCols.map((col: any) => <option key={col.id} value={col.name}>{col.name}</option>)}
                      </select>

                      <select 
                        className="flex-1 min-w-[120px] bg-muted/50 border rounded p-1.5 text-xs text-foreground"
                        value={c.operator}
                        onChange={(e) => updateQueryCondition(c.id, { operator: e.target.value })}
                        disabled={!c.column}
                      >
                        <option value="">-- Operador --</option>
                        {opts.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                      </select>

                      {!isBooleanOp && (
                        <Input 
                          placeholder="Valor..."
                          value={String(c.value) || ''}
                          onChange={(e) => updateQueryCondition(c.id, { value: e.target.value })}
                          disabled={!c.operator}
                          className="flex-1 min-w-[120px] h-8 text-xs bg-muted/50"
                        />
                      )}

                      <Button variant="ghost" size="icon" onClick={() => removeQueryCondition(c.id)} className="h-8 w-8 text-destructive shrink-0">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sorter (ORDER BY) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">3. Ordenamiento (ORDER BY)</label>
                 <Button variant="outline" size="sm" onClick={() => addQuerySort({ column: '', direction: 'ASC' })} className="h-7 text-xs">
                    <Plus size={12} className="mr-1" /> Añadir Ordenamiento
                 </Button>
              </div>

              <div className="flex flex-col gap-2">
                {querySorts.length === 0 && (
                  <div className="text-xs text-muted-foreground p-3 bg-background border border-dashed rounded text-center">Sin orden específico</div>
                )}
                {querySorts.map((sort, index) => {
                  return (
                    <div key={index} className="flex items-center gap-2 bg-background p-2 border rounded-md shadow-sm">
                      <select 
                        className="flex-1 bg-muted/50 border rounded p-1.5 text-xs text-foreground"
                        value={sort.column}
                        onChange={(e) => updateQuerySort(index, { ...sort, column: e.target.value })}
                      >
                        <option value="">-- Columna --</option>
                        {tableCols.map((col: any) => <option key={col.id} value={col.name}>{col.name}</option>)}
                      </select>

                      <select 
                        className="w-32 bg-muted/50 border rounded p-1.5 text-xs font-semibold text-foreground"
                        value={sort.direction}
                        onChange={(e) => updateQuerySort(index, { ...sort, direction: e.target.value as 'ASC'|'DESC' })}
                      >
                        <option value="ASC">Ascendente</option>
                        <option value="DESC">Descendente</option>
                      </select>

                      <Button variant="ghost" size="icon" onClick={() => removeQuerySort(index)} className="h-8 w-8 text-destructive shrink-0">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

      </div>

      {/* Translations Output Section */}
      <div className="shrink-0 border-t bg-card grid grid-cols-1 md:grid-cols-2">
          <div className="p-3 border-b md:border-b-0 md:border-r border-border/50">
             <h4 className="text-[10px] uppercase font-bold text-indigo-500 mb-2 flex items-center gap-1"><TerminalSquare size={12}/> SQL Generado</h4>
             <pre className="text-[10px] font-mono text-indigo-200 bg-indigo-950 p-2 rounded w-full overflow-x-auto whitespace-pre-wrap leading-relaxed">{sqlTranslation}</pre>
          </div>
          <div className="p-3">
             <h4 className="text-[10px] uppercase font-bold text-emerald-500 mb-2 flex items-center gap-1"><MessageSquareText size={12}/> Lenguaje Natural</h4>
             <div className="text-xs text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950 p-2 rounded min-h-[50px] leading-relaxed whitespace-pre-wrap">
               {naturalTranslation}
             </div>
          </div>
      </div>
    </div>
  )
}
