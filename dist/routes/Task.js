"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controller/taskController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.send('Hello World');
});
router.post('/tasks', auth_1.authenticateToken, taskController_1.createTask);
router.get('/tasks/:status', taskController_1.getTasksByStatus);
router.get('/tasks', auth_1.authenticateToken, taskController_1.getTasksByUserToken);
exports.default = router;
//# sourceMappingURL=Task.js.map