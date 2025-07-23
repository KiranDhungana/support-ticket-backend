import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import prisma from "../services/user.service";
import { generateToken } from "../utils/jwt";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: any, res: any) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({ message: "Invalid Google Token" });
    }

    const { email, name, picture, hd } = payload;

    if (!email || !hd || hd !== "wcpsb.com") {
      return res.status(403).json({ message: "Only college emails allowed" });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || "",
          picture: picture || "",
          role: email === "xx@wcpsb.com" ? "superadmin" : "user",
        },
      });
    }

    const appToken = generateToken(user);

    return res.json({
      token: appToken,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};
