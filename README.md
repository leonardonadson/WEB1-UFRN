# 💻 Desenvolvimento de Sistemas Web I

## DIM0546 — Desenvolvimento de Sistemas Web I — T01 (2026.1)

## 🚀 Descrição do Repositório

Este repositório reúne os códigos, projetos e exercícios práticos desenvolvidos durante a disciplina **DIM0546 — Desenvolvimento de Sistemas Web I** (Turma 01 — 2026.1) na **Universidade Federal do Rio Grande do Norte (UFRN)**.

O objetivo principal é desenvolver conhecimentos fundamentais para a construção de aplicações Web, trabalhando desde a estruturação e estilização de páginas até a criação de interfaces interativas, consumo de APIs e desenvolvimento de servidores com Node.js e Express.

> 📌 **Propósito:** servir como portfólio acadêmico e registro do aprendizado. Cada diretório representa uma atividade ou um mini-projeto desenvolvido ao longo da disciplina.

---

## 📚 Tópicos e Conceitos Abordados

### 🔹 Fundamentos da Web

* Estrutura e funcionamento de aplicações Web.
* Comunicação entre cliente e servidor.
* Organização semântica de documentos com **HTML5**.
* Utilização de formulários, links, imagens, listas e outros elementos HTML.

### 🔹 Estilização e Design Responsivo

* Estilização de páginas com **CSS3**.
* Seletores, especificidade, herança e modelo de caixas.
* Construção de layouts com **Flexbox** e **CSS Grid**.
* Responsividade com Media Queries.
* Criação de interfaces acessíveis e adaptáveis a diferentes dispositivos.

### 🔹 Programação no Navegador

* Fundamentos da linguagem **JavaScript**.
* Manipulação do DOM.
* Tratamento de eventos e validação de formulários.
* Armazenamento de informações no navegador com `localStorage`.
* Desenvolvimento de interfaces dinâmicas e interativas.

### 🔹 Requisições e APIs

* Programação assíncrona com Promises e `async/await`.
* Realização de requisições HTTP com a API `fetch`.
* Consumo e apresentação de dados obtidos de APIs externas.
* Manipulação de dados no formato **JSON**.

### 🔹 Desenvolvimento Back-end

* Introdução ao ambiente de execução **Node.js**.
* Criação de servidores Web com **Express.js**.
* Desenvolvimento de endpoints e APIs REST.
* Recebimento, validação e persistência de dados enviados por formulários.
* Integração entre front-end e back-end.

---

## 📂 Projetos do Repositório

```text
Web1/
├── FormularioExpress/
│   ├── data/
│   ├── public/
│   ├── package.json
│   └── server.js
├── Gatos&Filmes/
│   └── gatos_filmes.html
├── Kanban/
│   ├── app.js
│   ├── index.html
│   └── style.css
└── README.md
```

### 📝 Formulário com Express

Aplicação cliente-servidor que recebe dados de um formulário, envia as informações para uma API criada com Express e armazena os registros em um arquivo JSON.

**Conceitos praticados:** Node.js, Express.js, rotas HTTP, `fetch`, formulários, validação e persistência em JSON.

### 🐱 Gatos & Filmes

Página responsiva que realiza requisições a APIs públicas e apresenta gatos e filmes em uma galeria de cards.

**Conceitos praticados:** HTML, CSS, JavaScript, consumo de APIs, `fetch`, `async/await` e renderização dinâmica.

### 📋 KanbanFlow

Gerenciador de tarefas em formato Kanban com criação, edição, movimentação e filtragem de cards.

**Conceitos praticados:** manipulação do DOM, eventos, drag and drop, formulários, filtros, temas e persistência com `localStorage`.

---

## 🛠️ Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript
* Node.js
* Express.js
* JSON
* Fetch API
* Git e GitHub

---

## ▶️ Como Executar

### 📌 Pré-requisitos

Para executar todos os projetos, recomenda-se ter instalado:

* Um navegador Web moderno, como Google Chrome, Firefox ou Microsoft Edge.
* [Node.js](https://nodejs.org/) e npm.
* Um editor de código, como [Visual Studio Code](https://code.visualstudio.com/).
* A extensão **Live Server** é opcional para os projetos estáticos.

### 📥 Clonar o Repositório

```bash
git clone https://github.com/leonardonadson/WEB1-UFRN.git
cd WEB1-UFRN
```

### 🌐 Executar os Projetos Estáticos

Para executar **Kanban** ou **Gatos & Filmes**, abra o arquivo HTML correspondente diretamente no navegador:

```text
Kanban/index.html
Gatos&Filmes/gatos_filmes.html
```

Também é possível abrir a pasta no Visual Studio Code e utilizar a extensão **Live Server**.

### 🖥️ Executar o Formulário com Express

Entre na pasta do projeto:

```bash
cd FormularioExpress
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor:

```bash
npm start
```

Acesse no navegador:

```text
http://localhost:3000
```

---

## 📚 Referências

* **Material da disciplina:** conteúdo teórico e prático fornecido durante as aulas de DIM0546.
* **MDN Web Docs:** [https://developer.mozilla.org/pt-BR/](https://developer.mozilla.org/pt-BR/)
* **Documentação do Node.js:** [https://nodejs.org/docs/latest/api/](https://nodejs.org/docs/latest/api/)
* **Documentação do Express:** [https://expressjs.com/](https://expressjs.com/)
* **Material acadêmico da UFRN:** Departamento de Informática e Matemática Aplicada (DIMAp).

---

## 👨‍💻 Autor

<img src="https://avatars.githubusercontent.com/u/72714982?v=4" width="100" alt="Foto de Leonardo Nadson" style="border-radius: 50%;">

**Leonardo Nadson**

Desenvolvido como parte das atividades acadêmicas da disciplina de **Desenvolvimento de Sistemas Web I — DIMAp/UFRN**.
