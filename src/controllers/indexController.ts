import { Request, Response } from 'express';

export function index(req: Request, res: Response) {
    res.sendStatus(200);
}
