import mongoose from 'mongoose';

const tenantThemeSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  logoUrl: { type: String, default: '' },
  primaryColor: { type: String, default: '#ff7e5f' },
  accentColor: { type: String, default: '#8b5cf6' },
  borderRadius: { type: Number, default: 12, min: 4, max: 24 },
  fontFamily: { type: String, default: 'Outfit' },
  customCss: { type: String, default: '' },
}, { timestamps: true });

const TenantTheme = mongoose.models.TenantTheme || mongoose.model('TenantTheme', tenantThemeSchema);
export default TenantTheme;
