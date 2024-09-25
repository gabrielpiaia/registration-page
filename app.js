require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerDoc'); // Importando o Swagger Docs
const path = require('path');

const app = express();


// interface web
app.use('/app', express.static(path.join(__dirname, 'view')));

// Middleware para analisar JSON - verifica se o conteúdo da requisição está em JSON. Se estiver, ele faz o "parse" desse JSON para um objeto JavaScript,
app.use(express.json());

// Credenciais do banco de dados
const dbUser = process.env.DB_USER;
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASSWORD;
const dbDatabase = process.env.DB_DATABASE;
const acessPort = process.env.ACESS_PORT;

// Configurar a conexão com o MySQL
const connection = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbDatabase
});

// Conectar ao MySQL
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.message);
    return;
  }
  console.log('Conectado ao MySQL com sucesso!');
});

// configura o Swagger no aplicativo Express.js 
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// middleware chamado checkToken
// Middleware de verificação de token
// responsável por verificar a presença e a validade de um token JWT (JSON Web Token) em uma requisição
function checkToken(req, res, next) {

  // Extrai o cabeçalho HTTP de autorização da requisição. Esse cabeçalho contém o token JWT.
  const authHeader = req.headers['authorization'];


  const token = authHeader && authHeader.split(' ')[1];
  //authHeader.split(' ')[1]: O token é o segundo item após o "Bearer" no cabeçalho.Se o cabeçalho não existir, token será undefined

  //se authorization existir, a linha faz o split para separar o token da palavra-chave Bearer
  if (!token) {
    return res.status(401).json({ msg: 'Acesso negado!' });
  }

  try {
    // Tenta verificar e decodificar o token usando a chave secreta armazenada em process.env.JWT_SECRET
    const secret = process.env.JWT_SECRET;

    // verify: Método da biblioteca jsonwebtoken que valida o token JWT
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.status(403).json({ msg: 'Token inválido!' });
      }
      req.user = user;
      next();
    });
  } catch (err) {
    res.status(400).json({ msg: 'Token inválido!' });
  }
}

// Rota teste
//app.get('/', (req, res) => {
//  res.status(200).json({ msg: 'Teste OK' });
//});

// Rota para registro de usuário
app.post('/auth/register', async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  // Validações
  if (!name) {
    return res.status(422).json({ msg: "Informar nome" });
  }
  if (!email) {
    return res.status(422).json({ msg: "Informar email" });
  }
  if (!password) {
    return res.status(422).json({ msg: "Informar senha" });
  }
  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não coincidem" });
  }

  try {
    // Criptografar senha

    // O método bcrypt.genSalt() gera um salt (valor aleatório) para ser combinado com a senha, garantindo maior segurança.
    const salt = await bcrypt.genSalt(12);

    //bcrypt.hash(): Cria um hash seguro da senha combinada com o salt gerado
    // hash da senha (e não a senha em texto puro) é armazenado no banco de dados
    const passwordHash = await bcrypt.hash(password, salt);

    // Inserir no banco de dados
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    connection.query(query, [name, email, passwordHash], (err, result) => {
      if (err) {
        return res.status(500).json({ msg: 'Erro ao registrar usuário', error: err.message });
      }
      res.status(201).json({ msg: 'Usuário registrado com sucesso!' });
    });
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao criptografar a senha', error: error.message });
  }
});

// Rota para login
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ msg: "Informar email" });
  }
  if (!password) {
    return res.status(422).json({ msg: "Informar senha" });
  }

  // Verificar se o usuário existe
  const query = 'SELECT * FROM users WHERE email = ?';
  connection.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ msg: 'Erro ao buscar usuário', error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    const user = results[0];

    // Comparar senha fornecida com a senha no banco de dados
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(422).json({ msg: "Senha inválida!" });
    }

    try {
      // Gerar token JWT
      const secret = process.env.JWT_SECRET;
      const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });

      // Retornar o ID do usuário juntamente com a mensagem e o token
      res.status(200).json({ 
        msg: "Autenticação bem-sucedida!", 
        token, 
        userId: user.id  // Incluindo o ID do usuário na resposta
      });
    } catch (error) {
      res.status(500).json({ msg: 'Erro ao gerar token', error: error.message });
    }
  });
});

// Rota para obter detalhes do usuário
app.get("/user/:id", checkToken, (req, res) => {
  const id = req.params.id;

  // Consulta SQL para buscar o usuário com o campo `admin_level`
  const query = 'SELECT id, name, email, admin_level FROM users WHERE id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ msg: 'Erro ao buscar usuário', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }
    res.status(200).json({ user: results[0] });
  });
});


