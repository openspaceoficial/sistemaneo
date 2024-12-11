// Objeto para armazenar todos os boletos
let boletos = {};

async function carregarBoletos(status = 'todos') {
    // Define a URL com base no filtro de status
    const url =
        status === 'todos'
            ? 'https://94dd-2804-53e0-823a-4000-2938-ec4b-7476-8e95.ngrok-free.app/api/boletos/todos'
            : `https://94dd-2804-53e0-823a-4000-2938-ec4b-7476-8e95.ngrok-free.app/api/boletos/todos?status=${encodeURIComponent(status)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                // Se for 404, nenhuma mensagem genérica - tratamos como "sem boletos encontrados"
                atualizarResultados([], status);
                return;
            }
            throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Boletos encontrados:', data);

        // Armazenar os boletos no objeto global
        boletos = data;

        // Atualiza os resultados com os boletos retornados
        atualizarResultados(data, status);
    } catch (error) {
        console.error('Erro ao consultar boletos:', error);
        atualizarResultados([], status); // Mostra mensagem amigável se houver erro
    }
}

// Função para atualizar os resultados na página
function atualizarResultados(boletos, status) {
    const resultadosDiv = document.getElementById("resultados");
    resultadosDiv.innerHTML = ''; // Limpa os resultados anteriores

    if (boletos.length > 0) {
        let tabela = `
            <table class="tabela">
                <thead>
                    <tr>
                        <th>nome_pagador</th>
                        <th>cpf_pagador</th>
                        <th>endereco_pagador</th>
                        <th>valor</th>
                        <th>Data de Emissão</th>
                        <th>Data de Vencimento</th>
                        <th>descricao</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        boletos.forEach(boleto => {
            tabela += `
                 <tr>
                    <td>${boleto.nome_pagador || 'N/A'}</td>
                    <td>${boleto.cpf_pagador || 'N/A'}</td>
                    <td>${boleto.endereco_pagador || 'N/A'}</td>
                    <td>${boleto.valor || 'N/A'}</td>
                    <td>${boleto.data_emissao ? formatarData(boleto.data_emissao) : 'N/A'}</td>
                    <td>${boleto.data_vencimento ? formatarData(boleto.data_vencimento) : 'N/A'}</td>
                    <td>${boleto.descricao || 'N/A'}</td>
                    <td>${boleto.status || 'N/A'}</td>
                    <td>
                        <button onclick="excluirBoleto(${boleto.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });

        tabela += `</tbody></table>`;
        resultadosDiv.innerHTML = tabela;
    } else {
        // Mostra uma mensagem amigável se não houver boletos com o status selecionado
        resultadosDiv.innerHTML = `<p>Não há boletos com o status "<strong>${status}</strong>".</p>`;
    }
}

function formatarData(data) {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0'); // Mes começa de 0
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Função para excluir um boleto
async function excluirBoleto(id) {
    const confirmacao = confirm('Tem certeza que deseja excluir este boleto?');

    if (!confirmacao) {
        return;
    }

    try {
        const response = await fetch(`https://94dd-2804-53e0-823a-4000-2938-ec4b-7476-8e95.ngrok-free.app/api/boletos/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Boleto Excluído com sucesso!');
        }

        alert('Boleto excluído com sucesso!');
        carregarBoletos(); // Recarrega a lista de boletos após exclusão

    } catch (error) {
        console.error('Boleto Excluído com sucesso!', error);
        alert('Boleto Excluído com sucesso!');
    }
}

function editarBoleto(id) {
    console.log(boletos)
    // Encontrar o boleto no array 'boletos'
    const boleto = boletos.find(boleto => boleto.id === id);
    if (!boleto) {
        alert('Boleto não encontrado!');
        return;
    }


    // Preenche o formulário com os dados do boleto
    const nome_pagadorField = document.getElementById('nome_pagador');
    const cpf_pagadorField = document.getElementById('cpf_pagador');
    const endereco_pagadorfield = document.getElementById('endereco_pagador')
    const valorField = document.getElementById('valor');
    const statusField = document.getElementById('status');
    const dataEmissaoField = document.getElementById('data_emissao');
    const dataVencimentoField = document.getElementById('data_vencimento');
    const descricaoField = document.getElementById('descricao');

    nome_pagadorField.value = boleto.nome_pagador || '';
    cpf_pagadorField.value = boleto.cpf_pagador || '';
    valorField.value = boleto.valor || '';
    statusField.value = boleto.status || '';
    dataEmissaoField.value = boleto.data_emissao ? formatarData(boleto.data_emissao) : '';
    dataVencimentoField.value = boleto.data_vencimento ? formatarData(boleto.data_vencimento) : '';
    descricaoField.value = boleto.descricao || '';
    document.getElementById('boleto-id').value = boleto.id; // Armazena o id do boleto

    // Exibe o formulário de edição
    document.getElementById('form-edicao').style.display = 'block';
       
}
// Função para salvar as edições do boleto
async function salvarEdicao() {
    const nome_pagador = document.getElementById('nome_pagador').value;
    const cpf_pagador = document.getElementById('cpf_pagador').value;
    const endereco_pagador = document.getElementById('endereco_pagador').value;
    const valor = document.getElementById('valor').value;
    const status = document.getElementById('status').value;
    const dataEmissao = document.getElementById('data_emissao').value;
    const dataVencimento = document.getElementById('data_vencimento').value;
    const descricao = document.getElementById('descricao').value;

    // Validação dos dados antes de salvar
if (!nome_pagador || !cpf_pagador || !endereco_pagador || !valor || !status || !dataEmissao || !dataVencimento || !descricao) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }

    const boletoData = {
        nome_pagador,
        cpf_pagador,
        endereco_pagador,
        valor,
        status,
        dataEmissao,
        dataVencimento,
        descricao
    };

    console.log('Dados do boleto para edição:', boletoData);

    try {
        const response = await fetch(`https://94dd-2804-53e0-823a-4000-2938-ec4b-7476-8e95.ngrok-free.app/api/boletos/${boletoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(boletoData)
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao salvar edição: ${errorMessage}`);
        }

        const result = await response.json();
        alert(result.message || 'Boleto atualizado com sucesso!');
        carregarBoletos(); // Recarrega a lista de boletos após a atualização
        cancelarEdicao(); // Fecha o formulário de edição

    } catch (error) {
        console.error('Cheque atualizado com sucesso!', error);
        alert('Cheque atualizado com sucesso!');
    }
}


// Adiciona o evento de filtro
document.getElementById('filtrar-btn').addEventListener('click', () => {
    const status = document.getElementById('status-filtro').value;
    carregarBoletos(status);
});

// Carrega todos os boletos ao carregar a página
carregarBoletos();

function cancelarEdicao() {
    document.getElementById('form-edicao').style.display = 'none';
}
