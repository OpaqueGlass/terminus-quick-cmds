import { Component } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { ConfigService, AppService, BaseTabComponent, SplitTabComponent } from 'terminus-core'
import { QuickCmds, ICmdGroup } from '../api'
import { BaseTerminalTabComponent as TerminalTabComponent } from 'terminus-terminal';


@Component({
    template: require('./quickCmdsModal.component.pug'),
    styles: [require('./quickCmdsModal.component.scss')],
})
export class QuickCmdsModalComponent {
    cmds: QuickCmds[]
    quickCmd: string = ''
    appendCR: boolean
    childGroups: ICmdGroup[]
    groupCollapsed: {[id: string]: boolean} = {}
    selectedIndex: number = -1  // 用于追踪选中的命令索引
    selectedGroupIndex: number = 0  // 用于追踪选中的组索引

    constructor (
        public modalInstance: NgbActiveModal,
        private config: ConfigService,
        private app: AppService,
    ) { }

    ngOnInit () {
        this.cmds = this.config.store.qc.cmds
        this.appendCR = true
        this.refresh()
    }

    quickSend () {
        this._send(this.app.activeTab, this.quickCmd + (this.appendCR ? "\n" : ""))
        this.close()
    }

    quickSendAll() {
        this._sendAll(this.quickCmd + (this.appendCR ? "\n" : ""))
        this.close()
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async _send (tab: BaseTabComponent, cmd: string) {    
        
        if (tab instanceof SplitTabComponent) {
            this._send((tab as SplitTabComponent).getFocusedTab(), cmd)
        }
        if (tab instanceof TerminalTabComponent) {
            let currentTab = tab as TerminalTabComponent
            console.log("tab", currentTab);
            console.log("Sending " + cmd);

            let cmds=cmd.split(/(?:\r\n|\r|\n)/)

            for(let i = 0; i < cmds.length; i++) {
                let cmd = cmds[i];
                console.log("Sending " + cmd);


                if(cmd.startsWith('\\s')){
                    cmd=cmd.replace('\\s','');
                    let sleepTime=parseInt(cmd);

                    await this.sleep(sleepTime);

                    console.log('sleep time: ' + sleepTime);
                    continue;
                }

                if(cmd.startsWith('\\x')){
                    cmd = cmd.replace(/\\x([0-9a-f]{2})/ig, function(_, pair) {
                            return String.fromCharCode(parseInt(pair, 16));
                        });
                }
                if (i != cmds.length - 1) {
                    cmd = cmd + "\n";
                }
                currentTab.sendInput(cmd);
            }

        }
    }

    _sendAll (cmd: string) {
        for (let tab of this.app.tabs) {
            if (tab instanceof SplitTabComponent) {
                for (let subtab of (tab as SplitTabComponent).getAllTabs()) {
                    this._send(subtab, cmd)
                }
            } else {
                this._send(tab, cmd)
            }
        }
    }

    close () {
        this.modalInstance.close()
        this.app.activeTab.emitFocused()
    }

    send (cmd: QuickCmds, event: MouseEvent) {
        console.log("cmd", cmd.text, "appendCR", cmd.appendCR)
        if (event.ctrlKey) {
            this._sendAll(cmd.text + (cmd.appendCR ? "\n" : ""))
        }
        else {
            this._send(this.app.activeTab, cmd.text + (cmd.appendCR ? "\n" : ""))
        }
        this.close()
    }

    clickGroup (group: ICmdGroup, event: MouseEvent) {
        if (event.shiftKey) {
            if (event.ctrlKey) {
                for (let cmd of group.cmds) {
                    this._sendAll(cmd.text + (cmd.appendCR ? "\n" : ""))
                }
            }
            else {
                for (let cmd of group.cmds) {
                    this._send(this.app.activeTab, cmd.text + (cmd.appendCR ? "\n" : ""))
                }
            }
        }
        else {
            this.groupCollapsed[group.name] = !this.groupCollapsed[group.name]
        }
    }

    refresh () {
        this.childGroups = []
        this.selectedIndex = -1

        let cmds = this.cmds
        if (this.quickCmd) {
            cmds = cmds.filter(cmd => (cmd.name + cmd.group + cmd.text).toLowerCase().includes(this.quickCmd.toLowerCase()))
        }

        for (let cmd of cmds) {
            cmd.group = cmd.group || null
            let group = this.childGroups.find(x => x.name === cmd.group)
            if (!group) {
                group = {
                    name: cmd.group,
                    cmds: [],
                }
                this.childGroups.push(group)
            }
            group.cmds.push(cmd)
        }
    }

    handleKeydown(event: KeyboardEvent) {
        if (event.key === 'ArrowDown') {
            this.selectNextCmd();
            event.stopImmediatePropagation();
            event.stopPropagation();
            // this.selectedIndex = (this.selectedIndex + 1) % this.childGroups.length
            event.preventDefault()
        } else if (event.key === 'ArrowUp') {
            // this.selectedIndex = (this.selectedIndex - 1 + this.childGroups.length) % this.childGroups.length
            this.selectPreviousCmd();
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault()
        } else if (event.key === 'Enter') {
            if (this.selectedIndex >= 0 && this.selectedIndex < this.childGroups.length) {
                const group = this.childGroups[this.selectedIndex]
                if (group.cmds.length > 0) {
                    this.send(group.cmds[0], new MouseEvent('click', {ctrlKey: event.ctrlKey}))
                }
            } else {
                this.quickSend()
            }
            event.preventDefault()
        }
    }
    selectPreviousCmd() {
        if (this.selectedIndex > 0) {
            this.selectedIndex--;
        } else if (this.selectedGroupIndex > 0) {
            this.selectedGroupIndex--;
            this.selectedIndex = this.childGroups[this.selectedGroupIndex].cmds.length - 1;
        } else {
            this.selectedGroupIndex = this.childGroups.length - 1;
            this.selectedIndex = this.childGroups[this.selectedGroupIndex].cmds.length - 1;
        }
    }
    
    selectNextCmd() {
        if (this.selectedIndex < this.childGroups[this.selectedGroupIndex].cmds.length - 1) {
            this.selectedIndex++;
        } else if (this.selectedGroupIndex < this.childGroups.length - 1) {
            this.selectedGroupIndex++;
            this.selectedIndex = 0;
        } else {
            this.selectedGroupIndex = 0;
            this.selectedIndex = 0;
        }
    }
}
