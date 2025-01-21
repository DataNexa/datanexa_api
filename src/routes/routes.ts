import express, {Express, Request, Response} from "express"

import files from "../services/files"

export default (app:Express) => {

    app.get('/types/:file', files.types)

    return app

}