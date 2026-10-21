import {TUser} from "../../../types/global/TUser";

export type CrmUserRow = {
    id: string
    "6": string
    "7": string
    "8": string
    "9": string
    "3732_db_value": string
    "3732": string[]
    "3733": string
};

export default function createUserFromData(data: CrmUserRow): TUser {
    return {
        id: data.id,
        access_group:data["6"],
        mail: data["9"],
        name: data["7"].concat(" ", data["8"]),
        filial_code: data["3732_db_value"],
        filial_name: data["3732"].join(", "),
        chat_id: Number(data["3733"])
    }
}