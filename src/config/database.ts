import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = 'mongodb+srv://fpaduan2003_db_user:FEVMz5NIwLYW6kxY@cluster0.gdsaxfq.mongodb.net/?appName=Cluster0';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error);
    process.exit(1);
  }
};