import { PurchaseItem } from "@/models/PurchaseItem";
import axios, { AxiosResponse } from "axios";

export class SCIStore {
    private baseControllerUrl: string = 'https://localhost:44335/api/ShoppingCartItems';

    private headers: { [key: string]: string } = {
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*'
    }

    public async getAll(): Promise<PurchaseItem[]> {
        const url: string = `${this.baseControllerUrl}`;
        const response: AxiosResponse<PurchaseItem[]> = await axios.get(url);

        return response.data.map((x: PurchaseItem) => new PurchaseItem(x));
    }

    public async addItem(inventoryItemId: number): Promise<PurchaseItem> {
        const url: string = `${this.baseControllerUrl}/AddInventory`;
        const response: AxiosResponse<PurchaseItem> = await axios.put(url, inventoryItemId, { headers: { ...this.headers, 'Content-Type': 'application/json' } });

        return new PurchaseItem(response.data);
    }

    public async delete(purchaseItemId: number): Promise<void> {
        const url: string = `${this.baseControllerUrl}/${purchaseItemId}`;
        await axios.delete(url, { headers: this.headers });
    }
}

export const ShoppingCartItemStore: SCIStore = new SCIStore();
