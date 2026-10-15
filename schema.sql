CREATE TABLE IF NOT EXISTS produtos (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(200) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    quantidade DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(45) NULL,
    unidade_medida VARCHAR(20) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS movimentacoes (
    id INT NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    tipo ENUM('ENTRADA', 'SAIDA') NOT NULL,
    quantidade DECIMAL(10, 2) NOT NULL,
    produtos_id INT NOT NULL,
    PRIMARY KEY (id),
    KEY idx_movimentacoes_produtos_id (produtos_id),
    CONSTRAINT fk_movimentacoes_produtos
        FOREIGN KEY (produtos_id) REFERENCES produtos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
