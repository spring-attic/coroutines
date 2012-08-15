# Coroutines

## Introduction

Provides coroutines for JavaScript. This heavily relies on the monadic
package, and the routines themselves must be written to use a specific
monad provided.

You should really just read the
[test example](http://github.com/five-eleven/coroutines/blob/master/test/test.mjs).

Each coroutine gets a Process ID (`pid`), can spawn new processes, can
yield, can kill other processes. You could easily extend this to
actors/message-passing too by imbuing each process with a mailbox.
