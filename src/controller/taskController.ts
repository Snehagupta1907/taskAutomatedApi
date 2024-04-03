// import { Request, Response } from "express";
// import Task,{ITask} from "../models/Task";
// import axios, { AxiosResponse } from "axios";

// //task creation post endpoint
// export const createTask = async (req: Request, res: Response) => {
//   const { endpoint, delay, method } = req.query;
//   const { to, subject, text } = req.body;
//   const user = req.user; 

//   try {
//       if (!user) {
//           throw new Error("User not found");
//       }

//       const taskData: any = {
//           endpoint: endpoint as string,
//           delay: delay ? parseInt(delay as string) : 0,
//           method: method as string,
//           userId: user._id,
//       };

//       if (taskData.method.toLowerCase() !== "get") {
//           if (!to || !subject || !text) {
//               throw new Error("Missing required fields: to, subject, text");
//           }
//           taskData.data = { to, subject, text };
//       }

//       const task = new Task(taskData);

//       await task.save();
//       console.log("Task saved");

//       const { responseData, taskStatus } = await executeTask(task);

//       res.status(200).json({ responseData, status: taskStatus });
//   } catch (err: any) {
//       res.status(400).send(err.message);
//   }
// };



// export const executeTask = async (task: ITask) => {
//   try {
//     await new Promise((resolve) => setTimeout(resolve, task.delay));

//     const reqData: any = {
//       method: task.method,
//       url: task.endpoint,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     };

//     if (task.method.toLowerCase() !== "get") {
//       reqData.data = task.data;
//     }

//     const response: AxiosResponse = await axios(reqData);

//     console.log(response.data, "response data");

//     let taskStatus;
//     if (response.status === 200) {
//       task.status = "complete";
//       taskStatus = "complete";
//     } else {
//       task.status = "failed";
//       taskStatus = "failed";
//     }

//     await task.save();
//     return { responseData: response.data, taskStatus };
//   } catch (err) {
//     console.error("Error executing task:", err);
//     task.status = "failed";
//     await task.save();
//     return { responseData: null, taskStatus: "failed" };
//   }
// };

// // get task status
// export const getTasksByStatus = async (req: Request, res: Response) => {
//   const { status } = req.params;

//   try {
//     const tasks = await Task.find({ status });
//     res.status(200).json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// //get task status by user token
// export const getTasksByUserToken = async (req: Request, res: Response) => {
//   try {
//       const user = req.user; 

//       if (!user) {
//           throw new Error("User not found");
//       }

//       const tasks = await Task.find({ userId: user._id });

//       res.status(200).json(tasks);
//   } catch (err: any) {
//       res.status(400).send(err.message);
//   }
// };

import { Request, Response } from "express";
import Task, { ITask } from "../models/Task";
import axios from "axios";
import  Agenda  from "agenda";
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

const processTaskJob = async (taskId:string) => {
  const task = await Task.findById(taskId);

  if (!task) {
    console.error("Task not found");
    return null;
  }

  try {
    const response = await axios({
      method: task.method,
      url: task.endpoint,
      headers: { "Content-Type": "application/json" },
      data: task.data,
    });

    task.status = response.status === 200 ? "complete" : "failed";
    await task.save();
    console.log("Task processed successfully");
    return task.status; 
  } catch (error) {
    console.error("Error processing task:", error);
    task.status = "failed";
    await task.save();
    return "failed"; 
  }
};

const scheduledTasks:any = {}; 

export const createTask = async (req: Request, res: Response) => {
  const { endpoint, delay, method } = req.query;
  const { to, subject, text } = req.body;
  const user = req.user;

  try {
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

    const scheduledTime = new Date(Date.now() + task.delay);
    const cronPattern = `${scheduledTime.getSeconds()} ${scheduledTime.getMinutes()} ${scheduledTime.getHours()} ${scheduledTime.getDate()} ${scheduledTime.getMonth() + 1} *`;
    console.log("Cron pattern:", cronPattern);
    const taskId = task._id.toString(); 
    console.log(taskId,"tsk id");
    scheduledTasks[taskId] = cron.schedule(cronPattern, async () => {
      console.log("hello")
      await processTaskJob(taskId);
      delete scheduledTasks[taskId];
    });

    res.status(200).json({ 
      message: "Task scheduled successfully",
      taskId: task._id
    });
  } catch (err: any) {
    res.status(400).send(err.message);
  }
};

// Stop all scheduled tasks when the server exits
process.on('exit', () => {
  for (const taskId in scheduledTasks) {
    if (scheduledTasks.hasOwnProperty(taskId)) {
      scheduledTasks[taskId].destroy();
    }
  }
});



export const executeTask = async (task: ITask) => {
  try {
    const response = await axios({
      method: task.method,
      url: task.endpoint,
      headers: { "Content-Type": "application/json" },
      data: task.data,
    });

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
    const user = req.user;

    if (!user) {
      throw new Error("User not found");
    }

    const tasks = await Task.find({ userId: user._id });

    res.status(200).json(tasks);
  } catch (err: any) {
    res.status(400).send(err.message);
  }
};