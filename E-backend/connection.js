//E/E-backend/connection.env
const mongoose = require('mongoose');
//georgiepetrosiyan_db_user
//T7FnvJ9nFnlz46a5
//mongodb+srv://georgiepetrosiyan_db_user:T7FnvJ9nFnlz46a5@cluster0.ggqnlqn.mongodb.net/?appName=Cluster0



mongoose.connect('mongodb://georgiepetrosiyan_db_user:T7FnvJ9nFnlz46a5@ac-plpzujq-shard-00-00.ggqnlqn.mongodb.net:27017,ac-plpzujq-shard-00-01.ggqnlqn.mongodb.net:27017,ac-plpzujq-shard-00-02.ggqnlqn.mongodb.net:27017/?ssl=true&replicaSet=atlas-wtkpfd-shard-0&authSource=admin&appName=Cluster0')
    .then(() => console.log("Database Successfully connected"))
    .catch(err => console.log(err))