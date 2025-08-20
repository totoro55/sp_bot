import {TFilial} from "../../../types/global/TFilial";

const createFilialFromData =
    (data: { [p: string]: any }):TFilial => {
return {
    id: Number(data.id),
    parent_id: Number(data.parent_id),
    is_active: data.is_active == "1",
    name: data.name,
    code: data.value
}
    }

export default createFilialFromData;