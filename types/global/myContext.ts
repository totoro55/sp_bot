import {Api, Context, SessionFlavor} from "grammy";
import {HydrateFlavor} from "@grammyjs/hydrate";
import {FileApiFlavor, FileFlavor} from "@grammyjs/files";
import {Conversation, ConversationFlavor} from "@grammyjs/conversations";
import {TUser} from "./TUser";
import {TFilial} from "./TFilial";
import {ReportPeriod} from "../marketing/ReportPeriod";
import {MarketingReport} from "../marketing/MarketingReport";

export interface SessionData {
    user: TUser | null;
    auth_expires_in: number;
    selected_filial: TFilial | null
    marketing_report_period: ReportPeriod | null
    marketing_report_files: [] | string[]
    marketing_report: null | MarketingReport
}

export type MyContext = FileFlavor<ConversationFlavor<HydrateFlavor<Context>>> & SessionFlavor<SessionData>;

export type MyApi = FileApiFlavor<Api>;

export type MyConversationContext = MyContext;
export type MyConversation = Conversation<MyContext, MyConversationContext>;