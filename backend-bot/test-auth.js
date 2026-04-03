const { Admin } = require('./src/models');
const bcrypt = require('bcryptjs');

async function testPassword() {
  const u = 'admin';
  const p = 'admin123';
  
  const admin = await Admin.findOne({ where: { username: u } });
  if (!admin) {
    console.log('❌ Usuário admin não existe no banco.');
    process.exit(1);
  }
  
  console.log('🔍 Usuário encontrado:', admin.username);
  console.log('🔑 Hash no banco:', admin.password);
  
  const isValid = await admin.validatePassword(p);
  console.log('🏁 Resultado da validação (admin123):', isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO');
  
  if (!isValid) {
    console.log('⚠️ Tentando comparar manualmente sem o prototype...');
    const manualValid = await bcrypt.compare(p, admin.password);
    console.log('🏁 Resultado manual (bcrypt.compare):', manualValid ? '✅ VÁLIDO' : '❌ INVÁLIDO');
  }
  
  process.exit(0);
}

testPassword();
