const express = require('express');

const db = require('../db');

const router = express.Router();

router.get('/produtos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM produtos');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

router.post('/produtos', async (req, res) => {
  const { nome, valor, quantidade, categoria, unidade_medida } = req.body;

  if (
    !nome ||
    !unidade_medida ||
    valor == null ||
    !Number.isFinite(Number(valor)) ||
    Number(valor) < 0 ||
    quantidade == null ||
    !Number.isFinite(Number(quantidade)) ||
    Number(quantidade) < 0
  ) {
    return res.status(400).json({ error: 'Informe nome, unidade de medida, valor e quantidade válidos' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO produtos (nome, valor, quantidade, categoria, unidade_medida) VALUES (?, ?, ?, ?, ?)',
      [nome, valor, quantidade, categoria || null, unidade_medida]
    );

    res.status(201).json({ id: result.insertId, nome, valor, quantidade, categoria: categoria || null, unidade_medida });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    // If it's a DB error, include code/message for easier debugging
    res.status(500).json({ error: 'Erro ao criar produto', details: error.message });
  }
});

router.get('/produtos-categoria/:categoria', async (req, res) => {
    const { categoria } = req.params;
    const sql = `
        SELECT
            categoria,
            SUM(valor * quantidade) AS valor_total
        FROM produtos
        WHERE categoria = ?
        GROUP BY categoria
    `;

    try {
        const [rows] = await db.query(sql, [categoria]);
        return res.status(200).json(rows);
    } catch (erro) {
        console.error('Erro ao agregar por categoria:', erro);
        return res.status(500).json({ erro: erro.message });
    }
});

router.get('/saidas', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        s.id,
        p.nome,
        s.quantidade,
        s.date
      FROM movimentacoes
      INNER JOIN produtos p
        ON s.produtos_id = p.id
      ORDER BY s.data_saida DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar saídas:', error);
    res.status(500).json({ error: 'Erro ao buscar saídas' });
  }
});

router.get('/produtos/limites', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        nome,
        categoria,
        quantidade,
        quantidade AS percentual_nivel,
        CASE
          WHEN quantidade = 0 THEN 'MÍNIMO'
          WHEN quantidade = 100 THEN 'MÁXIMO'
        END AS situacao
      FROM produtos
      WHERE quantidade = 0 OR quantidade = 100
    `);

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar produtos nos limites:', error);
    res.status(500).json({
      error: 'Erro ao buscar produtos nos limites'
    });
  }
});


module.exports = router;    