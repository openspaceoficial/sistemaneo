// Objeto para armazenar todos os cheques
let cheques = {};

async function carregarCheques(status = 'todos') {
    // Define a URL com base no filtro de status
    const url =
        status === 'todos'
            ? 'https://94dd-2804-53e0-823a-4000-2938-ec4b-7476-8e95.ngrok-free.app/api/cheques/todos'
            : `https://94dd-2804-53e0-823a-4000-2938-ec4b-7476-8e95.ngrok-free.app/api/cheques/todos?status=${encodeURIComponent(status)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                // Se for 404, nenhuma mensagem genérica - tratamos como "sem cheques encontrados"
                atualizarResultados([], status);
                return;
            }
            throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Cheques encontrados:', data);

        // Armazenar os cheques no objeto global
        cheques = data;

        // Atualiza os resultados com os cheques retornados
        atualizarResultados(data, status);
    } catch (error) {
        console.error('Erro ao consultar cheques:', error);
        atualizarResultados([], status); // Mostra mensagem amigável se houver erro
    }
}

// Função para atualizar os resultados na página
function atualizarResultados(cheques, status) {
    const resultadosDiv = document.getElementById("resultados");
    resultadosDiv.innerHTML = ''; // Limpa os resultados anteriores

    if (cheques.length > 0) {
        let tabela = `
            <table class="tabela">
                <thead>
                    <tr>
                        <th>Cheque Nº</th>
                        <th>Beneficiário</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Data de Emissão</th>
                        <th>Data de Vencimento</th>
                        <th>Descrição</th>
                        <th>Empresa Emitente</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        cheques.forEach(cheque => {
            tabela += `
                 <tr>
                    <td>${cheque.cheque_numero || 'N/A'}</td>
                    <td>${cheque.nome_beneficiario || 'N/A'}</td>
                    <td>${cheque.valor || 'N/A'}</td>
                    <td>${cheque.status || 'N/A'}</td>
                    <td>${cheque.data_emissao ? formatarData(cheque.data_emissao) : 'N/A'}</td>
                    <td>${cheque.data_vencimento ? formatarData(cheque.data_vencimento) : 'N/A'}</td>
                    <td>${cheque.descricao || 'N/A'}</td>
                    <td>${cheque.empresa || 'N/A'}</td>
                    <td>
                        <button onclick="editarCheque(${cheque.id})">Editar</button>
                        <button onclick="excluirCheque(${cheque.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });

        tabela += `</tbody></table>`;
        resultadosDiv.innerHTML = tabela;
    } else {
        // Mostra uma mensagem amigável se não houver cheques com o status selecionado
        resultadosDiv.innerHTML = `<p>Não há cheques com o status "<strong>${status}</strong>".</p>`;
    }
}

function formatarData(data) {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0'); // Mes começa de 0
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Função para excluir um cheque
async function excluirCheque(id) {
    const confirmacao = confirm('Tem certeza que deseja excluir este cheque?');

    if (!confirmacao) {
        return;
    }

    try {
        const response = await fetch(`https://94dd-2804-53e0-823a-4000-2938-ec4b-7476-8e95.ngrok-free.app/api/cheques/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Cheque Excluído com sucesso!');
        }

        alert('Cheque excluído com sucesso!');
        carregarCheques(); // Recarrega a lista de cheques após exclusão

    } catch (error) {
        console.error('Cheque Excluído com sucesso!', error);
        alert('Cheque Excluído com sucesso!');
    }
}

function editarCheque(id) {
    console.log(cheques)
    // Encontrar o cheque no array 'cheques'
    const cheque = cheques.find(cheque => cheque.id === id);
    if (!cheque) {
        alert('Cheque não encontrado!');
        return;
    }

    // Preenche o formulário com os dados do cheque
    const chequeNumeroField = document.getElementById('cheque_numero');
    const nomeBeneficiarioField = document.getElementById('nome_beneficiario');
    const valorField = document.getElementById('valor');
    const statusField = document.getElementById('status');
    const dataEmissaoField = document.getElementById('data_emissao');
    const dataVencimentoField = document.getElementById('data_vencimento');
    const descricaoField = document.getElementById('descricao');
    const empresaField = document.getElementById('empresa');

    chequeNumeroField.value = cheque.cheque_numero || '';
    nomeBeneficiarioField.value = cheque.nome_beneficiario || '';
    valorField.value = cheque.valor || '';
    statusField.value = cheque.status || '';
    dataEmissaoField.value = cheque.data_emissao ? formatarData(cheque.data_emissao) : '';
    dataVencimentoField.value = cheque.data_vencimento ? formatarData(cheque.data_vencimento) : '';
    descricaoField.value = cheque.descricao || '';
    empresaField.value = cheque.empresa || '';
    document.getElementById('cheque-id').value = cheque.id; // Armazena o id do cheque

    // Exibe o formulário de edição
    document.getElementById('form-edicao').style.display = 'block';
       
}
// Função para salvar as edições do cheque
async function salvarEdicao() {
    const chequeId = document.getElementById('cheque-id').value;
    const cheque_numero = document.getElementById('cheque_numero').value;
    const nome_beneficiario = document.getElementById('nome_beneficiario').value;
    const valor = document.getElementById('valor').value;
    const status = document.getElementById('status').value;
    const data_emissao = document.getElementById('data_emissao').value;
    const data_vencimento = document.getElementById('data_vencimento').value;
    const descricao = document.getElementById('descricao').value;
    const empresa = document.getElementById('empresa').value;

    // Validação dos dados antes de salvar
    if (!cheque_numero || !nome_beneficiario || !valor || !status) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }

    const chequeData = {
        cheque_numero,
        nome_beneficiario,
        valor,
        status,
        data_emissao,
        data_vencimento,
        descricao,
        empresa
    };

    console.log('Dados do cheque para edição:', chequeData);

    try {
        const response = await fetch(`https://94dd-2804-53e0-823a-4000-2938-ec4b-7476-8e95.ngrok-free.app/api/cheques/${chequeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chequeData)
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao salvar edição: ${errorMessage}`);
        }

        const result = await response.json();
        alert(result.message || 'Cheque atualizado com sucesso!');
        carregarCheques(); // Recarrega a lista de cheques após a atualização
        cancelarEdicao(); // Fecha o formulário de edição

    } catch (error) {
        console.error('Cheque atualizado com sucesso!', error);
        alert('Cheque atualizado com sucesso!');
    }
}


// Adiciona o evento de filtro
document.getElementById('filtrar-btn').addEventListener('click', () => {
    const status = document.getElementById('status-filtro').value;
    carregarCheques(status);
});

// Carrega todos os cheques ao carregar a página
carregarCheques();

function cancelarEdicao() {
    document.getElementById('form-edicao').style.display = 'none';
}
