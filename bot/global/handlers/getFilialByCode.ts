import {getFilials} from "./index";
import {createFilialFromData} from "../helpers";

const getFilialByCode = async (code:string) => {
    const filialsDataArr = await getFilials()
    const filialData = filialsDataArr.find(f=>f.value === code)
    if (!filialData) {
        return null
    } else {
        return createFilialFromData(filialData)
    }
}

export default getFilialByCode;