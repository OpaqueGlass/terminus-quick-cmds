import { Injectable } from '@angular/core'
import { HotkeyDescription, HotkeyProvider } from 'terminus-core'

/** @hidden */
@Injectable()
export class QuickCmdsHotkeyProvider extends HotkeyProvider {
    hotkeys: HotkeyDescription[] = [
        {
            id: 'quick-cmds-show',
            name:'Open quick cmds panel',
        },
    ]

    constructor (
    ) { super() }

    async provide (): Promise<HotkeyDescription[]> {
        return this.hotkeys
    }
}