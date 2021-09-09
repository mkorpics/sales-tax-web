import { ItemType } from "@/models/ItemType";
import axios, { AxiosResponse } from "axios";

export class ITStore {
    private baseControllerUrl: string = 'https://localhost:44335/api/ItemTypes';

    private headers: { [key: string]: string } = {
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*'
    }

    public async getAll(): Promise<ItemType[]> {
        const url: string = `${this.baseControllerUrl}`;
        const response: AxiosResponse<ItemType[]> = await axios.get(url, { headers: this.headers });

        return response.data.map((x: ItemType) => new ItemType(x));
    }
}

export const ItemTypeStore: ITStore = new ITStore();
