const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodypaser = require("body-parser");
app.use(bodypaser.json());
const path = require("path")

app.set("view engine", "ejs");
app.get("/", async (request, response) => {
    const allTodos = await Todo.getTodos();
    if (request.accepts("html")) {
        response.render('index', {
            allTodos
        });

    }
    else {
        response.json({
            allTodos
        })
    }
});
app.get("/todos", async (request, response) => {
    console.log("Todo items", response.body);
    try {
        const todo = await Todo.findAll();
        return response.send(todo);
        // return response.json(todo);
    }
    catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});
app.use(express.static(path.join(__dirname, 'public')));
app.post("/todos", async (request, response) => {
    console.log("creating a todo", request.body);
    try {
        const todo = await Todo.addTodo({
            title: request.body.title,
            dueDate: request.body.dueDate,
            completed: false,
        });
        return response.json(todo);
    }
    catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

app.put("/todos/:id/markAsCompleted", async (request, response) => {
    console.log("we have to update a todo with ID:", request.params.id);
    const todo = await Todo.findByPk(request.params.id);
    try {
        const updatedTodo = await todo.markAsCompleted();
        return response.json(updatedTodo);
    }
    catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

app.delete("/todos/:id", async (request, response) => {
    console.log("Delete a todo by ID: ", request.params.id);
    try {
        const deleted = await Todo.destroy({
            where: {
                id: request.params.id,
            },
        });
        response.send(deleted > 0);
    }
    catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

module.exports = app;
