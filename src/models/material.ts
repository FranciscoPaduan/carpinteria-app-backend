import mongoose, { Schema, Document } from 'mongoose';

interface IPrecioProveedor {
  proveedor: mongoose.Types.ObjectId;
  precio: number;
  activo: boolean;
}

export interface IMaterial extends Document {
  nombre: string;
  unidad: string;
  precioUnitario: number;
  stock: number;
  proveedores: IPrecioProveedor[];
  createdAt: Date;
}

const MaterialSchema = new Schema<IMaterial>({
  nombre: { type: String, required: true },
  unidad: { type: String, required: true },
  precioUnitario: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  proveedores: [{
    proveedor: { type: Schema.Types.ObjectId, ref: 'Proveedor', required: true },
    precio: { type: Number, required: true },
    activo: { type: Boolean, default: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMaterial>('Material', MaterialSchema);