import mongoose, { Schema, Document } from 'mongoose';

interface IItemMaterial {
  material: mongoose.Types.ObjectId;
  cantidad: number;
  precioUnitario: number;
}

export interface IProyecto extends Document {
  nombre: string;
  descripcion?: string;
  materiales: IItemMaterial[];
  estado: 'en_produccion' | 'disponible' | 'vendido' | 'cancelado';
  fechaInicio: Date;
  fechaFin?: Date;
  costoProduccion: number;
  margenGanancia: number;  // ← NUEVO CAMPO (porcentaje, ej: 45)
  precioVenta: number;
  createdAt: Date;
}

const ProyectoSchema = new Schema<IProyecto>({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  materiales: [{
    material: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
    cantidad: { type: Number, required: true },
    precioUnitario: { type: Number, required: true }
  }],
  estado: { 
    type: String, 
    enum: ['en_produccion', 'disponible', 'vendido', 'cancelado'],
    default: 'en_produccion'
  },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date },
  costoProduccion: { type: Number, required: true },
  margenGanancia: { type: Number, required: true, default: 45 },  // ← NUEVO
  precioVenta: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProyecto>('Proyecto', ProyectoSchema);