// Rota para atualizar nome ou senha do usuário
app.put('/user/update/:id', checkToken, async (req, res) => {
  const id = req.params.id;
  const { name, password, confirmpassword, currentPassword } = req.body;

  // Verificar se a senha atual foi enviada
  if (!currentPassword) {
    return res.status(422).json({ msg: "Informe a senha atual para realizar a atualização." });
  }

  // Verificar se o usuário existe e pegar a senha atual
  const query = 'SELECT password FROM users WHERE id = ?';
  connection.query(query, [id], async (err, results) => {
    if (err) {
      return res.status(500).json({ msg: 'Erro ao buscar usuário', error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    const user = results[0];

    // Verificar se a senha atual está correta
    const checkPassword = await bcrypt.compare(currentPassword, user.password);
    if (!checkPassword) {
      return res.status(403).json({ msg: "Senha atual incorreta!" });
    }

    // Array para armazenar os campos a serem atualizados
    const fieldsToUpdate = [];
    const updateValues = [];

    // Verificar se o nome foi enviado e deve ser atualizado
    if (name) {
      fieldsToUpdate.push('name = ?');
      updateValues.push(name);
    }

    // Verificar se a senha foi enviada e se as senhas coincidem
    if (password) {
      if (password !== confirmpassword) {
        return res.status(422).json({ msg: "As senhas não coincidem." });
      }

      // Criptografar a nova senha
      try {
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
        fieldsToUpdate.push('password = ?');
        updateValues.push(passwordHash);
      } catch (error) {
        return res.status(500).json({ msg: 'Erro ao criptografar a nova senha.', error: error.message });
      }
    }

    // Se nenhum campo foi enviado para atualização, retornar erro
    if (fieldsToUpdate.length === 0) {
      return res.status(422).json({ msg: "Nenhum campo foi enviado para atualização." });
    }

    // Construir a query de atualização dinamicamente
    const updateQuery = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    updateValues.push(id);

    // Executar a atualização no banco de dados
    connection.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        return res.status(500).json({ msg: 'Erro ao atualizar usuário', error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ msg: 'Usuário não encontrado!' });
      }

      res.status(200).json({ msg: 'Dados atualizados com sucesso!' });
    });
  });
});


// Rota para deletar usuário
app.delete("/user/delete/:id", checkToken, (req, res) => {
  const id = req.params.id;
  const { password } = req.body; // Obter a senha do corpo da requisição

  // Consulta SQL para buscar o usuário
  const query = 'SELECT id, password, admin_level FROM users WHERE id = ?';
  connection.query(query, [id], async (err, results) => {
    if (err) {
      return res.status(500).json({ msg: 'Erro ao buscar usuário', error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    const userToDelete = results[0];
    const requestingUserId = req.user.id; // ID do usuário que está tentando excluir
    const requestingUserAdminLevel = req.user.admin_level; // Nível de admin do usuário que está tentando excluir

    // Verificar se a senha foi fornecida
    if (!password) {
      return res.status(400).json({ msg: "Senha é obrigatória." });
    }

    // Verificar se a senha está correta
    const isPasswordCorrect = await bcrypt.compare(password, userToDelete.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ msg: "Senha incorreta. Exclusão não permitida." });
    }

    // Permitir exclusão se o usuário que está tentando excluir é o mesmo
    if (requestingUserId === userToDelete.id) {
      // Permitir exclusão se for o mesmo usuário e nível de admin é 0 ou superior
      return deleteUser(id, res);
    } else if (requestingUserAdminLevel === 2) {
      // Permitir exclusão se for admin de nível 2
      return deleteUser(id, res);
    } else {

      return res.status(403).json({ msg: "Acesso negado! Você não tem permissão para excluir este usuário." });
    }
  });
});

// Função para excluir o usuário
function deleteUser(id, res) {
  const deleteQuery = 'DELETE FROM users WHERE id = ?';
  connection.query(deleteQuery, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: 'Erro ao excluir usuário', error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Usuário não encontrado!' });
    }

    res.status(200).json({ msg: 'Usuário excluído com sucesso!' });
  });
}


//////////// site

// Configurar o diretório estático para a pasta 'frontend'
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/home.html'));
});



 // 
app.listen(3002, () => {
  console.log('Servidor rodando na porta 3002');
});
