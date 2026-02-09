import axios from "axios";

export const getContacts = async ({userId}: {userId: string}) => {
    const response = await axios.post("http://localhost:5173/getContacts", {userId})
    return response.data;
}

export const saveLoggedInData = async ({ clientId }: { clientId: string }) => {
    const response = await axios.post("http://localhost:5173/saveLoggedInData", {clientId})
    return response.data;
}

export const accountsController = async ({action, payload}: {action: string, payload: any}) => {
    const response = await axios.post("http://localhost:5173/getContacts", {action, payload})
    return response.data;
}

// export const getContacts = async ({userId}: string) => {
//     const response = await axios.post("http://localhost:5173/getContacts", userId)
//     return response.data;
// }