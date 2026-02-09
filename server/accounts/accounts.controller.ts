import express, {Router} from "express";
import { z } from "zod";

const router: Router = express.Router();

const accountsSchema = () => {
    const schema = z.object()
}



router.post("/createUser", createUserSchema, createUserController);
router.post("/deleteUser", deleteUserSchema, deleteUserController);
router.post("/updateUser", updateUserSchema, updateUserController);
router.post("/updateUserStatus", updateUserStatusSchema, updateUserStatusController);