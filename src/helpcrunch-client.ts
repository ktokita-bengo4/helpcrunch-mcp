const BASE_URL = "https://api.helpcrunch.com/v1";

export class HelpCrunchClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HelpCrunch API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  async listChats(params: {
    offset?: number;
    limit?: number;
    sort?: string;
    order?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.offset != null) query.set("offset", String(params.offset));
    if (params.limit != null) query.set("limit", String(params.limit));
    if (params.sort) query.set("sort", params.sort);
    if (params.order) query.set("order", params.order);
    const qs = query.toString();
    return this.request<any>("GET", `/chats${qs ? `?${qs}` : ""}`);
  }

  async searchChats(filter: {
    status?: string;
    customerEmail?: string;
    limit?: number;
    offset?: number;
  }) {
    const conditions: any[] = [];
    if (filter.status) {
      conditions.push({
        field: "chats.status",
        operator: "=",
        value: filter.status,
      });
    }
    if (filter.customerEmail) {
      conditions.push({
        field: "chats.customer.email",
        operator: "~",
        value: filter.customerEmail,
      });
    }

    return this.request<any>("POST", "/chats/search", {
      filter: conditions,
      comparison: "AND",
      limit: filter.limit ?? 20,
      offset: filter.offset ?? 0,
      sort: "chats.lastMessageAt",
      order: "DESC",
    });
  }

  async getChatMessages(chatId: number, params: {
    offset?: number;
    limit?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.offset != null) query.set("offset", String(params.offset));
    if (params.limit != null) query.set("limit", String(params.limit));
    const qs = query.toString();
    return this.request<any>(
      "GET",
      `/chats/${chatId}/messages${qs ? `?${qs}` : ""}`
    );
  }

  async searchCustomers(filter: {
    email?: string;
    name?: string;
    limit?: number;
    offset?: number;
  }) {
    const conditions: any[] = [];
    if (filter.email) {
      conditions.push({
        field: "customers.email",
        operator: "~",
        value: filter.email,
      });
    }
    if (filter.name) {
      conditions.push({
        field: "customers.name",
        operator: "~",
        value: filter.name,
      });
    }

    return this.request<any>("POST", "/customers/search", {
      filter: conditions,
      comparison: "AND",
      limit: filter.limit ?? 20,
      offset: filter.offset ?? 0,
      sort: "customers.lastSeen",
      order: "DESC",
    });
  }

  async getCustomer(customerId: number) {
    return this.request<any>("GET", `/customers/${customerId}`);
  }
}
