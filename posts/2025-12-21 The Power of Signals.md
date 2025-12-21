---
title: "The Power of Signals"
slug: "the-power-of-signals"
date: "2025-12-21 13:18"
publish: true
type: post
tags: []
description: ""
---

I'm a big fan of the [Signia](https://signia.tldraw.dev/) library. Signia is a minimal, fast, and scalable signals library for TypeScript. It was built by the team at [TLDraw](https://tldraw.dev/) (another excellent product).

There are many libraries available for using signals in Javascript - and there is even [a TC39 proposal to add signals to the language](https://github.com/tc39/proposal-signals).I'm a big fan of the [Signia](https://signia.tldraw.dev/) library. Signia is a minimal, fast, and scalable signals library for TypeScript. It was built by the team at [TLDraw](https://tldraw.dev/) (another excellent product).

There are many libraries available for using signals in JavaScript - and there is even [a TC39 proposal to add signals to the language](https://github.com/tc39/proposal-signals).

We use Signia at [Rough.app](https://rough.app) to build a highly performant web app even when querying large amounts of data. 

## Atomic Signals

In Signia, it all starts with "atoms". An atom is just like a variable - you can store and update its state.

For example, suppose we want to store the name of the currently logged-in user. We can define an atom to hold the first and last names.

```typescript
import { atom } from "signia";

const firstName = atom<string>("firstName", "");
const lastName = atom<string>("lastName", "");
```

We can then update the value of this atom using the `.set` or `.update` methods. The current value of the atom can be accessed via the `.value` property.

```typescript
// overwrite the value
firstName.set("George")
firstName.value // "George"

// mutate the existing value
firstName.update((prevName) => prevName.toUpperCase())
firstName.value // "GEORGE"
```

<Aside variant="info">
<span slot="title">Signal Name</span>

The first argument of the `atom` function is the name of the signal. This is a required argument, but does not need to be unique and is only used for debugging purposes.

</Aside>

By themselves, atoms aren't that interesting. We could do the same thing with a plain old variable. However, what makes atoms magic is that you use them to compute new values. 

## Computed Signals

Computed signals are created using the `computed` function. The value of the signal is equal to the return value of the function.

```typescript
import { computed } from "signia";

firstName.set("George")
lastName.set("Hudson")

const fullName = computed("fullName", () => {
  return `${firstName.value} ${lastName.value}`
})

fullName.value // "George Hudson"
```

This still isn't that impressive - so far, this could all be done with regular variables. But watch this:

```typescript
lastName.set("Mallory")

fullName.value // "George Mallory"
```

As we update the atoms, the computed value is automatically updated.

Now, you might say, Why not just use a function? This seems like a much simpler way of achieving the same behaviour:

```typescript
let firstName = ""
let lastName = ""

let fullName = () => `${firstName} ${lastName}`() 

firstName = "George"
lastName = "Hudson"
fullName() // "George Hudson"

lastName = "Mallory"
fullName() // "George Mallory"
```

One reason signals are better here is that they are lazy - they save you from doing extra work when it's not necessary. If the computed signal is read twice, and the inputs don't change, then it only needs to compute the value once.

Let's track how many times the computed function runs.

```typescript
let i = 0

const fullName = computed("fullName", () => {
  i += 1
  return `${firstName.value} ${lastName.value}`
})

lastName.set("Michael")

fullName.value // "George Michael"
fullName.value // "George Michael"
fullName.value // "George Michael"

i // 1

lastName.set("Hearst")

fullName.value // "George Hearst"
fullName.value // "George Hearst"
fullName.value // "George Hearst"

i // 2
```

As you can see, the computed function only runs when necessary. If the inputs haven't changed, then the computed signal can reuse the previous value it computed. This is great for performance!

## Reacting to changes

Another key advantage of signals is that they can notify us when they change. This is critical when building user interfaces.

For example, we could render the value of the `fullName` signal - and keep the UI up to date as the value changes. We can do this using the `react` function. Note: that this is in no way related to the [React](https://react.dev/) library.

```typescript
import { react } from "signia"

const heading = document.createElement("h1")

const stop = react("render fullName", () => {
  heading.innerText = fullName.value
})

document.addChild(heading)

// call stop() when the heading is no longer being rendered
```

Let's couple this with an input to automatically update the first and last name atoms.

```typescript
const firstNameInput = document.createElement("input");
firstNameInput.placeholder = "First Name";
firstNameInput.value = firstName.value;
document.body.appendChild(firstNameInput);

const lastNameInput = document.createElement("input");
lastNameInput.placeholder = "Last Name";
lastNameInput.value = lastName.value;
document.body.appendChild(lastNameInput);

// whenever the atom changes, update the atom
const handleChange = (atom) => (event) => {
  atom.set(event.currentTarget.value);
}

firstNameInput.addEventListener("input", handleChange(firstName));
lastNameInput.addEventListener("input", handleChange(lastName));
```

Notice how our inputs only update the state of the `firstName` and `lastName` atoms. They are completely unaware of the computed `fullName` value or of rendering it to the UI.

Even so, as you type into the inputs, the full name is instantly calculated and displayed.

This is the power of Signals.

## Learning more

I highly recommend reading [the Signia documentation](https://signia.tldraw.dev/docs/using-signals) to learn more.