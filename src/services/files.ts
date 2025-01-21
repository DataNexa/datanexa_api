import express, { Request, Response } from 'express'
import path from 'path';
import fs from 'fs'

export default {
    
    types: (req:Request, res:Response) => {
        
        const fileName = `${req.params.file}.d.ts`;
        const path_fim = path.join(__dirname, '../types',fileName)

        fs.readFile(path_fim, 'utf8', (err, data) => {
            if (err) {
                res.status(404).send('Type file not found');
            } else {
                res.send(data); // Envia o conteúdo do tipo como string
            }
        });

        /*
        // para download
        res.sendFile(path_fim, (err) => {
            if (err) {
                res.status(404).send('Type file not found');
            }
        });
        */

    }

}