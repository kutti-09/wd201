/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const request = require("supertest");
var cheerio = require("cheerio");

const { QueryTypes } = require("sequelize");
const db = require("../models/index");
const express = require("express");
const app = require("../app");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const { DESCRIBE } = require("sequelize");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    Email: username,
    Password: password,
    _csrf: csrfToken,
  });
};

describe("Todo test suite", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => { });
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/user").send({
      FirstName: "Test",
      LastName: "User A",
      Email: "user.a@test.com",
      Password: "12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(404);
  });

  test("sign out", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });

  test("Creates a new todo", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy fruits",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(500);
  });

  test("Marks a todo as complete", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy fruits",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken
    });
    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueTodayTodos.length;
    const latestTodo = parsedGroupedResponse.dueTodayTodos[dueTodayCount - 1];
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: true,
      });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });
  test("Marks a todo with given ID as incomplte", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueTodayTodos.length;
    const latestTodo = parsedGroupedResponse.dueTodayTodos[dueTodayCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const markInCompleteResponse1 = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: false,
      });

    const parsedUpdateResponse1 = JSON.parse(markInCompleteResponse1.text);
    expect(parsedUpdateResponse1.completed).toBe(false);
  });
  test("Deletes a todo ", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy fruits",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueTodayTodos.length;
    const latestTodo = parsedGroupedResponse.dueTodayTodos[dueTodayCount - 1];
    const todoID = latestTodo.id;
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const deleteTodo = await agent.delete(`/todos/${latestTodo}`).send({
      _csrf: csrfToken,
    });
    expect(deleteTodo.statusCode).toBe(200);
  });
});
