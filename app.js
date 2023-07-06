const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Configurar o middleware para fazer o parse do corpo da requisição como JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conexão com o MongoDB
mongoose
  .connect('mongodb://localhost:27017/web', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Conexão estabelecida com o MongoDB');
  })
  .catch(error => {
    console.error('Erro ao conectar com o MongoDB:', error);
  });

// Definição do esquema do modelo
const projetoSchema = new mongoose.Schema({
  nome_empresarial: String,
  nome_fantasia: String,
  num_cnpj: String,
  num_fic: String,
  nome_titular: String,
  rg: String,
  cpf: String,
  endereco: String,
});

// Criação do modelo
const Projeto = mongoose.model('Projeto', projetoSchema);

// Rota para salvar os dados
app.post('/save_data', (req, res) => {
  const {
    nome_empresarial,
    nome_fantasia,
    num_cnpj,
    num_fic,
    nome_titular,
    rg,
    cpf,
    endereco,
  } = req.body;

  const projeto = new Projeto({
    nome_empresarial,
    nome_fantasia,
    num_cnpj,
    num_fic,
    nome_titular,
    rg,
    cpf,
    endereco,
  });

  projeto
    .save()
    .then(() => {
      res.status(200).json({ message: 'Dados salvos com sucesso!' });
    })
    .catch(error => {
      res.status(500).json({
        error: 'Erro ao salvar os dados no banco de dados.',
      });
    });
});


// Rota para exibir as empresas cadastradas
app.get('/empresas', (req, res) => {
  Projeto.find({})
    .exec()
    .then(empresas => {
      res.status(200).json(empresas);
    })
    .catch(error => {
      res.status(500).json({ error: 'Erro ao buscar as empresas cadastradas.' });
    });
});

// Rota para atualizar os dados da empresa
app.post('/atualizar_empresa', (req, res) => {
  const { empresa_id, nome_empresarial, nome_fantasia, num_cnpj, num_fic, nome_titular, rg, cpf, endereco } = req.body;

  Projeto.findByIdAndUpdate(empresa_id, {
    nome_empresarial,
    nome_fantasia,
    num_cnpj,
    num_fic,
    nome_titular,
    rg,
    cpf,
    endereco
  })
    .exec()
    .then(updatedEmpresa => {
      if (!updatedEmpresa) {
        res.status(404).json({ error: 'Empresa não encontrada.' });
      } else {
        res.status(200).json({ message: 'Dados da empresa atualizados com sucesso.' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Ocorreu um erro ao atualizar os dados da empresa.' });
    });
});

// Rota para excluir uma empresa
app.delete('/empresas/:id', (req, res) => {
  const id = req.params.id;

  Projeto.findByIdAndDelete(id)
    .exec()
    .then(deletedEmpresa => {
      if (!deletedEmpresa) {
        // Caso a empresa não seja encontrada
        res.status(404).json({ error: 'Empresa não encontrada.' });
      } else {
        res.status(200).json({ message: 'Empresa excluída com sucesso!' });
      }
    })
    .catch(error => {
      res
        .status(500)
        .json({ error: 'Erro ao excluir a empresa do banco de dados.' });
    });
});

// Rota para buscar os dados de uma empresa específica
app.get('/empresa', (req, res) => {
  const { id } = req.query;

  Projeto.findById(id)
    .exec()
    .then(empresa => {
      if (!empresa) {
        res.status(404).json({ error: 'Empresa não encontrada.' });
      } else {
        res.status(200).json(empresa);
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Erro ao buscar a empresa.' });
    });
});

// Rota para a página tela_dados_empresas.html
app.get('/tela_dados_empresas.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tela_dados_empresa.html'));
});

// Rota para a página tela_empresas.html
app.get('/tela_empresas.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tela_empresas.html'));
});

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar o servidor
app.listen(4000, () => {
  console.log('Servidor iniciado na porta 4000');
});