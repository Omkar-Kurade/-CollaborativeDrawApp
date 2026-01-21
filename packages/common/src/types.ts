import z from "zod";

export const signUpBody = z.object({
    userName: z.string().min(10).max(20),
    password: z.string().min(8).max(20),
    firstName: z.string().min(2).max(20),
    lastName: z.string().min(2).max(20),
});

export const signInBody = z.object({
    userName: z.string().min(10).max(20),
    password: z.string().min(8).max(20),
});


export const createRoomBody = z.object({
    roomName : z.string().min(4).max(8)
})