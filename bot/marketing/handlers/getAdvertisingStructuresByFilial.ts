import {TFilial} from "../../../types/global/TFilial";
import {createCrm} from "../../../api/crm";

export default async function getAdvertisingStructuresByFilial(filial: TFilial) {
    const crm = createCrm()

    const params = {
        entity_id: 212,
        select_fields: "3713, 3711, 3710, 3715, 3716",
        filters: {
            "3709": {
                value: filial.id,
                condition: "include"
            }
        }
    }

    try {
        return await crm.getData(params)
    } catch (e) {
        throw new Error(JSON.stringify(e))
    }
}