import axios from 'axios'

export const client = axios.create({
    baseURL:"https://67efcadc2a80b06b8895c6ad.mockapi.io/manga1"
});

export const client2 = axios.create({
    baseURL:"https://67efcadc2a80b06b8895c6ad.mockapi.io/manga2"
});