---
slug: "generator-functions"
title: "Intro to Generator Functions"
date: "2025-08-06 10:16"
publish: true
tags: ["javascript", "typescript", "generators", "async"]
description: "Learn how generator functions work by building your own async/await from scratch."
---

Good old JavaScript functions. Familiar and comfortable. We define the function, and when we are ready, we can call it, and it runs.

```typescript
function greet(name: string) {
  console.log(`Hello ${name}!`)
}

greet('George')
// logs 'Hello George!'
```

Have you heard of [Generator Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)? Just by adding a little asterisk (`function*`), we have something that _looks_ like a function - but doesn't behave at all like the functions we know.

The most obvious difference is that when we call the function, it doesn't seem to run!

```typescript
function* greet(name: string) {
  console.log(`Hello ${name}!`)
}

greet('George')
// ... silence ...
```

So how do we run generator functions? Well, when we first call the function, we get back a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) object. This object has a [`.next()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator/next) method we can use to execute the function.

```typescript
const gen = greet('George')
gen.next()
// logs "Hello George"
```

The `.next()` method returns an object with two properties:
- `value`: the return value of the function
- `done`: a boolean, telling us whether the function has completed

Let's update our greet function to return a value (instead of logging it):

```typescript
function* greet(name: string) {
  return `Hello ${name}!` // [!code highlight]
}

const gen = greet('George')
gen.next() // { value: 'Hello George', done: true } // [!code highlight]
```

## Yield

Generator functions are interesting because they can pause themselves. This is done through the `yield` keyword.

When the function executes, it will pause when it hits a `yield`. The value that is yielded is passed back by `.next()` as `.value`. When the function is paused, the `.done` boolean will be `false` (as the function isn't done - it's only paused!).

To continue execution, we must call `.next()` _again_.

```typescript
function* greet(name: string) {
  yield 'taking a break' // [!code highlight]
  return `Hello ${name}`
}

const gen = greet('George')
gen.next() // { value: 'taking a break', done: false }
gen.next() // { value: 'Hello George', done: true }

// we can continue calling next() - but nothing happens…
gen.next() // { value: undefined, done: true }
```

The `yield` keyword not only passes value _out_ of the generator function, but also can also _receive_ values!

When we resume execution with `.next()`, we may pass a value argument that the `yield` keyword will be assigned to.

Check this out:

```typescript
function* greet(name: string) {
  const verb = yield // [!code highlight]
  return `${verb} ${name}`
}

const gen = greet('George')
gen.next()      // { value: undefined, done: false }
gen.next('Hey') // { value: 'Hey George', done: true } // [!code highlight]
```

## Promises

We can use Generator Functions to pause execution while we wait for a Promise to resolve. 

This will be very similar to how async functions work, where they pause while awaiting a promise.

Our generator function could yield a Promise, pause, and we could then resume execution with the promise's resolved value.

I'm going to define a little async function we can play with. I'll be using:
- [Simon Willison's `llm` cli tool](https://github.com/simonw/llm): to interact with LLM models
- [Sindre Sorhus's `execa` library](https://github.com/sindresorhus/execa): to run cli tools and get the output easily

```typescript
import { $ } from 'execa';

const llm = {
  prompt: async (prompt: string): Promise<string> => {
    const result = await $`llm ${prompt}`
    return result.stdout.trim()
  }
}

async function suggestFavouriteFood (name: string): Promise<string> {
  const result = await llm.prompt(`You have just met a person with the name "${name}". What might be their favourite food? Be creative! Respond ONLY with the name of the food in quotes and nothing else. For example, '"sundried tomatoes"'.`)
  return JSON.parse(result) // strip double quotes
}

const promise = suggestFavouriteFood('George')
await promise
// "gorgonzola cheese-stuffed olives"
```

Let's try to extend our `greet` function to suggest a favourite food based on the person's name.
Instead of using async/await - let's try `yielding` the promise.

```typescript
function* greet(name: string): Generator {
  const food = yield suggestFavouriteFood(name)
  return `Hello ${name}, would you like to try some ${food}?`
}

const gen = greet('George')

gen.next().value
// Promise<string>

gen.next().value
// "Hello George, would you like to try some undefined?"
```

> Hello George, would you like to try some undefined?

Well, that didn't work - instead of food, we got `undefined`. We could see our promise was yielded - but we need to pass the result back into the generator function. Let's try that again.

```typescript
const gen = greet('George')

const promise = gen.next().value
const promiseResult = await promise

gen.next(promiseResult).value
// "Hello George, would you like to try some chocolate-covered strawberries?"
```

Yay! We manually executed our generator function!

### TypeScript

A quick note about the types.

Our `greet` function currently returns a type of `Generator`. By default, this means that our `yield` calls are untyped.  We could yield any value and continue execution with any value.

If we want type safety, we can customise the `Generator` type to describe our generator function.

```typescript
type StringGenerator = Generator<
  // the type of values that can be `yield`ed
  Promise<string>,
  // the function return value
  string,
  // the type of values can be passed to `.next()`
  string
>

function* greet (name: string): StringGenerator {
  // ...
}
```

Now, if we were to try to `yield 123` or `.next(456)`, TypeScript will warn us that our values aren't the right type for this function.

## Run with Loops

We can execute our `greet` function - but the code for running it is tightly coupled to its internal workings. We have to know that it first yields a promise and then returns a value.

What if we were to modify `greet` to `yield` multiple promises?

We can create a helper function that iterates through the generator, continuously calling`gen.next()` and resolving promises until the function says it is `done: true`.

**By writing our own runner, we are in control of how our code executes!**

Let's start with a simple runner that can resolve promises for us.

```typescript
async function run(gen: StringGenerator) {
  let nextValue: string = ''
  while (true) {
    const { value, done } = gen.next(nextValue)
    if (done) {
      return value
    }
    nextValue = await value
  }
}

await run(greet('James'))
// Hello James, would you like to try some truffle risotto?
```

Isn't that cool?
We can execute a generator function as if it were a regular async function.

## Errors

What happens if the promise fails? I would like the same behaviour as if we used `await` - our generator function should throw an error - but how?

Calling `gen.next(error)` will yield the error as a value. Which is close - but not quite right - as it won't `throw` the error - the function will continue to execute.

Fortunately, the Generator has another method we can use:
[`gen.throw()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator/throw)! This makes the function act as if the `yield` _threw_ the error. The generator function may wrap the yield in a try/catch and handle it or let it escalate.

