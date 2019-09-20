/**
 * A Slack message action wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a request from Slack message actions.
 */
export interface MessageAction {
    type: 'message_action';
    callback_id: string;
    trigger_id: string;
    message_ts: string;
    response_url: string;
    message: {
        type: 'message';
        user?: string;
        ts: string;
        text?: string;
        [key: string]: any;
    };
    user: {
        id: string;
        name: string;
        team_id?: string;
    };
    channel: {
        id: string;
        name: string;
    };
    team: {
        id: string;
        domain: string;
        enterprise_id?: string;
        enterprise_name?: string;
    };
    token: string;
    action_ts: string;
}
//# sourceMappingURL=message-action.d.ts.map