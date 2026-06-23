const form = document.querySelector('#form-dados');
const statusMessage = document.querySelector('#status');
const resultado = document.querySelector('#resultado');
const totalRegistros = document.querySelector('#total-registros');

function atualizarResultado(dados) {
  resultado.textContent = JSON.stringify(dados, null, 2);

  const total = Array.isArray(dados) ? dados.length : 0;
  totalRegistros.textContent = `${total} ${total === 1 ? 'registro' : 'registros'}`;
}

function mostrarStatus(texto, tipo = 'ok') {
  statusMessage.textContent = texto;
  statusMessage.classList.toggle('error', tipo === 'erro');
}

async function carregarDados() {
  mostrarStatus('Carregando dados salvos...');

  try {
    const resposta = await fetch('/api/dados');
    const corpo = await resposta.json();

    if (!resposta.ok) {
      throw new Error(corpo.erro || 'Erro ao recuperar os dados.');
    }

    atualizarResultado(corpo);
    mostrarStatus(
      corpo.length > 0 ? 'Dados carregados do arquivo JSON.' : 'Nenhum registro salvo ainda.'
    );
  } catch (error) {
    mostrarStatus(error.message, 'erro');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const dados = {
    nome: formData.get('nome').trim(),
    email: formData.get('email').trim(),
    mensagem: formData.get('mensagem').trim()
  };

  if (!dados.nome || !dados.email || !dados.mensagem) {
    mostrarStatus('Preencha todos os campos antes de enviar.', 'erro');
    return;
  }

  const botao = form.querySelector('button');
  botao.disabled = true;
  mostrarStatus('Salvando dados...');

  try {
    const resposta = await fetch('/api/dados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });

    const corpo = await resposta.json();

    if (!resposta.ok) {
      throw new Error(corpo.erro || 'Erro ao salvar os dados.');
    }

    atualizarResultado(corpo);
    form.reset();
    mostrarStatus('Dados salvos com sucesso.');
  } catch (error) {
    mostrarStatus(error.message, 'erro');
  } finally {
    botao.disabled = false;
  }
});

carregarDados();
