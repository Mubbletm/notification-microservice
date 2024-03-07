"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRouter = void 0;
const router_1 = __importDefault(require("@koa/router"));
const notification_service_1 = require("../services/notification-service");
const http_exception_1 = require("../interfaces/http-exception");
const cron_validate_1 = __importDefault(require("cron-validate"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.NotificationRouter = new router_1.default();
exports.NotificationRouter.post('/now', ctx => {
    const notification = ctx.request.body.notification;
    const subscription = ctx.request.body.subscription;
    validateNotification(notification);
    validatePushSubscription(subscription);
    console.log(`Pushing requested notification...`);
    (0, notification_service_1.sendNotification)(notification, subscription);
    ctx.status = http_status_codes_1.default.OK;
});
exports.NotificationRouter.post('/schedule', ctx => {
    const notification = ctx.request.body.notification;
    const subscription = ctx.request.body.subscription;
    const dateString = ctx.request.body.date;
    validateNotification(notification);
    validatePushSubscription(subscription);
    validateDate(dateString);
    console.log(`Scheduling new notification for: ${new Date(dateString)}`);
    (0, notification_service_1.scheduledNotification)(notification, subscription, new Date(dateString));
    ctx.status = http_status_codes_1.default.OK;
});
exports.NotificationRouter.post('/cron', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const notification = ctx.request.body.notification;
    const subscription = ctx.request.body.subscription;
    const cron = ctx.request.body.cron;
    validateNotification(notification);
    validatePushSubscription(subscription);
    validateCron(cron);
    console.log(`Scheduling new notification with the following cron: ${cron}`);
    const job = yield (0, notification_service_1.cronNotification)(notification, subscription, cron);
    ctx.body = signJWT((_a = job.attrs._id) === null || _a === void 0 ? void 0 : _a.toHexString());
    ctx.status = http_status_codes_1.default.OK;
}));
exports.NotificationRouter.delete('/cron', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const jwt = ctx.request.headers['job-jwt'];
    console.log(jwt);
    if (!jwt)
        throw new http_exception_1.HTTPExceptions.BadRequestException('Missing JWT token.');
    let hexString;
    try {
        hexString = verifyJWT(jwt);
    }
    catch (e) {
        throw new http_exception_1.HTTPExceptions.Unauthorized('An invalid JWT token was provided.');
    }
    yield (0, notification_service_1.deleteNotification)(hexString);
    ctx.status = http_status_codes_1.default.OK;
    ctx.body = `Successfully deleted notification with id: ${hexString}`;
}));
function validateCron(cron) {
    if (!cron)
        throw new http_exception_1.HTTPExceptions.BadRequestException('Missing cron field in body.');
    const cronResult = (0, cron_validate_1.default)(cron);
    if (cronResult.isError())
        throw new http_exception_1.HTTPExceptions.BadRequestException(`Something is wrong with the submitted cron:\n\t${cronResult.getError().join('\n')}`);
}
function validateDate(date) {
    if (!date)
        throw new http_exception_1.HTTPExceptions.BadRequestException('Missing date field in body.');
    if (isNaN(Date.parse(date)))
        throw new http_exception_1.HTTPExceptions.BadRequestException('An invalid date was submitted in the body.');
}
function validateNotification(notification) {
    if (!notification)
        throw new http_exception_1.HTTPExceptions.BadRequestException('Missing notification field in body.');
    if (!notification.title)
        throw new http_exception_1.HTTPExceptions.BadRequestException('Missing notification.title field in body.');
}
function validatePushSubscription(subscription) {
    if (!subscription)
        throw new http_exception_1.HTTPExceptions.BadRequestException('Missing subscription field in body.');
    if (!subscription.endpoint)
        throw new http_exception_1.HTTPExceptions.BadRequestException('Missing subscription.endpoint field in body.');
    if (!subscription.keys.auth)
        throw new http_exception_1.HTTPExceptions.BadRequestException('Missing subscription.keys.auth field in body.');
    if (!subscription.keys.p256dh)
        throw new http_exception_1.HTTPExceptions.BadRequestException('Missing subscription.keys.p256dh field in body.');
    // if (subscription.expirationTime !== undefined) throw new HTTPExceptions.BadRequestException('Missing subscription.expirationTime field in body.');
}
function signJWT(o, expiresIn) {
    return jsonwebtoken_1.default.sign(o, process.env.JWT_SECRET, expiresIn ? { expiresIn } : undefined);
}
function verifyJWT(JWT) {
    return jsonwebtoken_1.default.verify(JWT, process.env.JWT_SECRET);
}
