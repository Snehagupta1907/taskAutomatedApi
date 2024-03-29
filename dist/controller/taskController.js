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
exports.getTasksByUserToken = exports.getTasksByStatus = exports.executeTask = exports.createTask = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const axios_1 = __importDefault(require("axios"));
//task creation post endpoint
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { endpoint, delay, method } = req.query;
    const { to, subject, text } = req.body;
    const user = req.user;
    try {
        if (!user) {
            throw new Error("User not found");
        }
        const taskData = {
            endpoint: endpoint,
            delay: delay ? parseInt(delay) : 0,
            method: method,
            userId: user._id,
        };
        if (taskData.method.toLowerCase() !== "get") {
            if (!to || !subject || !text) {
                throw new Error("Missing required fields: to, subject, text");
            }
            taskData.data = { to, subject, text };
        }
        const task = new Task_1.default(taskData);
        yield task.save();
        console.log("Task saved");
        const { responseData, taskStatus } = yield (0, exports.executeTask)(task);
        res.status(200).json({ responseData, status: taskStatus });
    }
    catch (err) {
        res.status(400).send(err.message);
    }
});
exports.createTask = createTask;
const executeTask = (task) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield new Promise((resolve) => setTimeout(resolve, task.delay));
        const reqData = {
            method: task.method,
            url: task.endpoint,
        };
        if (task.method.toLowerCase() !== "get") {
            reqData.data = task.data;
        }
        const response = yield (0, axios_1.default)(reqData);
        console.log(response.data, "response data");
        let taskStatus;
        if (response.status === 200) {
            task.status = "complete";
            taskStatus = "complete";
        }
        else {
            task.status = "failed";
            taskStatus = "failed";
        }
        yield task.save();
        return { responseData: response.data, taskStatus };
    }
    catch (err) {
        console.error("Error executing task:", err);
        task.status = "failed";
        yield task.save();
        return { responseData: null, taskStatus: "failed" };
    }
});
exports.executeTask = executeTask;
// get task status
const getTasksByStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.params;
    try {
        const tasks = yield Task_1.default.find({ status });
        res.status(200).json(tasks);
    }
    catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getTasksByStatus = getTasksByStatus;
//get task status by user token
const getTasksByUserToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("User not found");
        }
        const tasks = yield Task_1.default.find({ userId: user._id });
        res.status(200).json(tasks);
    }
    catch (err) {
        res.status(400).send(err.message);
    }
});
exports.getTasksByUserToken = getTasksByUserToken;
//# sourceMappingURL=taskController.js.map