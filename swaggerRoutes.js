// swaggerRoutes.js

/**
 * @swagger
 * /:
 *   get:
 *     summary: Teste da API
 *     tags: [Teste]
 *     responses:
 *       200:
 *         description: Retorna uma mensagem de teste.
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmpassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       422:
 *         description: Erro de validação
 *       500:
 *         description: Erro ao registrar usuário
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Fazer login e gerar token JWT
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticação bem-sucedida
 *       422:
 *         description: Erro de validação
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao gerar token
 */

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Obter detalhes do usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes do usuário
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao buscar usuário
 */

/**
 * @swagger
 * /user/update/{id}:
 *   put:
 *     summary: Atualizar dados do usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário a ser atualizado
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmpassword:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dados atualizados com sucesso
 *       403:
 *         description: Senha atual incorreta
 *       422:
 *         description: Erro de validação
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao atualizar usuário
 */
