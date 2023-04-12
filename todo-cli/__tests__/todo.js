/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
let todoList = require("../todo");

const { all, markAsComplete, add, overdue, dueToday, dueLater } = todoList();

describe("Todo List Test Suite", () => {
    beforeAll(() => {
        // Seed the test data
        const today = new Date();
        const oneDay = 60 * 60 * 24 * 1000;
        [
            {
                title: "Reading Newspaper",
                completed: false,
                dueDate: new Date(today.getTime() - 2 * oneDay).toISOString().slice(0, 10),
            },
            {
                title: "Preparing for sem",
                completed: false,
                dueDate: new Date().toISOString().slice(0, 10),
            },
            {
                title: "Assignments",
                completed: false,
                dueDate: new Date(today.getTime() + 2 * oneDay).toISOString().slice(0, 10),
            },
        ].forEach(add);
    });

    test("should increase the number of todo items", () => {
        const initialTodoCount = all.length;
        add({
            title: "A test item",
            completed: false,
            dueDate: new Date().toISOString().slice(0, 10),
        });
        expect(all.length).toEqual(initialTodoCount + 1);
    });

    test("should mark a todo as complete", () => {
        expect(all[0].completed).toEqual(false);
        markAsComplete(0);
        expect(all[0].completed).toEqual(true);
    });

    test("should retrieve overdue items", () => {
        const initialOverdueCount = overdue().length;
        add({
            title: "Overdue test item",
            completed: false,
            dueDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10), // set due date to yesterday
        });
        expect(overdue().length).toEqual(initialOverdueCount + 1);
    });

    test("should retrieve due today items", () => {
        const initialDueTodayCount = dueToday().length;
        add({
            title: "Due today test item",
            completed: false,
            dueDate: new Date().toISOString().slice(0, 10),
        });
        expect(dueToday().length).toEqual(initialDueTodayCount + 1);
    });

    test("should retrieve due later items", () => {
        const initialDueLaterCount = dueLater().length;
        add({
            title: "Due later test item",
            completed: false,
            dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // set due date to tomorrow
        });
        expect(dueLater().length).toEqual(initialDueLaterCount + 1);
    });
});

