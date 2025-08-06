
---
title: "Intro to Generator Functions"
date: "2025-08-06 10:16"
publish: true
type: post
tags: []
description: ""
---

Good old JavaScript functions. Familiar and comfortable. We define the function and when we are ready, we can call it and it runs.

```typescript
function greet(name: string) {
    console.log(`Hello ${name}!`)
}

greet('George')
// logs 'Hello George!'
```

Now, have you heard of [Generator Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)? Just by adding a little asterisk (`function*`) we have something that _looks_ like a function - but doesn't behave at all like the functions we know.

We can define it in the same way, but when we call the function, it doesn't run!

```typescript
function* greet(name: string) {
    console.log(`Hello ${name}!`)
}

greet('George')
// ... silence ...
```

So how do we interact with generators? Well when we call the function, instead of a value, we receive a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) object. This object has a `next()` method we can use to actually run the function.

```typescript
const gen = greet('George')
gen.next()
// logs "Hello George"
```

If our function returned a value, this would be passed back as `gen.next().value`.

```typescript
function* greet(name: string) {
    return `Hello ${name}!`
}

const gen = greet('George')
gen.next() // { value: 'Hello George', done: true }
```

Generator functions are interesting because they can pause themselves. This is done through the `yield` keyword.

Each the function executes, it will stop when it hits `yield`. To continue, we must call `.next()` again.

Notice that the `gen.next().done` values indicates whether the function has completed running - or whether it's just paused.

```typescript
function* greet(name: string) {
    yield 'taking a break' // [!code highlight]
    return `Hello ${name}`
}

const gen = greet('George')
gen.next() // { value: 'taking a break', done: false }
gen.next() // { value: 'Hello George', done: true }
```

We can also use these to pause execution while we wait for a Promise to resolve. 

Let's quickly mock up a regular async function we can test this with (using [Simon Willison's wonderful `llm` cli tool](https://github.com/simonw/llm)).

```typescript
import {$} from 'execa';

const llm = {
    prompt: async (prompt: string): Promise<string> => {
        const result = await $`llm ${prompt}`
        return result.stdout.trim()
    }
}

async function suggestFavouriteFood (name: string): Promise<string> {
    const result = await llm.prompt(`You have just met a person with the name "${name}". What might be their favourite food? Be creative! Respond ONLY with the name of the food in quotes and nothing else. For example '"sundried tomatoes"'.`)
    return JSON.parse(result) // strip double quotes
}

const promise = suggestFavouriteFood('George')
await promise
// "gorgonzola cheese-stuffed olives"
```

Let's try to extend our `greet` function to use suggest a favourite food based on the person's name.
Instead of using async/await - let's try `yield`ing the promise.

```typescript
type StringGenerator = Generator<
  // the type of values that will be `yield`ed
  Promise<string>,
  // the function return value
  string,
  // the type of values can be passed to `.next()`
  string
>

function* greet(name: string): StringGenerator {
    const food = yield suggestFavouriteFood(name)
    return `Hello ${name}, would like to try some ${food}?`
}

const gen = greet('George')
gen.next().value // Promise
gen.next().value // "Hello George, would like to try some undefined?"
```

Hmm, that didn't work - instead of food we got `undefined`. We could see our promise was yielded - but how do get the result back into the generator function?

Well, turns out the `gen.next()` method takes an argument!

```typescript
const gen = greet('George')
gen.next().value // Promise
gen.next('mushrooms').value // "Hello George, would like to try some mushrooms")
```

So - all we have to do is await the promise and then pass the result in the following `.next()` call:

```typescript
const gen = greet('George')
const promise = gen.next().value
const promiseResult = await promise
gen.next(promiseResult).value // "Hello George, would like you to try some chocolate-covered strawberries?"
```

It works! But that code is so fragile - what if we `yield` multiple promises? Ideally we would loop through `gen.next()` calls, resolving promises until we are done.

We could a simple `run` helper function that will do this for us:

```typescript
async function run(gen: GreetGenerator) {
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

Nice!
So - we have a function generator that behaves like an async/await function.

But... our `suggestFavouriteFood` is a regular async function. Could we rewrite it to also be a function generator?

We certainly can try!

We can make a few subtle tweaks to our function:

- `async function` → `function*`
- `Promise<string>` → `StringGenerator`
- `await ...` → `yield ...`

```typescript
function* suggestFavouriteFood (name: string): StringGenerator {
    const result = yield llm.prompt(`You have just met a person with the name "${name}". What might be their favourite food? Be creative! Respond ONLY with the name of the food in quotes and nothing else. For example '"sundried tomatoes"'.`)
    return JSON.parse(result) // strip double quotes
}
```

And to keep typescript happy, we need to update our `StringGenerator` type - as our generators may now `yield` other generators!

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

Our `run` helper also needs to handle receiving a generator from `gen.next()`. If the `value` isn't a Promise - then it's a generator instance - and we can resolve it's value by passing it back through `run` again!

```typescript
async function run(gen: StringGenerator) {
    let nextValue: string = ''
    while (true) {
        const { value, done } = gen.next(nextValue)
        if (done) {
            return value
        }
        if (value instanceof Promise) { // [!code highlight]
            nextValue = await value // [!code highlight]
        } else { // [!code highlight]
            nextValue = await run(value) // [!code highlight]
        } // [!code highlight]
    }
}
```

Now we can check that our `greet` function still works, without any changes required!

 ```typescript
console.log(await run(greet('Charlotte')))
// Hello Charlotte, would like to try some butternut squash ravioli?
```

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
    `You have just met a person with the name "${name}". What might be their favourite food? Be creative! Respond ONLY with the name of the food in quotes and nothing else. For example '"sundried tomatoes"'.`,
  )
  return JSON.parse(result) // strip double quotes
}

function* greet(name: string): StringGenerator {
  const food = yield suggestFavouriteFood(name)
  return `Hello ${name}, would like to try some ${food}?`
}

async function run(gen: StringGenerator) {
  let nextValue: string = ""
  while (true) {
    const { value, done } = gen.next(nextValue)
    if (done) {
      return value
    }
    if (value instanceof Promise) {
      nextValue = await value
    } else {
      nextValue = await run(value)
    }
  }
}

console.log(await run(greet("George")))
```
