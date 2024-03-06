const express = require('express');
const mysql = require('mysql');

const app = express();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'boticario'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão bem-sucedida ao banco de dados.');

  // Consulta para selecionar os dados da view
  const query = 'SELECT * FROM relatoriovenda;';

app.get('/venda/:id', (req, res) => {
  const vendaId = req.params.id;

  const query = `
    SELECT JSON_OBJECT(
        'id_venda', v.id_venda,
        'data', v.venda_data,
        'quantidade', v.venda_quantidade,
        'cliente', JSON_OBJECT(
            'id_cliente', c.id_cliente,
            'nome', c.cliente_nome,
            'numero', c.cliente_numero
        ),
        'produto', JSON_OBJECT(
            'id_produto', p.id_produto,
            'nome', p.produto_nome,
            'descricao', p.produto_descricao,
            'preco', p.produto_preco,
            'quantidade', p.produto_quantidade,
            'categoria', p.produto_categoria
        )
    ) AS venda_json
    FROM venda v
    INNER JOIN produtos p ON v.produtos_id_produto = p.id_produto
    INNER JOIN cliente c ON v.cliente_id_cliente = c.id_cliente
    WHERE v.id_venda = ?;
  `;

  connection.query(query, [vendaId], (err, results) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).json({ error: 'Erro ao consultar o banco de dados.' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Venda não encontrada.' });
      return;
    }

    res.json(JSON.parse(results[0].venda_json));
  });
});

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      return;
    }

    console.log('Dados do relatório de vendas:');
    console.log(results); // Exibir os dados da view no console
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor está ouvindo na porta ${PORT}`);
});