type InstagramApp = {

    id: number,
    app_id: string,
    app_secret: string,
    redirect_uri: string,
    access_token: string,
    used?: boolean,
    token_expires_at?:Date
}

export { InstagramApp }