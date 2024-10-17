import { CancellationToken, commands, EventEmitter, ExtensionContext, extensions, TreeDataProvider, TreeItem, workspace } from "vscode";
import { act } from "../../extension";
import { GithubLocalActionsTreeItem } from "../githubLocalActionsTreeItem";
import HistoryTreeItem from "./history";

export default class HistoryTreeDataProvider implements TreeDataProvider<GithubLocalActionsTreeItem> {
    private _onDidChangeTreeData = new EventEmitter<GithubLocalActionsTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
    static VIEW_ID = 'history';

    constructor(context: ExtensionContext) {
        extensions.onDidChange(e => {
            this.refresh();
        });

        context.subscriptions.push(
            commands.registerCommand('githubLocalActions.refreshHistory', async () => {
                this.refresh();
            })
        );
    }

    refresh(element?: GithubLocalActionsTreeItem) {
        this._onDidChangeTreeData.fire(element);
    }

    getTreeItem(element: GithubLocalActionsTreeItem): GithubLocalActionsTreeItem | Thenable<GithubLocalActionsTreeItem> {
        return element;
    }

    async resolveTreeItem(item: TreeItem, element: GithubLocalActionsTreeItem, token: CancellationToken): Promise<GithubLocalActionsTreeItem> {
        if (element.getToolTip) {
            element.tooltip = await element.getToolTip();
        }

        return element;
    }

    async getChildren(element?: GithubLocalActionsTreeItem): Promise<GithubLocalActionsTreeItem[]> {
        if (element) {
            return element.getChildren();
        } else {
            const items: GithubLocalActionsTreeItem[] = [];

            const workspaceFolders = workspace.workspaceFolders;
            if (workspaceFolders && workspaceFolders.length > 0) {
                const workspaceHistory = act.workspaceHistory[workspaceFolders[0].uri.fsPath]; //TODO: Fix for multi workspace support
                if (workspaceHistory) {
                    for (const history of workspaceHistory) {
                        items.push(new HistoryTreeItem(history));
                    }
                }
            }

            await commands.executeCommand('setContext', 'githubLocalActions:noHistory', items.length == 0);
            return items;
        }
    }
}