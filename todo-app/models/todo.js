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
      Todo.belongsTo(models.User, {
        foreignKey: 'userId'
      })
      // define association here
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({ title: title, dueDate: dueDate, completed: false, userId });
    }

    static getoverdueTodos(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toISOString().split("T")[0],
          },
          userId,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }

    static getdueTodayTodos(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date().toISOString().split("T")[0],
          },
          completed: false,
          userId,
        },
        order: [["id", "ASC"]],
      });
    }

    static async getdueLaterTodos(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date().toISOString().split("T")[0],
          },
          userId,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }

    static async remove(id, userId) {
      return this.destroy({
        where: {
          id,
          userId
        },
      });
    }

    static async getCompletedTodos(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId
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
