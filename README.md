# fragments

A microservice application

# How to use this tool

`npm run lint`: run `eslint` and make sure no errors need to be fixed.

`npm start`: is basically `node src/server.js` -> start server manually.

`npm run dev`: run app via `nodemon`, which watches `src/**` folder for any changes, restarting the server whenever something is updated.

`npm run debug`: is the same as `dev` but also starts the node inspector on port `9229`, so that you can attach a debugger (e.g., VSCode).

### Test endpoints (2 ways):

- Go to: `http://localhost:8080/`
- Use in terminal:
  - `curl http://localhost:8080/`
  - `curl -i http://localhost:8080/` for full information
  - `curl -s localhost:8080 | jq` for pretty formatted json file

# Unit Tests using Jest

- `npm test`: to run all tests in `/tests/unit`
- `npm test [testName.test.js]`: to run a specific unit test
