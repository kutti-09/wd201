"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static addTodo({ title, dueDate }) {
      if (!title) {
        throw new Error("Title is required.");
      }
      if (!dueDate) {
        throw new Error("Due date is required.");
      }
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }
    static getTodos() {
      return this.findAll();
    }
    static getoverdueTodos() {
      return this.findAll({
        where: {
          completed: false,
          dueDate: {
            [Op.lt]: new Date().toISOString().split("T")[0],
          },
        },
      });
    }
    static getdueTodayTodos() {
      return this.findAll({
        where: {
          completed: false,
          dueDate: {
            [Op.eq]: new Date().toISOString().split("T")[0],
          },
        },
      });
    }
    static async getdueLaterTodos() {
      return this.findAll({
        where: {
          completed: false,
          dueDate: {
            [Op.gt]: new Date().toISOString().split("T")[0],
          }
        },
      });
    }
    static async remove(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }
    static async getCompletedTodos() {
      return this.findAll({
        where: {
          completed: true,
        },
        order: [["id", "ASC"]],
      });
    }
    setCompletionStatus(completed) {
      return this.update({ completed: completed });
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
