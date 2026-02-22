import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { signUpBody, signInBody, createRoomBody } from "@repo/common/types";
import { middleware } from "./middleware.js";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db";

const app = express();
app.use(express.json());

app.post("/api/v1/signup", async (req: Request, res: Response) => {
    const parsedData = signUpBody.safeParse(req.body);

    if (!parsedData.success) {
        return res.status(400).json({
            message: "Request validation failed. Please check the provided input.",
            errors: parsedData.error,
        });
    }

    const { userName, password, firstName, lastName } = parsedData.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 5);
        //storing user in database
        await prisma.user.create({
            data: {
                email: userName,
                password: hashedPassword,
                firstName: firstName,
                lastName: lastName,
            },
        });
        res.json({
            message: "Sign up Successfuly !",
        });
    } catch (error) {
        // console.log(error)
        res.json({
            message: ` User already exist with this email!${error}`,
        });
    }
});

app.post("/api/v1/signin", async (req: Request, res: Response) => {
    const parsedData = signInBody.safeParse(req.body);

    if (!parsedData.success) {
        return res.status(400).json({
            message: "Request validation failed. Please check the provided input.",
            errors: parsedData.error,
        });
    }

    const { userName, password } = parsedData.data;

    //check if user exist
    //if exist assign the token
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: userName,
            },
        });

        if (!user) {
            res.status(403).json({
                message: "User does not exist in Database!",
            });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user?.password);

        if (passwordMatch) {
            const token = jwt.sign(
                {
                    userId: user.id,
                },
                JWT_SECRET,
            );

            res.json({
                message: "Signin successfully!",
                token: token,
            });
        } else {
            res.status(400).json({
                message: "signin failed!",
            });
        }
    } catch (error) {
        res.status(403).json({
            message: "Something went Wrong ! Cannot Find User!",
        });
    }
});

app.post("/api/v1/room", middleware, async (req, res) => {
    const parsedData = createRoomBody.safeParse(req.body);

    if (!parsedData.success) {
        res.status(403).json({
            message: "Incorrect input formate",
        });
        return;
    }
    //@ts-ignore Fix this
    const userId = req.userId;

    const { roomName } = parsedData.data;
    try {
        const room = await prisma.room.create({
            data: {
                slug: roomName,
                adminId: userId,
            },
        });

        res.json({
            message: "Room created with id:",
            roomId: room.id,
        });
    } catch (error) {
        res.json({
            message: "Room already exist with this name",
        });
    }
});

app.listen(3001, () => {
    console.log("http-backend is running on localhost:3001");
});