A quick example:

```typescript
function* neverfail () {
  try {
    yield 42
  } catch (error: unknown) {
    return `Caught error: ${error}`
  }
  return 'Nothing happened…'
}

const gen = neverfail()

// start running the function - pausing when we reach the first `yield`
gen.next()
// { value: 42, done: false }

// inject an exception and resume execution
gen.throw(new Error('Oops'))
// { value: "Caught error: Oops", done: true }
```

For our `run` function, we can handle errors and pass them back into the
generator.

This does make the logic a little more complicated, as we need to switch between calling `gen.next()` and `gen.throw()` - depending on whether the last promise resolved or rejected:

```typescript
async function run(gen: StringGenerator): Promise<string> {
  let cmd: ["next", string] | ["throw", unknown] = ["next", ""]

  while (true) {
    const result: IteratorResult<Promise<string> | StringGenerator, string> =
      cmd[0] === "next"
        ? gen.next(cmd[1])
        : gen.throw(cmd[1])

    if (result.done) {
      return result.value
    }

    try {
      cmd = ["next", await result.value]
    } catch (error) {
      cmd = ["throw", error]
    }
  }
}
```

Now we can update our greet function to have a safe fallback in case it's not working..

```typescript
function* greet(name: string): StringGenerator {
  let food: string
  try {
    food = yield suggestFavouriteFood(name)
  } catch {
    food = "pizza"
  }
  return `Hello ${name}, would you like to try some ${food}?`
}
```

If I try running our `greet` function with the `llm` tool not installed, execa will throw an error, which is piped through our `run` function and then caught by our try/catch.

```typescript
await run(greet('Simon'))
// Hello Simon, would you like to try some pizza?
```

## Refactoring Async Functions into Generators

Our `suggestFavouriteFood` is a regular async function. Could we rewrite it to also be a function generator? We certainly can try!

With a few tweaks, we can convert an async function into a function generator.

- `async function` → `function*`
- `Promise<string>` → `StringGenerator`
- `await ...` → `yield ...`

