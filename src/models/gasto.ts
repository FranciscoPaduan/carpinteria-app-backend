import mongoose, { Schema, Document } from 'mongoose';

export interface IGasto extends Document {
  concepto: string;
  categoria: 'operativo' | 'indirecto' | 'impuesto' | 'desperdicio';
  monto: number;
  fecha: Date;
  descripcion?: string;
  createdAt: Date;
}

const GastoSchema = new Schema<IGasto>({
  concepto: { type: String, required: true },
  categoria: { 
    type: String, 
    enum: ['operativo', 'indirecto', 'impuesto', 'desperdicio'],
    required: true
  },
  monto: { type: Number, required: true },
  fecha: { type: Date, required: true },
  descripcion: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IGasto>('Gasto', GastoSchema);