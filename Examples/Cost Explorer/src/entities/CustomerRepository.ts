import { Customer } from "./Customer";

export class CustomerRepository {
  private customers: Record<string, Customer> = {};

  addCustomer(customer: Customer) {
    this.customers[customer.id] = customer;
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers[id];
  }
}