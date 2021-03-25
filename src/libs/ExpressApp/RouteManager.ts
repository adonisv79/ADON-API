import e from 'express'
import { ExpressApp } from '.'
import fs from 'fs'

const MODULE_NAME = 'EXPRESSAPP_ROUTEMANAGER'

export default class RouteManager {
    private _api: ExpressApp;
    private _routePath: string;

    constructor(api: ExpressApp) {
        this._api = api
        this._routePath = `${this._api.rootDir}/routes`
    }

    async init(): Promise<void> {
        const files = fs.readdirSync(this._routePath)
        const routeNames = files.filter((f) => {
            const fname = f.split('.')
            if (fname.length === 3 && fname[1].toLowerCase() === 'rt' && (fname[2].toLowerCase() === 'ts' || fname[2].toLowerCase() === 'js')){
                return true
            }
        })
        this._api.log.info(`[${MODULE_NAME}]: Found ${routeNames.length} route(s)`)
        if (routeNames.length > 0) {
            for (let i = 0; i < routeNames.length; i++) {
                const router = e.Router()
                const routeFilePath = `${this._routePath}/${routeNames[i]}`
                const loadRouter = await import(routeFilePath)
                this._api.log.info(`[${MODULE_NAME}]: Loading route file ${routeFilePath}`)
                await loadRouter.default(this._api, router)
                const fname = routeNames[i].split('.')
                let routeName = '/'
                if (fname[0].toLowerCase() !== 'index') {
                    routeName = '/' + fname[0].split('_').join('/')
                }
                this._api.express.use(routeName, router)
                this._api.log.info(`[${MODULE_NAME}]: route created for ${routeName}`)
            }
        }
    }
}
