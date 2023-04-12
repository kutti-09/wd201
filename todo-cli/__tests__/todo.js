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
                dueDate: new Date(today.getTime() - 2 * oneDay).toLocaleDateString(
          "en-CA"
        ),
            },
            {
                title: "Preparing for sem",
                completed: false,
                dueDate: new Date().toLocaleDateString(
          "en-CA"
        ),
            },
            {
                title: "Assignments",
                completed: false,
                dueDate: new Date(today.getTime() + 2 * oneDay).toLocaleDateString(
          "en-CA"
        ),
            },
        ].forEach(add);
    });

    test("should increase the number of todo items", () => {
         expect(all.length).toEqual(3);
         add({
            title: "A test item",
            completed: false,
            dueDate: new Date().toLocaleDateString(
          "en-CA"
        ),
        });
        expect(all.length).toEqual(4);
    });

    test("should mark a todo as complete", () => {
        expect(all[0].completed).toEqual(false);
        markAsComplete(0);
        expect(all[0].completed).toEqual(true);
    });

    test("should retrieve overdue items", () => {
        expect(overdue().length).toEqual(1);
    });

    test("should retrieve due today items", () => {
        expect(dueToday().length).toEqual(2);
    });

    test("should retrieve due later items", () => {
        expect(dueLater().length).toEqual(1);
    });
});

