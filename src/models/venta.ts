import mongoose, { Schema, Document } from 'mongoose';

interface IPago {
  monto: number;
  fecha: Date;
  metodoPago?: string;
  observaciones?: string;
}

export interface IVenta extends Document {
  cliente: mongoose.Types.ObjectId;
  proyecto: mongoose.Types.ObjectId;
  total: number;
  pagos: IPago[];
  saldoPendiente: number;
  estado: 'pendiente' | 'pagada' | 'cancelada';
  fecha: Date;
  createdAt: Date;
}

const VentaSchema = new Schema<IVenta>({
  cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  proyecto: { type: Schema.Types.ObjectId, ref: 'Proyecto', required: true },
  total: { type: Number, required: true },
  pagos: [{
    monto: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
    metodoPago: { type: String },
    observaciones: { type: String }
  }],
  saldoPendiente: { type: Number, required: true },
  estado: { 
    type: String, 
    enum: ['pendiente', 'pagada', 'cancelada'],
    default: 'pendiente'
  },
  fecha: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IVenta>('Venta', VentaSchema);