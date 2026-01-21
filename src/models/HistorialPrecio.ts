import mongoose, { Schema, Document } from 'mongoose';

export interface IHistorialPrecio extends Document {
  material: mongoose.Types.ObjectId;
  precioAnterior: number;
  precioNuevo: number;
  fecha: Date;
  createdAt: Date;
}

const HistorialPrecioSchema = new Schema<IHistorialPrecio>({
  material: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
  precioAnterior: { type: Number, required: true },
  precioNuevo: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IHistorialPrecio>('HistorialPrecio', HistorialPrecioSchema);