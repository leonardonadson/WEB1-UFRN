# App Express Para Gravar Formulario Em JSON

## Objetivo

Este projeto e um exercicio de Express.js para receber dados enviados por um formulario HTML e gravar esses dados em um arquivo JSON.

A pagina frontend envia os dados usando `fetch` para um endpoint do backend. O backend salva o novo registro no arquivo `data/dados.json` e retorna ao cliente a lista completa atualizada.

## Tecnologias usadas

- Node.js
- Express.js
- HTML
- CSS
- JavaScript com `fetch`

## Estrutura do projeto

```text
.
├── data/
│   └── dados.json
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── server.js
├── package.json
└── README.md
```

## Como rodar

Instale as dependencias:

```bash
npm install
```

Inicie o servidor:

```bash
npm start
```

Abra no navegador:

```text
http://localhost:3000
```

## Como funciona

O formulario possui os campos:

- Nome
- Email
- Mensagem

Ao enviar o formulario, o arquivo `public/app.js` faz uma requisicao `POST` para:

```text
POST /api/dados
```

O backend recebe os dados, grava no arquivo `data/dados.json` e retorna todos os registros salvos.

Quando a pagina e recarregada, o frontend faz uma requisicao `GET` para recuperar os dados ja salvos:

```text
GET /api/dados
```

## Endpoints

### GET /api/dados

Retorna todos os dados gravados no arquivo JSON.

### POST /api/dados

Recebe os dados do formulario e adiciona um novo registro ao arquivo JSON.

Exemplo de envio:

```json
{
  "nome": "Maria",
  "email": "maria@email.com",
  "mensagem": "Mensagem de teste"
}
```

Exemplo de resposta:

```json
[
  {
    "nome": "Maria",
    "email": "maria@email.com",
    "mensagem": "Mensagem de teste",
    "criadoEm": "2026-06-09T17:00:00.000Z"
  }
]
```

## Observacoes

- O arquivo `data/dados.json` deve conter uma lista JSON.
- O projeto usa a porta `3000` por padrao.
- Para usar outra porta, defina a variavel de ambiente `PORT`.

Exemplo:

```bash
PORT=4000 npm start
```
