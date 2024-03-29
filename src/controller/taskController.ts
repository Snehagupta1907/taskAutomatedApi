import { Request, Response } from "express";
import Task from "../models/Task";
import axios, { AxiosResponse } from "axios";
import User from "../models/User";

export const createTask = async (req: Request, res: Response) => {
  const { endpoint, delay, method } = req.query;
  let { to, subject, text } = req.body;

  try {
    const userToken = req.headers.authorization;

    const user = await User.findOne({ apiKey: userToken });

    if (!user) {
      throw new Error("User not found");
    }

    const taskData: any = {
      endpoint: endpoint as string,
      delay: delay ? parseInt(delay as string) : 0,
      method: method as string,
      userId: user._id,
    };

    if (taskData.method.toLowerCase() !== "get") {
      if (!to || !subject || !text) {
        throw new Error("Missing required fields: to, subject, text");
      }
      taskData.data = { to, subject, text };
    }

    const task = new Task(taskData);

    await task.save();
    console.log("Task saved");

    const { responseData, taskStatus } = await executeTask(task);

    res.status(200).json({ responseData, status: taskStatus });
  } catch (err: any) {
    res.status(400).send(err.message);
  }
};


export const executeTask = async (task: any) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, task.delay));

    const reqData: any = {
      method: task.method,
      url: task.endpoint,
    };

    if (task.method.toLowerCase() !== "get") {
      reqData.data = task.data;
    }

    const response: AxiosResponse = await axios(reqData);

    console.log(response.data, "response data");

    let taskStatus;
    if (response.status === 200) {
      task.status = "complete";
      taskStatus = "complete";
    } else {
      task.status = "failed";
      taskStatus = "failed";
    }

    await task.save();
    return { responseData: response.data, taskStatus };
  } catch (err) {
    console.error("Error executing task:", err);
    task.status = "failed";
    await task.save();
    return { responseData: null, taskStatus: "failed" };
  }
};

export const getTasksByStatus = async (req: Request, res: Response) => {
  const { status } = req.params;

  try {
    const tasks = await Task.find({ status });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTasksByUserToken = async (req: Request, res: Response) => {
  try {
    const userToken = req.headers.authorization;

    const user = await User.findOne({ apiKey: userToken });

    if (!user) {
      throw new Error("User not found");
    }

    const tasks = await Task.find({ userId: user._id });

    res.status(200).json(tasks);
  } catch (err: any) {
    res.status(400).send(err.message);
  }
};
