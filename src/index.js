import express from "express"
import cors from "cors"
import bcrypt from "bcrypt"

const app = express()

app.use(cors())
app.use(express.json())


// -------- variáveis globais --------

let veiculos = []
let id = 1
let usuarios = []
let proximoUsuario = 1


// -------- cadastrar veículos ---------

app.post('/veiculos', (request, response) => {
    const modelo = request.body.modelo 
    const marca = request.body.marca
    const ano = Number(request.body.ano)
    const cor = request.body.cor
    const preco = Number(request.body.preco)

    if(!modelo) {
      response
        .status(400)
        .send(JSON.stringify({ Mensagem: "Favor enviar um modelo válido" }))
    }
  
    if(!marca) {
        response
          .status(400)
          .send(JSON.stringify({ Mensagem: "Favor enviar uma marca válida" }))
      }
    
    if(!ano) {
        response
          .status(400)
          .send(JSON.stringify({ Mensagem: "Favor enviar um ano válido" }))
      }
    
    if(!cor) {
        response
          .status(400)
          .send(JSON.stringify({ Mensagem: "Favor enviar uma cor válida" }))
      }
    
    if(!preco) {
        response
          .status(400)
          .send(JSON.stringify({ Mensagem: "Favor enviar um preço válido" }))
      }


    let novoVeiculo = {
        id : id,
        modelo : modelo,
        marca: marca,
        ano : ano,
        cor : cor,
        preco : preco
    } 

    veiculos.push(novoVeiculo)

    id++

response.status(201).send(
    `Veículo ${modelo}, marca ${marca}, ano ${ano}, ${cor} cadastrado com sucesso! 
     ID ${id}`)
})

// -------- ler todos veículos ---------

app.get('/veiculos',(request,response)=>{

    if(veiculos.length === 0){
        response.status(400).send('Não existe nenhum veículo cadastrado.')
    }

    //ID: 1 | Modelo: Civic| Marca: Honda | Ano: 2014/2015 | Cor: Azul |Preço: R$40.000
    const dadosMapeados = veiculos.map((veiculo)=> `ID: ${veiculo.id} | Modelo: ${veiculo.modelo} | Marca: ${veiculo.marca} | Ano: ${veiculo.ano} | Cor: ${veiculo.cor} | Preço: ${veiculo.preco} | `)

    response.status(200).send(dadosMapeados)

})

// --------  filtrar veículos ----------

app.get('/veiculos/:marca', (request, response) => {
    const marca = request.params.marca; // Captura a marca da URL

    const veiculosFiltrados = veiculos.filter(veiculo => veiculo.marca === marca);

    if (veiculosFiltrados.length === 0) {
        response.status(404).send(JSON.stringify({ Mensagem: "Nenhum veículo encontrado para a marca fornecida" }));
        return;
    }

    const dadosFormatados = veiculosFiltrados.map(veiculo => `ID: ${veiculo.id} | Modelo: ${veiculo.modelo} | Marca: ${veiculo.marca} | Ano: ${veiculo.ano} | Cor: ${veiculo.cor} | Preço: ${veiculo.preco}`);

    response.status(200).send(dadosFormatados);
});


// ---------- Atualizar veiculo ------------

app.put("/veiculos/:idBuscado", (request, response) => {

    const cor = request.body.cor
    const preco = Number(request.body.preco)
  
    const idBuscado = Number(request.params.idBuscado)
  
    if (!idBuscado) {
      response
        .status(400)
        .send(JSON.stringify({ Mensagem: "Favor enviar um ID válido" }))
    }
  
    const idVerificado = veiculos.findIndex((veiculo) => veiculo.id === idBuscado)
  
    if (idVerificado === -1) {
      response
        .status(400)
        .send(JSON.stringify({ Mensagem: "Id do veiculo não encontrado" }))
    }
  
  
    if (idVerificado !== -1) {
      const veiculo = veiculos[idVerificado]
      veiculo.cor = cor
      veiculo.preco = preco

      response.status(200).send(
        JSON.stringify({
          Mensagem: `Veículo ${veiculo.nome} atualizado com sucesso`
        })
      )
    }
  })

// -------------- Remover veículo --------------

app.delete("/veiculos/:idBuscado", (request, response)=> {

    const idBuscado = Number(request.params.idBuscado)
    console.log(idBuscado)

    if(!idBuscado){
        response
            .status(400)
            .send(JSON.stringify({mensagem: 'Favor enviar um ID válido'}))
    }

    const posicaoId = veiculos.findIndex(veiculo => veiculo.id === idBuscado) 

    if (posicaoId === -1){
        response
        .status(400)
        .send(JSON.stringify({mensagem: 'Veículo não encontrado' }))
    } else {
        veiculos.splice(posicaoId, 1)
        response
        .status(200)
        .send(JSON.stringify({mensagem: `veículo deletado com sucesso`}))
    }

    

})

//--------  Criar pessoa usuária -------------

app.post("/signup", async(request,response)=>{

  const data = request.body

  const email = data.email
  const senhaDigitada = data.senhaDigitada

  if(!email){
    response
    .status(400)
    .send(JSON.stringify({ Mensagem: "Favor inserir um email válido" }))
  }

  if(!senhaDigitada){
    response
    .status(400)
    .send(JSON.stringify({ Mensagem: "Favor inserir uma senha válida" }))
  }

  const verificarEmail = usuarios.find((usuario)=> usuarios.email === email)

  if(verificarEmail){
    response
    .status(400)
    .send(JSON.stringify({ Mensagem: "Email já cadastrado no nosso banco de dados" }))
  }

  const senhaCriptografada = await bcrypt.hash(senhaDigitada, 10)

  let novoUsuario ={
    id : proximoUsuario,
    email : data.email, 
    senhaDigitada :senhaCriptografada
  }

  usuarios.push(novoUsuario)

  proximoUsuario++

  response
    .status(201)
    .send(JSON.stringify({ Mensagem: `Pessoa administradora de email ${email}, cadastrada com sucesso!` }))

})

//--------  Login -------------

app.post("/login", async(request, response)=> {

  const data = request.body
  const email = data.email
  const senha = data.senha

  if(!email){
    response
    .status(400)
    .send(JSON.stringify({ Mensagem: "Favor inserir um email válido" }))
  }

  if(!senha){
    response
    .status(400)
    .send(JSON.stringify({ Mensagem: "Favor inserir uma senha válida" }))
  }

  const usuarioLogin = usuarios.find(usuario => usuario.email === email)

  console.log(usuarioLogin)

  const senhaMatch = await bcrypt.compare(senha, usuarioLogin.senhaDigitada)

  console.log(senhaMatch)

  if(!senhaMatch){
    response
    .status(400)
    .send(JSON.stringify({ Mensagem: "Senha não encontrada em nosso banco. Credencial inválida" }))
  }


  response.status(200).send(JSON.stringify({ Mensagem: `Pessoa com email ${email}, foi logada com sucesso! Seja Bem-vinde!` }))




})


app.listen(8080,()=> console.log('Servidor rodando na porta 8080'))