```typescript
function* suggestFavouriteFood (name: string): StringGenerator {
  const result = yield llm.prompt(`You have just met a person with the name "${name}". What might be their favourite food? Be creative! Respond ONLY with the name of the food in quotes and nothing else. For example, '"sundried tomatoes"'.`)
  return JSON.parse(result) // strip double quotes
}
```

To keep typescript happy, we need to update our `StringGenerator` type - as our generators may now `yield` other generators!

```typescript
type StringGenerator = Generator<
  // yield value
  Promise<string> | StringGenerator, // [!code highlight]
  // function return value
  string,
  // result of yielding
  string
>
```

Our `run` helper also needs to handle receiving a generator from `gen.next()`. If the `value` isn't a Promise, then it's a generator instance - and we can resolve its value by passing it back through `run` again!

```typescript
async function run(gen: StringGenerator): Promise<string> {
  let cmd: ["next", string] | ["throw", unknown] = ["next", ""]

  while (true) {
    const result: IteratorResult<Promise<string> | StringGenerator, string> =
      cmd[0] === "next" ? gen.next(cmd[1]) : gen.throw(cmd[1])

    if (result.done) {
      return result.value
    }

    try {
      if (result.value instanceof Promise) { // [!code highlight]
        cmd = ["next", await result.value] // [!code highlight]
      } else { // [!code highlight]
        cmd = ["next", await run(result.value)] // [!code highlight]
      } // [!code highlight]
    } catch (error) {
      cmd = ["throw", error]
    }
  }
}
```

Now we can check that our `greet` function still works, without any changes required!

 ```typescript
console.log(await run(greet('Charlotte')))
// Hello Charlotte, would you like to try some butternut squash ravioli?
```

## Why Would You Ever Want This?

At this point, you might be thinking: "This seems like a more complicated way to write async/await - why bother?"

You're right! For everyday async code, `async/await` is easier to understand and more straightforward. But generators give us something powerful: control over execution.

With our `run` function, we're in charge of how the code executes. This lets us do things that `async/await` cannot.

- **Cancellation**: We could stop a generator mid-execution if we no longer need its result
- **Testing**: We can step through generator functions manually, making complex flows easier to test
- **Custom behaviour**: We could add logging, retries, or timeouts to every yielded operation
- **Beyond Promises**: Generators can yield anything - not just Promises. This lets us build abstractions for different kinds of "effects"

Libraries like [Effect.ts](https://effect.website/) and [Effection](https://frontside.com/effection) use this pattern as the foundation for [structured concurrency](https://vorpus.org/blog/notes-on-structured-concurrency-or-go-statement-considered-harmful/) in JavaScript.

While you might not reach for generators in your everyday code, understanding how they work opens up new ways of thinking about async operations. 

## Final Code Example

Here is the final code in full:

```typescript
import { $ } from "execa"

const llm = {
  prompt: async (prompt: string): Promise<string> => {
    const result = await $`llm ${prompt}`
    return result.stdout.trim()
  },
}

type StringGenerator = Generator<
  // the type of values that will be `yield`ed
  Promise<string> | StringGenerator,
  // the function return value
  string,
  // the type of values can be passed to `.next()`
  string
>

function* suggestFavouriteFood(name: string): StringGenerator {
  const result = yield llm.prompt(
    `You have just met a person with the name "${name}". What might be their favourite food? Be creative! Respond ONLY with the name of the food in quotes and nothing else. For example, '"sundried tomatoes"'.`,
  )
  return JSON.parse(result) // strip double quotes
}

function* greet(name: string): StringGenerator {
  let food: string
  try {
    food = yield suggestFavouriteFood(name)
  } catch {
    food = 'pizza'
  }
  return `Hello ${name}, would you like to try some ${food}?`
}

async function run(gen: StringGenerator): Promise<string> {
  let cmd: ["next", string] | ["throw", unknown] = ["next", ""]

  while (true) {
    const result: IteratorResult<Promise<string> | StringGenerator, string> =
      cmd[0] === "next"
        ? gen.next(cmd[1])
        : gen.throw(cmd[1])

    if (result.done) {
      return result.value
    }

    try {
      if (result.value instanceof Promise) {
        cmd = ["next", await result.value]
      } else {
        cmd = ["next", await run(result.value)]
      }
    } catch (error) {
      cmd = ["throw", error]
    }
  }
}

console.log(await run(greet("George")))
```
