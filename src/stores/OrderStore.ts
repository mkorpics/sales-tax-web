import { Order } from "@/models/Order";
import axios, { AxiosResponse } from "axios";

export class OStore {
    private baseControllerUrl = "https://localhost:44335/api/Orders";

    private headers: { [key: string]: string } = {
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*'
    }

    public async getAll(): Promise<Order[]> {
        const url: string = `${this.baseControllerUrl}`;
        const response: AxiosResponse<Order[]> = await axios.get(url, { headers: this.headers });

        return response.data.map((x: Order) => new Order(x));
    }

    public async get(orderId: string | number): Promise<Order> {
        const url: string = `${this.baseControllerUrl}/${orderId}`;
        const response: AxiosResponse<Order> = await axios.get(url, { headers: this.headers });

        return new Order(response.data);
    }

    public async create(itemIds: number[]): Promise<Order> {
        const url: string = `${this.baseControllerUrl}`;
        const response: AxiosResponse<Order> = await axios.post(url, itemIds, { headers: this.headers });

        return new Order(response.data);
    }
}

export const OrderStore: OStore = new OStore();
