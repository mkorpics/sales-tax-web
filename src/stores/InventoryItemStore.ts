import { InventoryItem } from "@/models/InventoryItem";
import { InventoryItemInput } from "@/models/InventoryItemInput";
import axios, { AxiosResponse } from "axios";

export class IIStore {
    private baseControllerUrl: string = 'https://localhost:44335/api/InventoryItems';

    private headers: { [key: string]: string } = {
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*'
    }

    public async getAll(): Promise<InventoryItem[]> {
        const url: string = `${this.baseControllerUrl}`;
        const response: AxiosResponse<InventoryItem[]> = await axios.get(url, { headers: this.headers });

        return response.data.map((x: InventoryItem) => new InventoryItem(x));
    }

    public async create(input: InventoryItemInput): Promise<InventoryItem> {
        const url: string = `${this.baseControllerUrl}`;
        const response: AxiosResponse<InventoryItem> = await axios.post(url, input, { headers: this.headers });

        return new InventoryItem(response.data);
    }

    public async delete(itemId: number): Promise<void> {
        const url: string = `${this.baseControllerUrl}/${itemId}`;
        await axios.delete(url, { headers: this.headers });
    }
}

export const InventoryItemStore: IIStore = new IIStore();
