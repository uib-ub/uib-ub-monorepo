import { Elysia } from "elysia";
var capitalize = require('capitalize')

const test = capitalize("x hello world");
const message = { message: `Hello Elysia. ${test}` };
const app = new Elysia().get("/", () => message).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
