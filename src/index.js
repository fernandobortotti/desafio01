const express = require('express');
const {  v4: uuidv4} = require('uuid') // gera id aleatório

const app = express();

app.use(express.json());

const users = [];

// Middlewares
function checksExistsUserAccount(req, res, next){
    // busca o extrato bancário do cliente
    const { usename } = req.headers;
  
    const user = users.find(user => user.usename === usename);
    
    if(!user){
      return res.status(400).json({err: "Usename not found!"})
    }
    req.user = user;
    return next();
}

// rotas
app.post('/users', (req, res) => {
  const {usename, name} = req.body;
 
  const userAlreadyExist = users.some(
    (user) => user.usename === usename
  );
  if(userAlreadyExist){
    return res.status(400).json({err: "Usename already exists!"});
  }

  users.push({
    usename,
    name,
    id : uuidv4(),
    todos: [],
  });
  console.log(users)
  return res.status(201).send()
});

app.get('/todos', checksExistsUserAccount, (req, res)=> {
  const { user } = req;
  return res.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;

  const { user } = req;

  const todo = {
    id: uuidv4(),
    title, //: 'Nome da tarefa',
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  } 
  user.todos.push(todo)
  //console.log(tudo)
  return res.status(201).send()
});
//:id
app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const {title, deadline} = req.body;
  const {user} = req;
  const { id } = req.params;
 
  const todo = user.todos.find(todo => todo.id === id);
  if(!todo){
    return res.status(404).json({err: "Todo not found"})
  }
  todo.title = title;
  todo.deadline = new Date(deadline);   

  return res.status(201).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const {user} = req;
  const { id } = req.params;
  
  const todo = user.todos.find(todo => todo.id === id);
  if(!todo){
    return res.status(404).json({err: "Todo not found"})
  }
  todo.done = true;

  return res.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const {user} = req;
  const { id } = req.params;
  const todoIndex = user.todos.findIndex(todo => todo.id === id);
  if(todoIndex===-1){
    return res.status(404).json({err: "Todo not found"})
  }
  users.splice(todoIndex, 1)
  return res.status(204)
});

module.exports = app;