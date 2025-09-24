import { test as baseTest, expect } from "vitest"

import { completeTodo, createTodo, deleteTodo, type Todo } from "#lib/db/todos.js"

const test = baseTest.extend<{
  todo: Todo
}>({
  todo: async ({}, use) => {
    // setup
    const todo = await createTodo()

    // pass our value to the test
    // and then wait until the test completes
    await use(todo)

    // teardown
    await deleteTodo(todo)
  },
})

test("should complete a todo", async ({ todo }) => {
  const updatedTodo = await completeTodo(todo)
  expect(updatedTodo.completed).toBe(true)
})
