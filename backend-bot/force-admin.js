const { Admin } = require('./src/models');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
  try {
    const username = 'admin';
    const password = 'admin123';
    
    // Deleta se já existir para garantir o reset total
    await Admin.destroy({ where: { username } });
    
    // Cria o novo admin
    await Admin.create({ 
      username, 
      password, // O beforeSave do modelo fará o hash automático
      role: 'superadmin' 
    });
    
    console.log('✅ Usuário admin resetado com sucesso!');
    console.log('👤 Usuário: admin');
    console.log('🔑 Senha: admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao resetar admin:', err.message);
    process.exit(1);
  }
}

resetAdmin();
