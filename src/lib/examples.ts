import { v4 as uuidv4 } from 'uuid'
import type { TableNode, RowData } from '../store/useStore'
import type { Edge } from '@xyflow/react'

export const getViveroExample = () => {
  const pId = uuidv4()
  const provId = uuidv4()
  const cId = uuidv4()

  const nodes: TableNode[] = [
    {
      id: pId, type: 'table', position: { x: 50, y: 50 },
      data: {
        id: pId, name: 'Planta',
        columns: [
          { id: uuidv4(), name: 'id', type: 'Integer', isPrimaryKey: true, isRequired: true },
          { id: uuidv4(), name: 'nombre_comun', type: 'Varchar', isPrimaryKey: false, isRequired: true },
          { id: uuidv4(), name: 'precio', type: 'Decimal', isPrimaryKey: false, isRequired: false },
        ]
      }
    },
    {
      id: provId, type: 'table', position: { x: 400, y: 50 },
      data: {
        id: provId, name: 'Proveedor',
        columns: [
          { id: uuidv4(), name: 'id_prov', type: 'Integer', isPrimaryKey: true, isRequired: true },
          { id: uuidv4(), name: 'razon_social', type: 'Varchar', isPrimaryKey: false, isRequired: true },
        ]
      }
    },
    {
      id: cId, type: 'table', position: { x: 225, y: 300 },
      data: {
        id: cId, name: 'Compra',
        columns: [
          { id: uuidv4(), name: 'id_compra', type: 'Integer', isPrimaryKey: true, isRequired: true },
          { id: uuidv4(), name: 'id_planta', type: 'Integer', isPrimaryKey: false, isRequired: true },
          { id: uuidv4(), name: 'id_proveedor', type: 'Integer', isPrimaryKey: false, isRequired: true },
          { id: uuidv4(), name: 'fecha', type: 'Date', isPrimaryKey: false, isRequired: true },
        ]
      }
    }
  ]

  const edges: Edge[] = [
    {
      id: uuidv4(), source: pId, target: cId,
      data: { sourceColumn: 'id', targetColumn: 'id_planta', cardinality: '1:N' }
    },
    {
      id: uuidv4(), source: provId, target: cId,
      data: { sourceColumn: 'id_prov', targetColumn: 'id_proveedor', cardinality: '1:N' }
    }
  ]

  const rows: RowData[] = [
    { id: uuidv4(), tableId: pId, data: { id: 1, nombre_comun: 'Rosa', precio: 12.5 } },
    { id: uuidv4(), tableId: pId, data: { id: 2, nombre_comun: 'Margarita', precio: 8.0 } },
    { id: uuidv4(), tableId: provId, data: { id_prov: 101, razon_social: 'Flores del Campo SA' } },
    { id: uuidv4(), tableId: cId, data: { id_compra: 1, id_planta: 1, id_proveedor: 101, fecha: '2023-10-01' } },
  ]

  return { nodes, edges, rows }
}

export const getUrbanoExample = () => {
  const pId = uuidv4()
  const eId = uuidv4()
  const iId = uuidv4()

  const nodes: TableNode[] = [
    {
      id: pId, type: 'table', position: { x: 50, y: 50 },
      data: {
        id: pId, name: 'Plaza',
        columns: [
          { id: uuidv4(), name: 'id_plaza', type: 'Integer', isPrimaryKey: true, isRequired: true },
          { id: uuidv4(), name: 'nombre', type: 'Varchar', isPrimaryKey: false, isRequired: true },
          { id: uuidv4(), name: 'superficie', type: 'Decimal', isPrimaryKey: false, isRequired: false },
        ]
      }
    },
    {
      id: eId, type: 'table', position: { x: 400, y: 50 },
      data: {
        id: eId, name: 'Especie',
        columns: [
          { id: uuidv4(), name: 'id_especie', type: 'Integer', isPrimaryKey: true, isRequired: true },
          { id: uuidv4(), name: 'nombre_cientifico', type: 'Varchar', isPrimaryKey: false, isRequired: true },
        ]
      }
    },
    {
      id: iId, type: 'table', position: { x: 225, y: 300 },
      data: {
        id: iId, name: 'Intervencion',
        columns: [
          { id: uuidv4(), name: 'id_intervencion', type: 'Integer', isPrimaryKey: true, isRequired: true },
          { id: uuidv4(), name: 'id_plaza', type: 'Integer', isPrimaryKey: false, isRequired: true },
          { id: uuidv4(), name: 'id_especie', type: 'Integer', isPrimaryKey: false, isRequired: true },
          { id: uuidv4(), name: 'fecha_poda', type: 'Date', isPrimaryKey: false, isRequired: true },
        ]
      }
    }
  ]

  const edges: Edge[] = [
    {
      id: uuidv4(), source: pId, target: iId,
      data: { sourceColumn: 'id_plaza', targetColumn: 'id_plaza', cardinality: '1:N' }
    },
    {
      id: uuidv4(), source: eId, target: iId,
      data: { sourceColumn: 'id_especie', targetColumn: 'id_especie', cardinality: '1:N' }
    }
  ]

  const rows: RowData[] = [
    { id: uuidv4(), tableId: pId, data: { id_plaza: 1, nombre: 'Plaza San Martin', superficie: 15000.5 } },
    { id: uuidv4(), tableId: eId, data: { id_especie: 10, nombre_cientifico: 'Jacaranda mimosifolia' } },
    { id: uuidv4(), tableId: iId, data: { id_intervencion: 100, id_plaza: 1, id_especie: 10, fecha_poda: '2023-11-15' } },
  ]

  return { nodes, edges, rows }
}
