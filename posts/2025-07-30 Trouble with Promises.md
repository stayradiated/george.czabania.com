---
title: "Trouble with Promises"
date: "2025-07-30 20:10"
publish: true
type: post
tags: ["structured concurrency", "typescript"]
description: "Exploring the hidden pitfalls of JavaScript Promises: why uncancelled promises can quietly keep running, how it can lead to subtle bugs, and what we can do about it."
---

Today I've been playing around with the [Effection](https://frontside.com/effection/) library. Effection is all about this fun programming concept of "Structured Concurrency". It sounds complicated - and it does take a bit to wrap your head around - but the core idea is pretty simple. 

I'll write more about Structured Concurrency and Effection in the future, but today I want to focus on the problems it's trying to solve. Particularly, the problems around working with Promises.

Let's start with a standard async function which does an HTTP request (using a [Star Wars API](https://swapi.info)).

```typescript
type Person = {
  name: string
}

async function fetchPerson (id: number): Promise<Person> {
  const response = await fetch(`https://swapi.info/api/people/${id}`)
  const person = await response.json() as Person
  return person
}

const person = await fetchPerson(1)
console.log(person.name) // Luke Skywalker
```

This is fine. But what if we want to fetch many people?
For a short list, using `Promise.all` would be enough:

```typescript
const personList = await Promise.all([
  fetchPerson(1),
  fetchPerson(2),
  fetchPerson(3)
])
for (const person of personList) {
  console.log(person.name) // Luke Skywalker, C-3PO, R2-D2
}
```

And this should work - but what happens if one of those requests fails?
Well, `Promise.all` will immediately reject, passing out the error.

Let's fetch some people, but also include a failed promise:

```typescript
async function fail () {
  throw new Error('Fail!')
}

try {
  await Promise.all([
    fetchPerson(1),
    fetchPerson(2),
    fetchPerson(3),
    fail() 
  ])
} catch (error) {
  console.error(error) // Fail!
}
```

**Question: What happens to the `fetch` requests to the Star Wars API?**

Well, they keep on going! And it's not intuitive at all. 
Let's hack `fetch` so we can see which requests we have in progress.

```typescript
const fetchInProgress = new Set<string>()

async function fetch (url: string, init?: RequestInit): Promise<Response> {
  fetchInProgress.add(url)
  try {
    const response = await global.fetch(url, init)
    return response
  } finally {
    fetchInProgress.delete(url)
  }
}
```

Now, we can log the `fetchInProgress` set to see which requests are currently in flight.

When we try it with 3 regular requests, we see an empty set -- as all the requests have been completed:

```typescript
await Promise.all([
  fetchPerson(1),
  fetchPerson(2),
  fetchPerson(3),
])

setImmediate(() =>
  console.log(fetchInProgress)) // Set (0) {}
```

But when we include our `Fail!`, the requests are left in progress!

```typescript
try {
  await Promise.all([
    fetchPerson(1),
    fetchPerson(2),
    fetchPerson(3),
    fail(),
  ])
} catch (error) {
  console.log(error)
}

setImmediate(() =>
  console.log(fetchInProgress))
  
// Set (3) {
//   'https://swapi.info/api/people/1',
//   'https://swapi.info/api/people/2',
//   'https://swapi.info/api/people/3'
// }
```

So that's an issue! We've got these other branches of the code running in the background, and we no longer have a way to reason about them!

```
fetchPerson(1) | =============================>
fetchPerson(2) | =====================================>
fetchPerson(3) | ========================================>
fail()         | ===!
                    ^ program flow continues here
                      while fetchPerson threads run in the background
```

We need a way to tell those `fetchPerson` functions to stop what they are doing.
This is where an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) would be useful. Let's write a new version of our `fetchPerson` function that lets us pass a signal to the `fetch` call.

```typescript
async function fetchPerson (id: number, signal?: AbortSignal): Promise<Person> {
  const response = await fetch(`https://swapi.info/api/people/${id}`, { signal })
  const person = await response.json() as Person
  return person
}
```

Now, when we fetch people, we can pass in an AbortSignal.
When we hit an error, we can send an `abort()` message, which will ensure all our fetch requests are cancelled and we have no more background threads. 

```typescript
const abortController = new AbortController()
try {
  await Promise.all([
    fetchPerson(1, abortController.signal),
    fetchPerson(2, abortController.signal),
    fetchPerson(3, abortController.signal),
    fail(),
  ])
} catch (error) {
  // alert all promises that they should stop now
  abortController.abort()
  console.log(error)
}

setImmediate(() =>
  console.log(fetchInProgress)) // Set (0) {}
```

## Key Takeaways

1. Keeping track of which promises are running in the background isn't obvious by just reading the code. You need runtime logging to understand which parts of your program are currently executing.
2. It is very easy to accidentally leave promises to run in the background. This can lead to all sorts of issues (extra resource usage, deadlocks, general confusion).
3. It's possible to fix this by manually passing around AbortSignals and making sure to catch errors and send `abort()` signals - but it makes the code more complicated and isn't always as easy as with `fetch`.

Next week, I hope to write about the ideas behind Structured Concurrency and how Effection can be used to avoid these complexities.