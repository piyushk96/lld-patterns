import { Customer } from "./Customer";
import { CustomerRepository } from "./CustomerRepository";

export class CostExplorer {
  private customerRepository: CustomerRepository;

  constructor(custRepo: CustomerRepository) {
    this.customerRepository = custRepo;
  }

  getMonthlyCost(customer: Customer) {
    return customer.subscriptions.reduce((sum, sub) => {
      return sum + sub.getMonthlyCost();
    }, 0)
  }

  getYearlyCost(customer: Customer) {
    return this.getMonthlyCost(customer) * 12;
  }

  getCost(customerId: string) {
    const customer = this.customerRepository.getCustomerById(customerId);
    if (!customer) throw new Error("Customer not found");

    const monthly = this.getMonthlyCost(customer);
    const yearly = this.getYearlyCost(customer);
    console.log("Monthly: ", monthly);
    console.log("Yearly: ", yearly);
  }
}