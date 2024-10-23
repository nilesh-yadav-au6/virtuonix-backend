import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response<any, Record<string, any>> {
  const token = req.signedCookies.token;

  if (token && token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(
    token as string,
    process.env.JWT_SECRET as string,
    (err: jwt.VerifyErrors | null, user: string | JwtPayload | undefined) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    }
  );
}
