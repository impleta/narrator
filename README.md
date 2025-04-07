# Narrator

Narrator is a wrapper for Playwright, allowing for automating web applications via a REPL (Read-Eval-Print Loop).

## Features

This project uses Playwright for web automation. The `WebApplication` class provides methods to initialize a browser, open new pages, and close the browser.

## Installation

To install Narrator, use npm:

```bash
npm install @impleta/narrator
```

## Usage
## Example

Here is a simple example of a script executed by a REPL using narrator:

```javascript
let webApplication = new WebApplication();
await webApplication.initialize();
let homePage = await webApplication.newPage('https://cnn.com');
let title = await homePage.title();

assert.equal(title, 'Breaking News, Latest News and Videos | CNN', 'Title is incorrect');
```

Ideally, wrappers deriving from WebApplication are built for specific applications which provide a domain-specific interface that can then be tested. See examples/GitHubWebUI in the source.

## Documentation

For more detailed documentation, see @impleta/repl-app-tester

## License

This project is licensed under the MIT License.