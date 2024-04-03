"use strict";
// import { Request, Response } from "express";
// import Task,{ITask} from "../models/Task";
// import axios, { AxiosResponse } from "axios";
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
var cron = require('node-cron');
// const agenda = new Agenda({ db: { address: process.env.MONGODB_URI } });
// const processTaskJob = async (job: any) => {
//   const task = await Task.findById(job.attrs.data.taskId);
//   if (!task) {
//     console.error("Task not found");
//     return null;
//   }
//   try {
//     const response = await axios({
//       method: task.method,
//       url: task.endpoint,
//       headers: { "Content-Type": "application/json" },
//       data: task.data,
//     });
//     task.status = response.status === 200 ? "complete" : "failed";
//     await task.save();
//     console.log("Task processed successfully");
//     return task.status; 
//   } catch (error) {
//     console.error("Error processing task:", error);
//     task.status = "failed";
//     await task.save();
//     return "failed"; 
//   }
// };
// agenda.define("process task", async (job: any) => {
//   const taskStatus = await processTaskJob(job);
//   if (taskStatus === "complete") {
//     console.log("Task is done");
//   }
// });
// (async () => {
//   await agenda.start();
// })();
// // Task creation endpoint
// export const createTask = async (req: Request, res: Response) => {
//   const { endpoint, delay, method } = req.query;
//   const { to, subject, text } = req.body;
//   const user = req.user;
//   try {
//     if (!user) {
//       throw new Error("User not found");
//     }
//     const taskData: any = {
//       endpoint: endpoint as string,
//       delay: delay ? parseInt(delay as string) : 0,
//       method: method as string,
//       userId: user._id,
//     };
//     if (taskData.method.toLowerCase() !== "get") {
//       if (!to || !subject || !text) {
//         throw new Error("Missing required fields: to, subject, text");
//       }
//       taskData.data = { to, subject, text };
//     }
//     const task = new Task(taskData);
//     await task.save();
//     console.log("Task saved");
//     const scheduledTime = new Date(Date.now() + task.delay);
//     await agenda.schedule(scheduledTime, "process task", { taskId: task._id });
//     res.status(200).json({ 
//       message: "Task scheduled successfully",
//       taskId: task._id
//     });
//   } catch (err: any) {
//     res.status(400).send(err.message);
//   }
// };
const processTaskJob = (taskId) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield Task_1.default.findById(taskId);
    if (!task) {
        console.error("Task not found");
        return null;
    }
    try {
        const response = yield (0, axios_1.default)({
            method: task.method,
            url: task.endpoint,
            headers: { "Content-Type": "application/json" },
            data: task.data,
        });
        task.status = response.status === 200 ? "complete" : "failed";
        yield task.save();
        console.log("Task processed successfully");
        return task.status;
    }
    catch (error) {
        console.error("Error processing task:", error);
        task.status = "failed";
        yield task.save();
        return "failed";
    }
});
const scheduledTasks = {};
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
        const scheduledTime = new Date(Date.now() + task.delay);
        const cronPattern = `${scheduledTime.getSeconds()} ${scheduledTime.getMinutes()} ${scheduledTime.getHours()} ${scheduledTime.getDate()} ${scheduledTime.getMonth() + 1} *`;
        console.log("Cron pattern:", cronPattern);
        const taskId = task._id.toString();
        console.log(taskId, "tsk id");
        scheduledTasks[taskId] = cron.schedule(cronPattern, () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("hello");
            yield processTaskJob(taskId);
            delete scheduledTasks[taskId];
        }));
        res.status(200).json({
            message: "Task scheduled successfully",
            taskId: task._id
        });
    }
    catch (err) {
        res.status(400).send(err.message);
    }
});
exports.createTask = createTask;
// Stop all scheduled tasks when the server exits
process.on('exit', () => {
    for (const taskId in scheduledTasks) {
        if (scheduledTasks.hasOwnProperty(taskId)) {
            scheduledTasks[taskId].destroy();
        }
    }
});
const executeTask = (task) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, axios_1.default)({
            method: task.method,
            url: task.endpoint,
            headers: { "Content-Type": "application/json" },
            data: task.data,
        });
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