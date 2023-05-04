const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodypaser = require("body-parser");
app.use(bodypaser.json());
const path = require("path");

//set EJS as view engine
app.set("view engine", "ejs");

app.get("/", async (request, response) => {
    const allTodos = await Todo.getTodos();
    const overdueTodos = await Todo.getoverdueTodos();
    const dueTodayTodos = await Todo.getdueTodayTodos();
    const dueLaterTodos = await Todo.getdueLaterTodos();

    if (request.accepts("html")) {
        response.render('index', { allTodos, overdueTodos, dueTodayTodos, dueLaterTodos });
    } else {
        response.json({ allTodos, overdueTodos, dueTodayTodos, dueLaterTodos });
    }

});

app.use(express.static(path.join(__dirname, 'public')));

app.get("/todos", async (request, response) => {
    console.log("Todo items", response.body);
    try {
        const todo = await Todo.findAll();
        return response.send(todo);
        // return response.json(todo);
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

app.post("/todos", async (request, response) => {
    console.log("creating a todo", request.body);
    try {
        const todo = await Todo.addTodo({
            title: request.body.title,
            dueDate: request.body.dueDate,
            completed: false,
        });
        return response.json(todo);
    } catch (error) {
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
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});
// eslint-disable-line no-unused-vars
app.delete("/todos/:id", async (request, response) => {
    console.log("Delete a todo by ID: ", request.params.id);
    try {
        const deleted = await Todo.destroy({
            where: {
                id: request.params.id,
            },
        });
        response.send(deleted > 0);
        // return response.json(deleted);
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

module.exports = app;
