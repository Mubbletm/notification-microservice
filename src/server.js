"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const koa_1 = __importDefault(require("koa"));
const router_1 = __importDefault(require("@koa/router"));
const bodyparser_1 = require("@koa/bodyparser");
const http_exception_1 = require("./app/interfaces/http-exception");
const koa_static_1 = __importDefault(require("koa-static"));
const error_handler_1 = __importDefault(require("./app/middleware/error-handler"));
const notification_router_1 = require("./app/middleware/notification-router");
const cors_1 = __importDefault(require("@koa/cors"));
const app = new koa_1.default();
const notFoundHandler = new router_1.default();
notFoundHandler.get(/.*/, (ctx) => {
    throw new http_exception_1.HTTPExceptions.NotFoundException(`Endpoint ${ctx.path} doesn't exist.`);
});
app.use(error_handler_1.default);
app.use((0, cors_1.default)({ allowMethods: ['GET', 'DELETE', 'POST', 'OPTIONS'] }));
app.use((0, koa_static_1.default)('./src/public', { extensions: ['html'] }));
app.use((0, bodyparser_1.bodyParser)());
app.use(notification_router_1.NotificationRouter.routes());
app.use(notification_router_1.NotificationRouter.allowedMethods());
app.use(notFoundHandler.routes());
app.listen(8000);
console.log('Server is running on http://127.0.0.1:8000');
