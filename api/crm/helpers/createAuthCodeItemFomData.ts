import {AuthKeyItem} from "../../../types/global/AuthKeyItem";

export default function createAuthCodeItemFomData(data:{[key:string]:string}):AuthKeyItem{
    return {
        id:Number(data.id),
        chatId:Number(data["3761"]),
        userId: data["3762_db_value"],
        expiresIn:Number(data["3763"]),
        activated:!!Number(data["3766"]),
        authCode:data["3764"],
    }
}