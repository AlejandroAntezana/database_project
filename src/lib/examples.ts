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
    { id: uuidv4(), tableId: pId, data: { id: 3, nombre_comun: 'Girasol', precio: 15.0 } },
    { id: uuidv4(), tableId: pId, data: { id: 4, nombre_comun: 'Tulipán', precio: 20.0 } },
    { id: uuidv4(), tableId: pId, data: { id: 5, nombre_comun: 'Orquídea', precio: 45.0 } },
    { id: uuidv4(), tableId: pId, data: { id: 6, nombre_comun: 'Cactus', precio: 10.0 } },
    { id: uuidv4(), tableId: pId, data: { id: 7, nombre_comun: 'Helecho', precio: 18.0 } },
    { id: uuidv4(), tableId: pId, data: { id: 8, nombre_comun: 'Bonsái', precio: 85.0 } },
    { id: uuidv4(), tableId: pId, data: { id: 9, nombre_comun: 'Palmera', precio: 120.0 } },
    { id: uuidv4(), tableId: pId, data: { id: 10, nombre_comun: 'Jazmín', precio: 25.0 } },

    { id: uuidv4(), tableId: provId, data: { id_prov: 101, razon_social: 'Flores del Campo SA' } },
    { id: uuidv4(), tableId: provId, data: { id_prov: 102, razon_social: 'Semillas y Más' } },
    { id: uuidv4(), tableId: provId, data: { id_prov: 103, razon_social: 'Verde Esperanza SRL' } },
    { id: uuidv4(), tableId: provId, data: { id_prov: 104, razon_social: 'Vivero La Paz' } },
    { id: uuidv4(), tableId: provId, data: { id_prov: 105, razon_social: 'Plantas Exóticas' } },
    { id: uuidv4(), tableId: provId, data: { id_prov: 106, razon_social: 'Cultivos del Sur' } },
    { id: uuidv4(), tableId: provId, data: { id_prov: 107, razon_social: 'Vivero El Roble' } },
    { id: uuidv4(), tableId: provId, data: { id_prov: 108, razon_social: 'Agro Plantas' } },
    { id: uuidv4(), tableId: provId, data: { id_prov: 109, razon_social: 'Naturaleza Viva' } },
    { id: uuidv4(), tableId: provId, data: { id_prov: 110, razon_social: 'Tierra Fértil' } },

    { id: uuidv4(), tableId: cId, data: { id_compra: 1, id_planta: 1, id_proveedor: 101, fecha: '2023-10-01' } },
    { id: uuidv4(), tableId: cId, data: { id_compra: 2, id_planta: 2, id_proveedor: 102, fecha: '2023-10-02' } },
    { id: uuidv4(), tableId: cId, data: { id_compra: 3, id_planta: 3, id_proveedor: 103, fecha: '2023-10-03' } },
    { id: uuidv4(), tableId: cId, data: { id_compra: 4, id_planta: 4, id_proveedor: 104, fecha: '2023-10-04' } },
    { id: uuidv4(), tableId: cId, data: { id_compra: 5, id_planta: 5, id_proveedor: 105, fecha: '2023-10-05' } },
    { id: uuidv4(), tableId: cId, data: { id_compra: 6, id_planta: 6, id_proveedor: 106, fecha: '2023-10-06' } },
    { id: uuidv4(), tableId: cId, data: { id_compra: 7, id_planta: 7, id_proveedor: 107, fecha: '2023-10-07' } },
    { id: uuidv4(), tableId: cId, data: { id_compra: 8, id_planta: 8, id_proveedor: 108, fecha: '2023-10-08' } },
    { id: uuidv4(), tableId: cId, data: { id_compra: 9, id_planta: 9, id_proveedor: 109, fecha: '2023-10-09' } },
    { id: uuidv4(), tableId: cId, data: { id_compra: 10, id_planta: 10, id_proveedor: 110, fecha: '2023-10-10' } },
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
    { id: uuidv4(), tableId: pId, data: { id_plaza: 2, nombre: 'Plaza de Mayo', superficie: 20000.0 } },
    { id: uuidv4(), tableId: pId, data: { id_plaza: 3, nombre: 'Parque Centenario', superficie: 25000.5 } },
    { id: uuidv4(), tableId: pId, data: { id_plaza: 4, nombre: 'Plaza Miserere', superficie: 18000.0 } },
    { id: uuidv4(), tableId: pId, data: { id_plaza: 5, nombre: 'Parque Lezama', superficie: 22000.5 } },
    { id: uuidv4(), tableId: pId, data: { id_plaza: 6, nombre: 'Plaza Italia', superficie: 16000.0 } },
    { id: uuidv4(), tableId: pId, data: { id_plaza: 7, nombre: 'Plaza Francia', superficie: 19000.5 } },
    { id: uuidv4(), tableId: pId, data: { id_plaza: 8, nombre: 'Parque Chacabuco', superficie: 30000.0 } },
    { id: uuidv4(), tableId: pId, data: { id_plaza: 9, nombre: 'Parque Patricios', superficie: 28000.5 } },
    { id: uuidv4(), tableId: pId, data: { id_plaza: 10, nombre: 'Parque Rivadavia', superficie: 14000.0 } },

    { id: uuidv4(), tableId: eId, data: { id_especie: 10, nombre_cientifico: 'Jacaranda mimosifolia' } },
    { id: uuidv4(), tableId: eId, data: { id_especie: 11, nombre_cientifico: 'Tipuana tipu' } },
    { id: uuidv4(), tableId: eId, data: { id_especie: 12, nombre_cientifico: 'Ceiba speciosa' } },
    { id: uuidv4(), tableId: eId, data: { id_especie: 13, nombre_cientifico: 'Ficus benjamina' } },
    { id: uuidv4(), tableId: eId, data: { id_especie: 14, nombre_cientifico: 'Quercus robur' } },
    { id: uuidv4(), tableId: eId, data: { id_especie: 15, nombre_cientifico: 'Platanus x hispanica' } },
    { id: uuidv4(), tableId: eId, data: { id_especie: 16, nombre_cientifico: 'Tilia cordata' } },
    { id: uuidv4(), tableId: eId, data: { id_especie: 17, nombre_cientifico: 'Acer palmatum' } },
    { id: uuidv4(), tableId: eId, data: { id_especie: 18, nombre_cientifico: 'Pinus sylvestris' } },
    { id: uuidv4(), tableId: eId, data: { id_especie: 19, nombre_cientifico: 'Salix babylonica' } },

    { id: uuidv4(), tableId: iId, data: { id_intervencion: 100, id_plaza: 1, id_especie: 10, fecha_poda: '2023-11-15' } },
    { id: uuidv4(), tableId: iId, data: { id_intervencion: 101, id_plaza: 2, id_especie: 11, fecha_poda: '2023-11-16' } },
    { id: uuidv4(), tableId: iId, data: { id_intervencion: 102, id_plaza: 3, id_especie: 12, fecha_poda: '2023-11-17' } },
    { id: uuidv4(), tableId: iId, data: { id_intervencion: 103, id_plaza: 4, id_especie: 13, fecha_poda: '2023-11-18' } },
    { id: uuidv4(), tableId: iId, data: { id_intervencion: 104, id_plaza: 5, id_especie: 14, fecha_poda: '2023-11-19' } },
    { id: uuidv4(), tableId: iId, data: { id_intervencion: 105, id_plaza: 6, id_especie: 15, fecha_poda: '2023-11-20' } },
    { id: uuidv4(), tableId: iId, data: { id_intervencion: 106, id_plaza: 7, id_especie: 16, fecha_poda: '2023-11-21' } },
    { id: uuidv4(), tableId: iId, data: { id_intervencion: 107, id_plaza: 8, id_especie: 17, fecha_poda: '2023-11-22' } },
    { id: uuidv4(), tableId: iId, data: { id_intervencion: 108, id_plaza: 9, id_especie: 18, fecha_poda: '2023-11-23' } },
    { id: uuidv4(), tableId: iId, data: { id_intervencion: 109, id_plaza: 10, id_especie: 19, fecha_poda: '2023-11-24' } },
  ]

  return { nodes, edges, rows }
}
