import bcrypt from "bcrypt";
import User from "../models/User.js";

export const createDefaultAdmin = async () => {
    try {

        const existingAdmin = await User.findOne({
            role: "ADMIN"
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            10
        );

        await User.create({
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: "ADMIN",
            is_verified: true,
        });

        console.log("Default admin created");

    } catch (error) {
        console.error(
            "Failed to create admin:",
            error
        );
    }
};