# Projeto de Autenticação de Usuários com Node.js

Este projeto implementa um sistema de autenticação utilizando Node.js, Express e JSON Web Tokens (JWT). Ele inclui rotas públicas para registro e login de usuários, além de rotas privadas protegidas por tokens JWT. O projeto também utiliza MongoDB e MySQL para armazenar dados dos usuários e garante que as senhas sejam criptografadas com bcrypt.

## Demonstração

- [Vídeo de demonstração](https://www.youtube.com/watch?v=qG9omKpR3CI)
- [Documentação da API](http://localhost:3002/api-doc/#/)

## Instalação

1. Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/nome-do-repositorio.git
    cd nome-do-repositorio
    ```

2. Crie o arquivo `.env` para armazenar variáveis de ambiente:
    ```bash
    touch .env
    ```
    Preencha o arquivo `.env` com as seguintes variáveis:
    ```env
    DB_HOST=localhost
    DB_USER=seu-usuario
    DB_PASS=sua-senha
    JWT_SECRET=sua-chave-secreta
    ```

3. Instale as dependências:
    ```bash
    npm install
    ```

    Dependências instaladas:
    - `bcrypt`: para criptografar senhas.
    - `dotenv`: para o uso de variáveis de ambiente.
    - `express`: para criação da API.
    - `jsonwebtoken`: para gerar e validar tokens JWT.
    - `mongoose`: para interação com o MongoDB.
    - `mysql2`: para interação com o banco de dados MySQL.
    - `swagger-ui-express` e `swagger-jsdoc`: para documentar a API.

4. Para o ambiente de desenvolvimento:
    ```bash
    npm install --save-dev nodemon
    ```

## Execução

Para rodar o projeto, use o comando abaixo:
```bash
npm start
