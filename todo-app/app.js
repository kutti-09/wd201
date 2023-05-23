const express = require("express");
const app = express();
const { Todo, User } = require("./models");
const bodypaser = require("body-parser");
var cookieParser = require("cookie-parser");
app.use(cookieParser("shh! some secret string"));
const path = require("path");
app.use(express.urlencoded({ extended: false }));
const csrf = require("tiny-csrf");
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));


//app.use(csrf({ key: 'csrfToken' }));
module.exports = {
  "**/*.js": ["eslint --fix", "prettier --write"],
};
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const LocalStrategy = require('passport-local');

const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(bodypaser.json());
//set EJS as view engine
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "my-super-key-21728172615261562",
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordfield: 'password'
}, (username, password, done) => {
  User.findOne({ where: { email: username } })
    .then(async (user) => {
      const result = await bcrypt.compare(password, user.password)
      if (result) {
        return done(null, user);
      } else {
        return done("Invalid Password");
      }
    }).catch((error) => {
      return (error)
    })
}));

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then(user => {
      done(null, user)
    })
    .catch(error => {
      done(error, null)
    })
});
app.get("/", async (request, response) => {
  response.render("index", {
    title: "Todo application",
    csrfToken: request.csrfToken(),
  });
});

app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  console.log(request.user)
  const allTodos = await Todo.getTodos();
  const overdueTodos = await Todo.getoverdueTodos();
  const dueTodayTodos = await Todo.getdueTodayTodos();
  const dueLaterTodos = await Todo.getdueLaterTodos();
  const completedTodos = await Todo.getCompletedTodos();
  if (request.accepts("html")) {
    response.render("todos", {
      allTodos,
      overdueTodos,
      dueTodayTodos,
      dueLaterTodos,
      completedTodos,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      allTodos,
      overdueTodos,
      dueTodayTodos,
      dueLaterTodos,
      completedTodos
    });
  }
});

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
app.get("/signup", (request, response) => {
  response.render("signup", { title: "Signup", csrfToken: request.csrfToken() })
});

app.post("/users", csrf.validate, async (request, response) => {
  //Hashing the password using bcrypt
  const hashedPwd = await bcrypt.hash(request.body.Password, saltRounds)
  console.log(hashedPwd)
  try {
    const user = await User.create({
      FirstName: request.body.FirstName,
      LastName: request.body.LastName,
      Email: request.body.Email,
      Password: hashedPwd
    });
    request.login(user, (err) => {
      if (err) {
        console.log(err)
      }
      response.redirect("/todos");
    })
  }
  catch (error) {
    console.log(error);
  }
});
app.get("/login", (request, response) => {
  response.render("login", { title: "Login", csrfToken: request.csrfToken() });
})
app.post("/session", passport.authenticate('local', { failuredirect: "/login" }), (request, response) => {
  console.log(request.user);
  response.redirect("/todos");
})
app.post("/todos", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  console.log("creating a todo", request.body);
  try {
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      userId: request.user.id
    });
    return response.redirect("/todos");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async (request, response) => {

  try {
    const todo = await Todo.findByPk(request.params.id);
    const updatedTodo = await todo.setCompletionStatus(request.body.completed);
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
    const st = await Todo.remove(request.params.id);
    return response.json(st > 0);
  } catch (error) {
    return response.status(422).json(error);
  }
});

module.exports = app;
