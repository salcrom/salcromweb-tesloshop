import type { NextApiRequest, NextApiResponse } from 'next'

import { IProduct } from 'interfaces';
import { db } from 'database';
import { Product } from 'models';

type Data =
    | {message: string }
    | IProduct[]



export default function handler (req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'GET':
            return getProducts(req, res)
        break;

        case 'PUT':
        case 'POST':

        default:
            return res.status(200).json({ message: 'Example' })
    }
}

const getProducts = async(req: NextApiRequest, res:NextApiResponse<Data>) => {

    await db.connect();

    const products = await Product.find()
        .sort({ title: 'asc' })
        .lean()

    await db.disconnect();

    // TODO:
    // Tendremos que actualizar las imágenes

    res.status(200).json( products )
}
