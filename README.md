# Caf.js

Co-design permanent, active, stateful, reliable cloud proxies with your web app.

See https://www.cafjs.com

## Example of Using Shared Maps

Start an app instance with name `admin`. This instance periodically writes into a shared map a random function and its inverse.

Every other instance that you create will read that map and repeatedly apply this function and its inverse.

Our implementation of Sharing Actors guarantees the Atomicity, Isolation, and Fairness properties. Therefore, even though we do not coordinate function changes, the final result is always the original value (i.e., 42).

The map is also replicated in the browser, and since its implementation is based on `Immutable.js`, and reference equality implies deep equality, it is easy for React.js to track changes.
