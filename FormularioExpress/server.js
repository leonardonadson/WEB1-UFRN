const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataFilePath = path.join(__dirname, 'data', 'dados.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function lerDados() {
  const conteudo = await fs.readFile(dataFilePath, 'utf8');
  return JSON.parse(conteudo);
}

async function gravarDados(dados) {
  await fs.writeFile(dataFilePath, JSON.stringify(dados, null, 2));
}

app.get('/api/dados', async (req, res) => {
  try {
    const dados = await lerDados();

    if (!Array.isArray(dados)) {
      return res.status(500).json({
        erro: 'O arquivo de dados precisa conter uma lista JSON.'
      });
    }

    return res.json(dados);
  } catch (error) {
    console.error('Erro ao ler dados:', error);
    return res.status(500).json({
      erro: 'Nao foi possivel recuperar os dados.'
    });
  }
});

app.post('/api/dados', async (req, res) => {
  const { nome, email, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res.status(400).json({
      erro: 'Preencha nome, email e mensagem.'
    });
  }

  const novoRegistro = {
    nome: String(nome).trim(),
    email: String(email).trim(),
    mensagem: String(mensagem).trim(),
    criadoEm: new Date().toISOString()
  };

  if (!novoRegistro.nome || !novoRegistro.email || !novoRegistro.mensagem) {
    return res.status(400).json({
      erro: 'Preencha nome, email e mensagem.'
    });
  }

  try {
    const dados = await lerDados();

    if (!Array.isArray(dados)) {
      return res.status(500).json({
        erro: 'O arquivo de dados precisa conter uma lista JSON.'
      });
    }

    dados.push(novoRegistro);
    await gravarDados(dados);

    return res.status(201).json(dados);
  } catch (error) {
    console.error('Erro ao gravar dados:', error);
    return res.status(500).json({
      erro: 'Nao foi possivel gravar os dados.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
