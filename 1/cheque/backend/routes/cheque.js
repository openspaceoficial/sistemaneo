const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Rota para consultar cheques que vencem no dia seguinte
router.get('/proximos', (req, res) => {
    const query = `
        SELECT numero, valor, data_vencimento 
        FROM cheques 
        WHERE data_vencimento = CURDATE() + INTERVAL 1 DAY
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao consultar cheques.', error: err });
        }
        res.json(results);
    });
});

router.post('/cadastrocheque', (req, res) => {
    const { cheque_numero, data_emissao, nome_beneficiario, valor, data_vencimento, descricao } = req.body;

    const query = 'INSERT INTO cheques (cheque_numero, data_emissao, nome_beneficiario, valor, data_vencimento, descricao) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [cheque_numero, data_emissao, nome_beneficiario, valor, data_vencimento, descricao], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar cheque:', err);
            res.status(500).json({ error: 'Erro ao cadastrar cheque' });
        } else {
            res.status(201).json({ message: 'Cheque cadastrado com sucesso!' });
        }
    });
});

// Rota para listar cheques com ou sem filtro
router.get('/api/cheques', (req, res) => {
    const status = req.query.status; // Obtém o valor do filtro "status"
    let sql = 'SELECT * FROM cheques'; // Consulta base
    const params = [];

    // Adiciona filtro de status, se necessário
    if (status && status !== 'todos') {
        sql += ' WHERE status = ?';
        params.push(status);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Erro ao buscar cheques:', err);
            return res.status(500).json({ error: 'Erro ao buscar cheques.' });
        }

        res.json(results); // Retorna os cheques encontrados
    });
});

// Rota para excluir um cheque
router.delete('/cheques/:id', (req, res) => {
    const chequeId = req.params.id; // Obtém o id do cheque a ser excluído

    const query = 'DELETE FROM cheques WHERE id = ?';

    db.query(query, [chequeId], (err, result) => {
        if (err) {
            console.error('Erro ao excluir cheque:', err);
            return res.status(500).json({ error: 'Erro ao excluir cheque' });
        }

        // Verifica se algum cheque foi excluído
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cheque não encontrado' });
        }

        res.status(200).json({ message: 'Cheque excluído com sucesso!' });
    });
});

// Exemplo de código para atualizar o status de um cheque para "compensado"
router.put('/compensar/:id', (req, res) => {
    const chequeId = req.params.id;  // Pegando o ID do cheque da URL
    const novoStatus = 'compensado';  // Novo status que queremos definir

    // Query para atualizar o status no banco de dados
    const query = 'UPDATE cheques SET status = ? WHERE id = ?';
    
    connection.query(query, [novoStatus, chequeId], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar o status do cheque:', err);
            return res.status(500).json({ success: false, message: 'Erro ao atualizar o status do cheque.' });
        }

        if (result.affectedRows > 0) {
            // Se o status foi atualizado com sucesso
            res.status(200).json({ success: true, message: 'Status do cheque atualizado para compensado.' });
        } else {
            // Caso o cheque não tenha sido encontrado
            res.status(404).json({ success: false, message: 'Cheque não encontrado.' });
        }
    });
});

router.patch('/compensar/:id', (req, res) => {
    const chequeId = req.params.id;

    const sql = `
        UPDATE cheques 
        SET status = 'Compensado' 
        WHERE id = ?
    `;

    db.query(sql, [chequeId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao atualizar status do cheque', error: err });
        }

        if (results.affectedRows > 0) {
            res.json({ success: true, message: 'Cheque marcado como compensado' });
        } else {
            res.status(404).json({ success: false, message: 'Cheque não encontrado' });
        }
    });
});
// Rota para editar cheque
router.put('/cheques/:id', (req, res) => {
    const chequeId = req.params.id;
    const { cheque_numero, nome_beneficiario, valor, status, data_emissao, data_vencimento, descricao, empresa } = req.body;

    // Query para atualizar os dados do cheque
    const query = `
        UPDATE cheques
        SET cheque_numero = ?, nome_beneficiario = ?, valor = ?, status = ?, data_emissao = ?, data_vencimento = ?, descricao = ?, empresa = ?
        WHERE id = ?
    `;

    db.query(query, [cheque_numero, nome_beneficiario, valor, status, data_emissao, data_vencimento, descricao, empresa, chequeId], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar cheque:', err);
            return res.status(500).json({ error: 'Erro ao atualizar cheque' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Cheque atualizado com sucesso!' });
        } else {
            res.status(404).json({ error: 'Cheque não encontrado' });
        }
    });
});


module.exports = router;