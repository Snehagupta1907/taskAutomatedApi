# Background Task API Service

This API service handles background tasks for your application. Tasks can include sending emails, making HTTP requests, or any other asynchronous operation.

## Features

- Accepts task details such as endpoint, data, delay, and HTTP method.
- Provides bearer token authentication to authorize requests.
- Records tasks with status "queued" upon receipt.
- Executes tasks after the specified delay, marking them as "complete" upon execution.
- Provides endpoints to retrieve lists of tasks for a given bearer token and tasks filtered by status.

## Base url

https://task-automated-api.vercel.app/api
