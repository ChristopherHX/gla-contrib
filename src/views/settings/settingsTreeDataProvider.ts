import { CancellationToken, commands, EventEmitter, ExtensionContext, TreeDataProvider, TreeItem } from "vscode";
import { act } from "../../extension";
import { GithubLocalActionsTreeItem } from "../githubLocalActionsTreeItem";
import ContainerEnginesTreeItem from "./containerEngines";
import EnvironmentsTreeItem from "./environments";
import InputsTreeItem from "./inputs";
import RunnersTreeItem from "./runners";
import SecretsTreeItem from "./secrets";
import VariablesTreeItem from "./variables";

export default class SettingsTreeDataProvider implements TreeDataProvider<GithubLocalActionsTreeItem> {
    private _onDidChangeTreeData = new EventEmitter<GithubLocalActionsTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
    static VIEW_ID = 'settings';

    constructor(context: ExtensionContext) {
        context.subscriptions.push(
            commands.registerCommand('githubLocalActions.refreshSettings', async () => {
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

            const workflows = await act.workflowsManager.getWorkflows();
            if (workflows.length > 0) {
                items.push(...[
                    new EnvironmentsTreeItem(),
                    new SecretsTreeItem(),
                    new VariablesTreeItem(),
                    new InputsTreeItem(),
                    new RunnersTreeItem(),
                    new ContainerEnginesTreeItem()
                ]);
            }

            await commands.executeCommand('setContext', 'githubLocalActions:noSettings', items.length == 0);
            return items;
        }
    }
}