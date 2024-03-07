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
exports.deleteNotification = exports.sendNotification = exports.scheduledNotification = exports.cronNotification = void 0;
const agenda_1 = require("@hokify/agenda");
const web_push_1 = __importDefault(require("web-push"));
const mongodb_1 = require("mongodb");
if (!process.env.DATABASE && process.env.ENVIRONMENT !== 'development') {
    console.error('No database has been configured in your enviroment variables. Quitting application...');
    process.exit();
}
const agenda = new agenda_1.Agenda({ db: { address: process.env.DATABASE }, ensureIndex: true });
web_push_1.default.setVapidDetails('mailto:dev@noahvisser.com', process.env['PUBLIC_VAPID_KEY'], process.env['PRIVATE_VAPID_KEY']);
agenda.define('send notification', (job) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = job.attrs.data.notification;
    const subscription = job.attrs.data.subscription;
    if (subscription.expirationTime && Date.now() > subscription.expirationTime) {
        yield job.remove();
        return;
    }
    yield web_push_1.default.sendNotification(subscription, JSON.stringify(notification));
}));
agenda.processEvery('1 minute');
agenda.start().then(r => console.log('Tasks are running...'));
function cronNotification(notification, subscription, cron) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield agenda.create('send notification', { notification, subscription }).repeatEvery(cron).save();
    });
}
exports.cronNotification = cronNotification;
function scheduledNotification(notification, subscription, date) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield agenda.schedule(date, 'send notification', { notification, subscription });
    });
}
exports.scheduledNotification = scheduledNotification;
function sendNotification(notification, subscription) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield agenda.now('send notification', { notification, subscription });
    });
}
exports.sendNotification = sendNotification;
function deleteNotification(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const _id = mongodb_1.ObjectId.createFromHexString(id);
        return yield agenda.cancel({ _id });
    });
}
exports.deleteNotification = deleteNotification;
