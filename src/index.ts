import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { ToolbarButtonProvider, ConfigProvider, HotkeyProvider } from 'terminus-core'
import TerminusCoreModule from 'terminus-core'
import { SettingsTabProvider } from 'terminus-settings'

import { EditCommandModalComponent } from './components/editCommandModal.component'
import { QuickCmdsModalComponent } from './components/quickCmdsModal.component'
import { QuickCmdsSettingsTabComponent } from './components/quickCmdsSettingsTab.component'
import { PromptModalComponent } from './components/promptModal.component'

import { ButtonProvider } from './buttonProvider'
import { QuickCmdsConfigProvider } from './config'
import { QuickCmdsSettingsTabProvider } from './settings'
import { QuickCmdsHotkeyProvider } from 'hotkey'

@NgModule({
    imports: [
        NgbModule,
        CommonModule,
        FormsModule,
        TerminusCoreModule,
    ],
    providers: [
        { provide: ToolbarButtonProvider, useClass: ButtonProvider, multi: true },
        { provide: ConfigProvider, useClass: QuickCmdsConfigProvider, multi: true },
        { provide: SettingsTabProvider, useClass: QuickCmdsSettingsTabProvider, multi: true },
        { provide: HotkeyProvider, useClass: QuickCmdsHotkeyProvider, multi: true },
    ],
    entryComponents: [
        PromptModalComponent,
        EditCommandModalComponent,
        QuickCmdsModalComponent,
        QuickCmdsSettingsTabComponent,
    ],
    declarations: [
        PromptModalComponent,
        EditCommandModalComponent,
        QuickCmdsModalComponent,
        QuickCmdsSettingsTabComponent,
    ],
})
export default class QuickCmdsModule { }
