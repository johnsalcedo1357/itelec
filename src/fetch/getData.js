import { client , client2 } from "../api/client.js"

export const getData = async () => {
    try {
        const { data } = await client.get('')
            return data
     } catch (e) {
            console.error(e.name + "<br>" + e.message);
            return []
        }
    }
export const getSecondData = async () => {
   try {
        const { data } = await client2.get('')
            return data
    } catch (e) {
            console.error(e.name + "<br>" + e.message);
            return []
        }
}